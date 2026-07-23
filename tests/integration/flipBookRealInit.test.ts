// C-03 実page-flip初期化パスのカバレッジ（jsdom環境での実行結果は成功/フォールバックいずれも許容する。
// 実ブラウザでの最終確認はE2E-01〜03がPlaywrightで担当する）
import { beforeEach, describe, expect, it } from 'vitest';
import { buildPages } from '../../src/core/pageModel';
import { mount } from '../../src/ui/flipBookView';
import type { Member } from '../../src/core/types';

function makeMembers(count: number): Member[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `m${String(i + 1).padStart(3, '0')}`,
    name: `会員${i + 1}`,
    bio: '',
    links: [],
  }));
}

describe('FlipBookView 実page-flip初期化', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="flipbook"></div>';
  });

  it('__forceInitErrorForTestを指定しない場合、page-flipの初期化を試みる（成功/フォールバックいずれも有効なハンドルを返す）', () => {
    const container = document.getElementById('flipbook') as HTMLElement;
    const { pages, memberIndex } = buildPages(makeMembers(3));

    let initErrorCaught = false;
    const handle = mount(container, pages, memberIndex, {
      onInitError: () => {
        initErrorCaught = true;
      },
    });

    expect(handle.getPageCount()).toBeGreaterThan(0);
    expect(typeof handle.flipNext).toBe('function');
    // jsdomでpage-flipが例外を投げた場合はフォールバックに切り替わっていることを確認
    if (initErrorCaught) {
      expect(handle.isFallback()).toBe(true);
    }
  });
});
