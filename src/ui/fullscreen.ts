// C-07 FullscreenController（SDD.md 第1章）
// FR-SYS-009: 全画面表示への切り替え（Fullscreen API未対応時はボタン非表示）

export function bindFullscreenToggle(button: HTMLButtonElement, target: HTMLElement): () => void {
  if (!document.fullscreenEnabled) {
    button.style.display = 'none';
    return () => {};
  }

  const onClick = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      target.requestFullscreen().catch(() => {
        // Fullscreen APIがユーザー操作以外から呼ばれた等の理由で拒否された場合は静かに無視する
      });
    }
  };
  button.addEventListener('click', onClick);
  return () => button.removeEventListener('click', onClick);
}
