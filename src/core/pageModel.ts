// C-02 PageModel（SDD.md 第1章）
// FR-SYS-001/002/003/007: 表紙・目次(N分割)・会員ページの論理ページ列を生成する

import type { Member, Page } from './types';

export const MEMBERS_PER_TOC_PAGE = 10;

export interface PageModelResult {
  pages: Page[];
  /** 会員ID → その会員ページのグローバルページ番号（目次からのジャンプ計算に使用） */
  memberIndex: Map<string, number>;
}

export function buildPages(members: Member[]): PageModelResult {
  const pages: Page[] = [{ type: 'cover' }];

  const tocChunks = chunk(members, MEMBERS_PER_TOC_PAGE);
  if (tocChunks.length === 0) {
    // 会員データが0件でも「準備中」の目次ページを1枚生成する（FR-SYS-002例外条件）
    pages.push({ type: 'toc', members: [], tocPageIndex: 0, tocPageCount: 1 });
  } else {
    tocChunks.forEach((chunkMembers, i) => {
      pages.push({ type: 'toc', members: chunkMembers, tocPageIndex: i, tocPageCount: tocChunks.length });
    });
  }

  const memberIndex = new Map<string, number>();
  members.forEach((member) => {
    memberIndex.set(member.id, pages.length);
    pages.push({ type: 'member', member });
  });

  return { pages, memberIndex };
}

/** 表紙の直後、最初の目次ページのグローバルページ番号（常に1） */
export const FIRST_TOC_PAGE_INDEX = 1;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}
