// C-09 TemplateRenderer（SDD.md 第1章、Round1レビュー指摘F-C2対応で正式追加）
// FR-SYS-001/002/003: 表紙・目次・会員ページのHTML生成

import type { Member, Page } from '../core/types';
import { siteConfig } from '../config/site';
import { escapeHtml } from './escape';
import { renderLink } from './linkRenderer';

export function renderPage(page: Page, memberIndex: Map<string, number>): string {
  switch (page.type) {
    case 'cover':
      return renderCover();
    case 'toc':
      return renderToc(page, memberIndex);
    case 'member':
      return renderMember(page.member);
    default: {
      const exhaustive: never = page;
      throw new Error(`未知のページ種別: ${JSON.stringify(exhaustive)}`);
    }
  }
}

function renderCover(): string {
  return `
    <div class="mb-cover">
      <h1 class="mb-cover__title">${escapeHtml(siteConfig.title)}</h1>
      <p class="mb-cover__hint">${escapeHtml(siteConfig.coverHint)}</p>
    </div>
  `;
}

function renderToc(page: Extract<Page, { type: 'toc' }>, memberIndex: Map<string, number>): string {
  if (page.members.length === 0) {
    // FR-SYS-002例外条件: 会員データ0件時
    return `
      <div class="mb-toc">
        <h2 class="mb-toc__title">目次</h2>
        <p class="mb-toc__empty">会員情報は準備中です</p>
      </div>
    `;
  }

  const items = page.members
    .map((member) => {
      const jumpIndex = memberIndex.get(member.id);
      return `<li><a href="#" class="mb-toc__link" data-jump-index="${jumpIndex}">${escapeHtml(member.name)}</a></li>`;
    })
    .join('');

  return `
    <div class="mb-toc">
      <h2 class="mb-toc__title">目次</h2>
      <ul class="mb-toc__list">${items}</ul>
      <p class="mb-toc__page">目次 ${page.tocPageIndex + 1} / ${page.tocPageCount}</p>
    </div>
  `;
}

function renderMember(member: Member): string {
  // FR-SYS-003例外条件（Round1レビュー指摘F-C3対応）:
  // bio空文字は空要素として描画、links 0件はリンク欄自体を非表示にする
  const bioHtml = `<p class="mb-member__bio">${escapeHtml(member.bio)}</p>`;
  const linksHtml =
    member.links.length > 0
      ? `<ul class="mb-member__links">${member.links.map((link) => `<li>${renderLink(link)}</li>`).join('')}</ul>`
      : '';

  return `
    <div class="mb-member">
      <h2 class="mb-member__name">${escapeHtml(member.name)}</h2>
      ${bioHtml}
      ${linksHtml}
      <a href="#" class="mb-member__back" data-action="toc">← 目次へ戻る</a>
    </div>
  `;
}
