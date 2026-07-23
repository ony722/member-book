// C-03(フォールバックモード)+C-04+C-08 結合テスト
// jsdomではpage-flipの実描画（Canvas/複雑なDOMレイアウト計算）を安定して再現できないため、
// __forceInitErrorForTestでフォールバックパス（E2E-04と同一コードパス）を用いて
// ナビゲーション・ページインジケータのロジックを検証する。
// E2E-02（最小構成）・E2E-03（最大規模）の境界条件もここでロジックレベルに検証する
// （Round1レビュー後のテスト戦略として、実ブラウザ描画が必須でないロジックはIntegrationで担保する）
import { beforeEach, describe, expect, it } from 'vitest';
import { buildPages } from '../../src/core/pageModel';
import { mount } from '../../src/ui/flipBookView';
import { bindControls } from '../../src/ui/navigation';
import { bindPageIndicator } from '../../src/ui/pageIndicator';
import type { Member } from '../../src/core/types';

function makeMembers(count: number): Member[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `m${String(i + 1).padStart(3, '0')}`,
    name: `会員${i + 1}`,
    bio: '',
    links: [],
  }));
}

function setup(memberCount: number) {
  document.body.innerHTML = '<div id="flipbook"></div><button id="prev"></button><button id="next"></button><span id="indicator"></span>';
  const container = document.getElementById('flipbook') as HTMLElement;
  const prevBtn = document.getElementById('prev') as HTMLButtonElement;
  const nextBtn = document.getElementById('next') as HTMLButtonElement;
  const indicator = document.getElementById('indicator') as HTMLElement;

  const members = makeMembers(memberCount);
  const { pages, memberIndex } = buildPages(members);
  const handle = mount(container, pages, memberIndex, { __forceInitErrorForTest: true });
  bindControls(handle, { container, prevBtn, nextBtn, tocPageIndex: 1 });
  bindPageIndicator(handle, indicator);

  return { handle, prevBtn, nextBtn, indicator, pages };
}

describe('FlipBookView フォールバックモード + Navigation + PageIndicator', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('初期化失敗時はフォールバックモードで起動する（E2E-04相当）', () => {
    const { handle } = setup(3);
    expect(handle.isFallback()).toBe(true);
  });

  it('会員1件（最小構成）で先頭ページでは前へボタンが非活性（E2E-02相当）', () => {
    const { prevBtn, nextBtn } = setup(1);
    expect(prevBtn.disabled).toBe(true);
    expect(nextBtn.disabled).toBe(false);
  });

  it('会員1件で最終ページまで進めると次へボタンが非活性になる（E2E-02相当）', () => {
    const { handle, nextBtn } = setup(1);
    // pages: cover(0), toc(1), member(2) = 3ページ
    handle.flipNext();
    handle.flipNext();
    expect(handle.getCurrentPage()).toBe(2);
    expect(nextBtn.disabled).toBe(true);
  });

  it('会員100件（最大規模相当）でも全ページ数が正しく、目次ジャンプで会員100人目まで到達できる（E2E-03相当）', () => {
    const { handle, pages } = setup(100);
    expect(handle.getPageCount()).toBe(pages.length);
    const lastMemberPageIndex = pages.length - 1;
    handle.flipToPage(lastMemberPageIndex);
    expect(handle.getCurrentPage()).toBe(lastMemberPageIndex);
  });

  it('ページ送りに応じてページインジケータが更新される', () => {
    const { handle, indicator } = setup(3);
    expect(indicator.textContent).toBe(`1 / ${handle.getPageCount()}`);
    handle.flipNext();
    expect(indicator.textContent).toBe(`2 / ${handle.getPageCount()}`);
  });

  it('目次リンク(data-jump-index)クリックで会員ページへジャンプする（FR-SYS-007）', () => {
    const { handle } = setup(3);
    const tocLink = document.querySelector<HTMLElement>('[data-jump-index]');
    expect(tocLink).not.toBeNull();
    tocLink?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(handle.getCurrentPage()).toBeGreaterThanOrEqual(2);
  });

  it('「目次へ戻る」導線クリックで目次ページへ遷移する（FR-SYS-011）', () => {
    const { handle } = setup(3);
    handle.flipToPage(2); // 会員ページへ
    const backLink = document.querySelector<HTMLElement>('[data-action="toc"]');
    backLink?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(handle.getCurrentPage()).toBe(1);
  });

  it('キーボード右矢印キーで次ページへ遷移する（FR-SYS-006）', () => {
    const { handle } = setup(3);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(handle.getCurrentPage()).toBe(1);
  });
});
