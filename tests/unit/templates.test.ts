// TC-FR-SYS-003: 境界値（bio空文字・links0件）でも表示崩れなくレンダリングされる（E2E-06相当のロジック検証）
import { describe, expect, it } from 'vitest';
import { renderPage } from '../../src/ui/templates';
import type { Page } from '../../src/core/types';

describe('renderPage - member', () => {
  it('bioが空文字・linksが0件でもエラーなくレンダリングされ、リンク欄が出力されない', () => {
    const page: Page = {
      type: 'member',
      member: { id: 'm020', name: 'リンクなし花子', bio: '', links: [] },
    };
    const html = renderPage(page, new Map());
    expect(html).toContain('リンクなし花子');
    expect(html).not.toContain('mb-member__links');
    expect(html).not.toContain('undefined');
  });

  it('linksが1件以上ある場合はリンク欄が出力される', () => {
    const page: Page = {
      type: 'member',
      member: { id: 'm001', name: '山田太郎', bio: '自己紹介', links: [{ label: 'X', url: 'https://example.com' }] },
    };
    const html = renderPage(page, new Map());
    expect(html).toContain('mb-member__links');
  });

  it('name/bioの特殊文字がエスケープされる', () => {
    const page: Page = {
      type: 'member',
      member: { id: 'm001', name: '<b>太郎</b>', bio: '', links: [] },
    };
    const html = renderPage(page, new Map());
    expect(html).not.toContain('<b>太郎</b>');
  });
});

describe('renderPage - toc', () => {
  it('会員0件の場合は「準備中」文言を表示する', () => {
    const page: Page = { type: 'toc', members: [], tocPageIndex: 0, tocPageCount: 1 };
    const html = renderPage(page, new Map());
    expect(html).toContain('会員情報は準備中です');
  });

  it('会員名から目次ジャンプ用のdata-jump-indexが埋め込まれる', () => {
    const page: Page = {
      type: 'toc',
      members: [{ id: 'm001', name: '山田太郎', bio: '', links: [] }],
      tocPageIndex: 0,
      tocPageCount: 1,
    };
    const memberIndex = new Map([['m001', 5]]);
    const html = renderPage(page, memberIndex);
    expect(html).toContain('data-jump-index="5"');
  });
});

describe('renderPage - cover', () => {
  it('サイトタイトルを含む', () => {
    const page: Page = { type: 'cover' };
    const html = renderPage(page, new Map());
    expect(html).toContain('メンバーブック');
  });
});
