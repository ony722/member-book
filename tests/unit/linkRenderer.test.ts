// TC-FR-EXT-001 / TC-NFR-SEC-001: リンクレンダリングのセキュリティ属性検証
import { describe, expect, it } from 'vitest';
import { renderLink } from '../../src/ui/linkRenderer';

describe('renderLink', () => {
  it('target="_blank" と rel="noopener noreferrer" を必ず付与する（NFR-SEC-001）', () => {
    const html = renderLink({ label: 'X', url: 'https://example.com/a' });
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('href="https://example.com/a"');
  });

  it('label内の特殊文字をエスケープする（XSS対策、境界値: 特殊文字）', () => {
    const html = renderLink({ label: '<script>alert(1)</script>', url: 'https://example.com' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('絵文字を含むlabelも正しくレンダリングされる（境界値: 特殊文字）', () => {
    const html = renderLink({ label: '公式サイト🎉', url: 'https://example.com' });
    expect(html).toContain('🎉');
  });
});
