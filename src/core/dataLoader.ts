// C-01 DataLoader（SDD.md 第1章）
// FR-DATA-001: members.json の読み込み・スキーマ検証（CC-04: 入力バリデーション）

import type { Link, Member } from './types';

const ID_PATTERN = /^[a-zA-Z0-9-]+$/;
const URL_PATTERN = /^https?:\/\//;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * 生JSONを検証済みMember配列に変換する。
 * 不正なデータが1件でもあれば ValidationError をthrowし、ビルドを失敗させる（CC-01）。
 */
export function loadMembers(json: unknown): Member[] {
  if (!Array.isArray(json)) {
    throw new ValidationError('members.json のルートは配列である必要があります');
  }

  const seenIds = new Set<string>();
  return json.map((raw, index) => validateMember(raw, index, seenIds));
}

function validateMember(raw: unknown, index: number, seenIds: Set<string>): Member {
  if (typeof raw !== 'object' || raw === null) {
    throw new ValidationError(`members[${index}] はオブジェクトである必要があります`);
  }
  const record = raw as Record<string, unknown>;

  const id = record.id;
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) {
    throw new ValidationError(`members[${index}].id が不正です（英数字とハイフンのみ）: ${String(id)}`);
  }
  if (seenIds.has(id)) {
    throw new ValidationError(`会員IDが重複しています: ${id}`);
  }
  seenIds.add(id);

  const name = record.name;
  if (typeof name !== 'string' || name.length < 1 || name.length > 100) {
    throw new ValidationError(`member[${id}].name は1〜100文字の文字列である必要があります`);
  }

  const bio = record.bio === undefined ? '' : record.bio;
  if (typeof bio !== 'string' || bio.length > 1000) {
    throw new ValidationError(`member[${id}].bio は1000文字以内の文字列である必要があります`);
  }

  const rawLinks = record.links === undefined ? [] : record.links;
  if (!Array.isArray(rawLinks)) {
    throw new ValidationError(`member[${id}].links は配列である必要があります`);
  }
  const links = rawLinks.map((l, li) => validateLink(l, id, li));

  return { id, name, bio, links };
}

function validateLink(raw: unknown, memberId: string, index: number): Link {
  if (typeof raw !== 'object' || raw === null) {
    throw new ValidationError(`member[${memberId}].links[${index}] はオブジェクトである必要があります`);
  }
  const record = raw as Record<string, unknown>;

  const label = record.label;
  if (typeof label !== 'string' || label.length < 1 || label.length > 50) {
    throw new ValidationError(`member[${memberId}].links[${index}].label は1〜50文字の文字列である必要があります`);
  }

  const url = record.url;
  if (typeof url !== 'string' || !URL_PATTERN.test(url)) {
    throw new ValidationError(
      `member[${memberId}].links[${index}].url は http:// または https:// で始まる必要があります: ${String(url)}`,
    );
  }

  return { label, url };
}
