# 実地検証ログ（EV-BUILD-PAGEFLIP-001）

Round1レビュー指摘F-C5への対応として、Phase 1で実施した実地検証のログを本ファイルに保存し、Evidence IDから再現可能にする。

## 検証環境
- 実施日: 2026-07-23
- Node.js: v25.2.1
- npm: 11.12.1
- Vite: 8.1.5
- TypeScript: 6.0.2

## 実行コマンドと結果

```
$ npm create vite@latest . -- --template vanilla-ts
✔ Scaffolding project ... Done.

$ npm install page-flip
added 17 packages, and audited 18 packages in 7s
found 0 vulnerabilities

$ npm run build
> tsc && vite build
src/main.ts(1,26): error TS7016: Could not find a declaration file for module 'page-flip'.
Try `npm i --save-dev @types/page-flip` if it exists or add a new declaration (.d.ts) file containing `declare module 'page-flip';`

$ npm install --save-dev @types/page-flip
added 2 packages, and audited 20 packages in 781ms
found 0 vulnerabilities

$ npm run build
> tsc && vite build
vite v8.1.5 building client environment for production...
✓ 5 modules transformed.
dist/index.html                 0.39 kB │ gzip:  0.27 kB
dist/assets/index-ChEp7gNY.js  44.60 kB │ gzip: 10.82 kB
✓ built in 34ms
```

## 結論
- `page-flip`（^2.0.7）はNode v25 / Vite 8 / TypeScript 6環境で依存関係エラーなくインストール・ビルド可能
- ただし公式の型定義が同梱されていないため`@types/page-flip`の追加インストールが必須（運用上の注意点としてSDD/research_v2.mdに記録済み）
- バンドルサイズ実測: 44.60KB（gzip 10.82KB）

## 未検証事項（Round1レビュー指摘F-C5で判明した残課題）
- 本プロジェクトが公式サポート宣言する下限環境（Node 20 LTS、TypeScript 5系）そのものでの検証は未実施（今回はNode v25/TS6という最新版環境でのみ検証）
- **Phase 6実装着手前のTODO**: GitHub Actions CI（`actions/setup-node@v4`でNode 20 LTSを指定）上で本検証と同じ手順（`npm install` → `npm run build`）を実行し成功することを確認する。これをTEST_PLAN.md 6章Entry Criteriaに追加済み
