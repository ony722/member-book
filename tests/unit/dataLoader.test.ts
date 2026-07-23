// TC-FR-DATA-001: members.json のスキーマ検証（境界値8カテゴリ準拠）
import { describe, expect, it } from 'vitest';
import { loadMembers, ValidationError } from '../../src/core/dataLoader';

describe('loadMembers', () => {
  it('正常な会員データを読み込める（正常系）', () => {
    const members = loadMembers([
      { id: 'm001', name: '山田太郎', bio: '自己紹介', links: [{ label: 'X', url: 'https://example.com/a' }] },
    ]);
    expect(members).toHaveLength(1);
    expect(members[0].id).toBe('m001');
  });

  it('bio省略時は空文字になる（Should境界: 最小値=省略）', () => {
    const members = loadMembers([{ id: 'm001', name: '山田太郎' }]);
    expect(members[0].bio).toBe('');
    expect(members[0].links).toEqual([]);
  });

  it('bioが空文字でも許容される（境界値: 最小値0文字）', () => {
    const members = loadMembers([{ id: 'm001', name: '山田太郎', bio: '' }]);
    expect(members[0].bio).toBe('');
  });

  it('bioが1000文字ちょうどは許容される（境界値: 最大値）', () => {
    const bio = 'あ'.repeat(1000);
    const members = loadMembers([{ id: 'm001', name: '山田太郎', bio }]);
    expect(members[0].bio).toHaveLength(1000);
  });

  it('bioが1001文字はエラー（境界値: 最大値+1）', () => {
    const bio = 'あ'.repeat(1001);
    expect(() => loadMembers([{ id: 'm001', name: '山田太郎', bio }])).toThrow(ValidationError);
  });

  it('nameが空文字はエラー（境界値: 空）', () => {
    expect(() => loadMembers([{ id: 'm001', name: '' }])).toThrow(ValidationError);
  });

  it('nameが未指定（型不正）はエラー', () => {
    expect(() => loadMembers([{ id: 'm001', name: 123 }])).toThrow(ValidationError);
  });

  it('idが英数字・ハイフン以外を含む場合はエラー', () => {
    expect(() => loadMembers([{ id: 'm 001!', name: '山田太郎' }])).toThrow(ValidationError);
  });

  it('idが重複する場合はエラー', () => {
    expect(() =>
      loadMembers([
        { id: 'm001', name: '山田太郎' },
        { id: 'm001', name: '鈴木花子' },
      ]),
    ).toThrow(ValidationError);
  });

  it('絵文字を含むnameは許容される（境界値: 特殊文字）', () => {
    const members = loadMembers([{ id: 'm001', name: '山田太郎🎉' }]);
    expect(members[0].name).toContain('🎉');
  });

  it('links内のurlがhttp/https以外(javascript:)の場合はエラー（NFR-SEC-001/C-SEC-002）', () => {
    expect(() =>
      loadMembers([{ id: 'm001', name: '山田太郎', links: [{ label: '不正', url: 'javascript:alert(1)' }] }]),
    ).toThrow(ValidationError);
  });

  it('links内のlabelが空文字の場合はエラー', () => {
    expect(() =>
      loadMembers([{ id: 'm001', name: '山田太郎', links: [{ label: '', url: 'https://example.com' }] }]),
    ).toThrow(ValidationError);
  });

  it('ルートが配列でない場合はエラー（型不正）', () => {
    expect(() => loadMembers({ notAnArray: true })).toThrow(ValidationError);
  });

  it('会員が0件でもエラーにならない（境界値: 空配列）', () => {
    expect(loadMembers([])).toEqual([]);
  });

  it('会員要素がnullの場合はエラー（型不正）', () => {
    expect(() => loadMembers([null])).toThrow(ValidationError);
  });

  it('linksが配列でない場合はエラー（型不正）', () => {
    expect(() => loadMembers([{ id: 'm001', name: '山田太郎', links: 'not-array' }])).toThrow(ValidationError);
  });

  it('links要素がnullの場合はエラー（型不正）', () => {
    expect(() => loadMembers([{ id: 'm001', name: '山田太郎', links: [null] }])).toThrow(ValidationError);
  });
});
