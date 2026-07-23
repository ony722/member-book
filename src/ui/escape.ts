// BC-3（文字コード）・NFR-SEC対策の共通HTMLエスケープユーティリティ

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char] ?? char);
}

export function escapeAttr(input: string): string {
  return escapeHtml(input);
}
