// SDD.md 第3章「データビュー」に対応する型定義

export interface Link {
  label: string;
  url: string;
}

export interface Member {
  id: string;
  name: string;
  bio: string;
  links: Link[];
}

export type Page =
  | { type: 'cover' }
  | { type: 'toc'; members: Member[]; tocPageIndex: number; tocPageCount: number }
  | { type: 'member'; member: Member };
