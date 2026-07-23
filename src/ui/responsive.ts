// C-05 ResponsiveController（SDD.md 第1章）
// FR-SYS-010: リサイズ時の再計算フック（page-flipのsize:'stretch'が主対応。本関数は将来の拡張余地として
// 200msデバウンスされたリサイズ通知を提供する。プロセスビュー「並行処理」参照）

export function observeResize(onResize: () => void, debounceMs = 200): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const handler = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(onResize, debounceMs);
  };

  window.addEventListener('resize', handler);
  return () => {
    window.removeEventListener('resize', handler);
    if (timer) clearTimeout(timer);
  };
}
