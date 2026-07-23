// C-03 FlipBookView（SDD.md 第1章）
// FR-SYS-004: page-flip によるめくりアニメーション
// SDD.md「エラーハンドリングフロー」: 初期化失敗時はボタンのみのフォールバックUIに切り替える

import { PageFlip } from 'page-flip';
import type { SizeType, WidgetEvent } from 'page-flip';
import type { Page } from '../core/types';

// 実装時の発見（Phase 6, 2026-07-23）: page-flip@2.0.7 の実行時バンドル（dist/js/page-flip.browser.js）は
// `PageFlip` クラスのみをエクスポートし、`SizeType` 列挙型を実行時値としてエクスポートしていない
// （@types/page-flip の型定義とビルド成果物が不一致。RISK-001「5年間更新なし」の懸念が実際に顕在化した例）。
// SizeType は文字列列挙型（STRETCH = "stretch"）なので、リテラル文字列を型キャストして代用する。
const STRETCH_SIZE = 'stretch' as SizeType;
import { renderPage } from './templates';

export interface FlipBookOptions {
  onInitError?: (error: unknown) => void;
  /** テスト専用フラグ（E2E-04）。URLクエリ経由でmain.tsから渡される */
  __forceInitErrorForTest?: boolean;
}

export interface FlipBookHandle {
  flipNext(): void;
  flipPrev(): void;
  flipToPage(pageIndex: number): void;
  destroy(): void;
  onFlip(callback: (currentPage: number) => void): () => void;
  getPageCount(): number;
  getCurrentPage(): number;
  isFallback(): boolean;
}

export function mount(
  container: HTMLElement,
  pages: Page[],
  memberIndex: Map<string, number>,
  options: FlipBookOptions = {},
): FlipBookHandle {
  container.innerHTML = pages
    .map((page, i) => `<div class="page" data-page-index="${i}">${renderPage(page, memberIndex)}</div>`)
    .join('');
  const pageEls = container.querySelectorAll<HTMLElement>('.page');

  try {
    if (options.__forceInitErrorForTest) {
      throw new Error('[test] forced page-flip init error (E2E-04)');
    }
    return mountPageFlip(container, pageEls);
  } catch (error) {
    options.onInitError?.(error);
    return mountFallback(pageEls);
  }
}

function mountPageFlip(container: HTMLElement, pageEls: NodeListOf<HTMLElement>): FlipBookHandle {
  const pageFlip = new PageFlip(container, {
    width: 480,
    height: 640,
    size: STRETCH_SIZE,
    minWidth: 280,
    maxWidth: 1200,
    minHeight: 400,
    maxHeight: 1600,
    showCover: true,
    mobileScrollSupport: false,
    maxShadowOpacity: 0.5,
  });
  pageFlip.loadFromHTML(pageEls);

  const listeners: Array<(current: number) => void> = [];
  pageFlip.on('flip', (event: WidgetEvent) => {
    const current = typeof event.data === 'number' ? event.data : pageFlip.getCurrentPageIndex();
    listeners.forEach((cb) => cb(current));
  });

  return {
    flipNext: () => pageFlip.flipNext(),
    flipPrev: () => pageFlip.flipPrev(),
    flipToPage: (pageIndex: number) => pageFlip.flip(pageIndex),
    destroy: () => pageFlip.destroy(),
    onFlip: (callback) => {
      listeners.push(callback);
      return () => {
        const idx = listeners.indexOf(callback);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },
    getPageCount: () => pageFlip.getPageCount(),
    getCurrentPage: () => pageFlip.getCurrentPageIndex(),
    isFallback: () => false,
  };
}

/**
 * フォールバックUI（SDD.md エラーハンドリングフロー）。
 * page-flip が初期化できない場合でも FR-SYS-005（次へ/前へボタン）相当の閲覧を保証する。
 */
function mountFallback(pageEls: NodeListOf<HTMLElement>): FlipBookHandle {
  const total = pageEls.length;
  let current = 0;
  const listeners: Array<(current: number) => void> = [];

  const show = (index: number) => {
    pageEls.forEach((el, i) => {
      el.style.display = i === index ? 'block' : 'none';
    });
    current = index;
    listeners.forEach((cb) => cb(current));
  };
  show(0);

  return {
    flipNext: () => {
      if (current < total - 1) show(current + 1);
    },
    flipPrev: () => {
      if (current > 0) show(current - 1);
    },
    flipToPage: (pageIndex: number) => {
      if (pageIndex >= 0 && pageIndex < total) show(pageIndex);
    },
    destroy: () => {
      /* フォールバックUIはDOM要素のクリーンアップ不要（page-flip未初期化のため） */
    },
    onFlip: (callback) => {
      listeners.push(callback);
      return () => {
        const idx = listeners.indexOf(callback);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },
    getPageCount: () => total,
    getCurrentPage: () => current,
    isFallback: () => true,
  };
}
