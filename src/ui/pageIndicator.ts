// C-08 PageIndicator（SDD.md 第1章）
// FR-SYS-008: 現在ページ番号/総ページ数の表示更新

import type { FlipBookHandle } from './flipBookView';

export function bindPageIndicator(handle: FlipBookHandle, element: HTMLElement): () => void {
  const update = (current: number) => {
    const total = handle.getPageCount();
    element.textContent = total > 0 ? `${current + 1} / ${total}` : '準備中';
  };
  const unsubscribe = handle.onFlip(update);
  update(handle.getCurrentPage());
  return unsubscribe;
}
