// TC-FR-SYS-001/002/003/007: ページ列生成ロジック
import { describe, expect, it } from 'vitest';
import { buildPages, MEMBERS_PER_TOC_PAGE } from '../../src/core/pageModel';
import type { Member } from '../../src/core/types';

function makeMembers(count: number): Member[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `m${String(i + 1).padStart(3, '0')}`,
    name: `会員${i + 1}`,
    bio: '',
    links: [],
  }));
}

describe('buildPages', () => {
  it('会員0件でも表紙+準備中の目次1枚を生成する（境界値: 空）', () => {
    const { pages } = buildPages([]);
    expect(pages[0]).toEqual({ type: 'cover' });
    expect(pages[1]).toMatchObject({ type: 'toc', members: [] });
    expect(pages).toHaveLength(2);
  });

  it('会員1件（最小構成）で表紙+目次1枚+会員1枚を生成する（E2E-02相当）', () => {
    const { pages, memberIndex } = buildPages(makeMembers(1));
    expect(pages).toHaveLength(3); // cover + toc(1) + member(1)
    expect(pages[2]).toMatchObject({ type: 'member' });
    expect(memberIndex.get('m001')).toBe(2);
  });

  it(`目次は${MEMBERS_PER_TOC_PAGE}件ごとに分割される`, () => {
    const { pages } = buildPages(makeMembers(MEMBERS_PER_TOC_PAGE + 1));
    const tocPages = pages.filter((p) => p.type === 'toc');
    expect(tocPages).toHaveLength(2);
    expect(tocPages[0]).toMatchObject({ tocPageIndex: 0, tocPageCount: 2 });
    expect((tocPages[0] as Extract<(typeof pages)[number], { type: 'toc' }>).members).toHaveLength(
      MEMBERS_PER_TOC_PAGE,
    );
    expect((tocPages[1] as Extract<(typeof pages)[number], { type: 'toc' }>).members).toHaveLength(1);
  });

  it('会員100件（最大規模相当）で全会員がmemberIndexに正しく登録される（E2E-03相当）', () => {
    const members = makeMembers(100);
    const { pages, memberIndex } = buildPages(members);
    expect(memberIndex.size).toBe(100);
    members.forEach((m) => {
      const idx = memberIndex.get(m.id);
      expect(idx).toBeDefined();
      expect(pages[idx as number]).toMatchObject({ type: 'member', member: { id: m.id } });
    });
    const expectedTocPages = Math.ceil(100 / MEMBERS_PER_TOC_PAGE);
    expect(pages.filter((p) => p.type === 'toc')).toHaveLength(expectedTocPages);
  });

  it('会員20件では表紙+目次2枚+会員20枚=23ページになる', () => {
    const { pages } = buildPages(makeMembers(20));
    expect(pages).toHaveLength(1 + 2 + 20);
  });
});
