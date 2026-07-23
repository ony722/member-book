// C-04 NavigationController（SDD.md 第1章）
// FR-SYS-005/006/007/011: ボタン・キーボード・目次ジャンプ・目次への戻り導線

import type { FlipBookHandle } from './flipBookView';

export interface NavigationUI {
  container: HTMLElement;
  nextBtn?: HTMLButtonElement | null;
  prevBtn?: HTMLButtonElement | null;
  /** 「目次へ戻る」導線の遷移先（最初の目次ページのグローバル番号） */
  tocPageIndex: number;
}

export interface NavigationHandle {
  dispose(): void;
}

export function bindControls(handle: FlipBookHandle, ui: NavigationUI): NavigationHandle {
  const onNextClick = () => handle.flipNext();
  const onPrevClick = () => handle.flipPrev();
  ui.nextBtn?.addEventListener('click', onNextClick);
  ui.prevBtn?.addEventListener('click', onPrevClick);

  // FR-SYS-006: キーボード左右矢印
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      handle.flipNext();
    } else if (event.key === 'ArrowLeft') {
      handle.flipPrev();
    }
  };
  window.addEventListener('keydown', onKeyDown);

  // FR-SYS-007（目次ジャンプ）・FR-SYS-011（目次へ戻る）: イベント委譲でクリックを処理
  const onContainerClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    const jumpEl = target.closest<HTMLElement>('[data-jump-index]');
    if (jumpEl) {
      event.preventDefault();
      const jumpIndex = Number(jumpEl.dataset.jumpIndex);
      if (!Number.isNaN(jumpIndex)) {
        handle.flipToPage(jumpIndex);
      }
      return;
    }

    const backEl = target.closest<HTMLElement>('[data-action="toc"]');
    if (backEl) {
      event.preventDefault();
      handle.flipToPage(ui.tocPageIndex);
    }
  };
  ui.container.addEventListener('click', onContainerClick);

  // FR-SYS-005例外条件: 先頭/最終ページでボタンを非活性化
  const updateButtonState = (current: number) => {
    const total = handle.getPageCount();
    if (ui.prevBtn) ui.prevBtn.disabled = current <= 0;
    if (ui.nextBtn) ui.nextBtn.disabled = current >= total - 1;
  };
  const unsubscribe = handle.onFlip(updateButtonState);
  updateButtonState(handle.getCurrentPage());

  return {
    dispose() {
      ui.nextBtn?.removeEventListener('click', onNextClick);
      ui.prevBtn?.removeEventListener('click', onPrevClick);
      window.removeEventListener('keydown', onKeyDown);
      ui.container.removeEventListener('click', onContainerClick);
      unsubscribe();
    },
  };
}
