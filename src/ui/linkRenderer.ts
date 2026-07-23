// C-06 LinkRenderer（SDD.md 第1章）
// FR-EXT-001 / NFR-SEC-001: 外部リンクを新規タブで開き、noopener/noreferrerを必ず付与する
// CONSTRAINTS.md C-SEC-001/002

import type { Link } from '../core/types';
import { escapeAttr, escapeHtml } from './escape';

export function renderLink(link: Link): string {
  const safeLabel = escapeHtml(link.label);
  const safeUrl = escapeAttr(link.url);
  return `<a class="mb-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
}
