# リサーチ V1

## 調査日: 2026-07-23
## 対象プロジェクト: メンバーブック（漫画ページめくり風・会員紹介サイト）

---

### A. ツール/MCP/OSS（ページめくりライブラリ）

| # | 調査項目 | 結果 | ソースURL | 信頼度 |
|---|---|---|---|---|
| A1 | StPageFlip（vanilla JS版、npmパッケージ名 `page-flip`） | 依存関係ゼロ、TypeScript製、MITライセンス、Canvas/HTML両モード対応、モバイル対応。最新版2.0.7 | https://github.com/Nodlik/StPageFlip / https://www.npmjs.com/package/page-flip | 高（A: GitHub公式リポジトリ・LICENSE直接確認） |
| A2 | react-pageflip（StPageFlipのReactラッパー） | MITライセンス、723 stars、TypeScript 89.7%、React hooksベース。最新版2.0.3 | https://github.com/Nodlik/react-pageflip | 高（A: GitHub公式リポジトリ直接確認） |
| A3 | Turn.js | 無償版は非商用BSDライセンス。商用利用には別途商用ライセンス購入が必要 | http://turnjs.com/get | 高（A: 公式サイト） |

### B. API/ライブラリ/利用規約

| # | 調査項目 | 結果 | ソースURL | 信頼度 |
|---|---|---|---|---|
| B1 | page-flip / react-pageflip のライセンス条件 | MIT。商用サイトへの組み込み・改変・再配布に制約なし | https://github.com/Nodlik/react-pageflip/blob/master/LICENSE | 高（A） |
| B2 | Turn.js の商用利用可否 | 無償版はNG。商用利用には有償ライセンスが必須のため今回は不採用候補 | http://turnjs.com/get | 高（A） |
| B3 | 参照サイト（ActiBook/CloudCircus）の基盤 | フリップブックビューアSaaS。共有・印刷・PDF・全画面ボタンあり。UIの「本格的な紙めくり」演出イメージの参考にする（実装をコピーするわけではない） | https://saas.actibookone.com（WebFetchで概要確認） | 中（B: 実際のUI詳細はJS SPAのため静的取得不可、概要のみ） |

### C. アーキテクチャ/コミュニティ

| # | 調査項目 | 結果 | ソースURL | 信頼度 |
|---|---|---|---|---|
| C1 | 静的サイトのホスティング選択肢 | GitHub Pages（無料・publicリポジトリのみ・帯域上限100GB/月）、Netlify（無料枠100GB/月・ビルド300分/月）、Vercel、Cloudflare Pages。いずれも静的HTMLなら性能差はほぼない | https://vite.dev/guide/static-deploy 、比較記事各種 | 高（A: Vite公式）＋中（B: 比較記事） |
| C2 | ビルドツール | Vite が静的サイト構築のデファクトスタンダード。`vite build` で `dist/` に静的出力しそのままホスティング可能 | https://vite.dev/guide/static-deploy | 高（A: Vite公式ドキュメント） |
| C3 | フリップブック系OSSの2026年動向（複数候補比較） | StPageFlip系が週間DL 36,900件超で人気優位という言及あり。ただし本記事はブログ記事であり турn.jsのライセンスを「MIT/GPL」と記載しており公式情報（非商用BSD）と矛盾する箇所がある | https://portalzine.de/open-source-page-flip-and-pdf-viewer-solutions-in-javascript-2026/ | 低（C/D: 内容に公式情報との矛盾あり。参考情報にとどめ、確定根拠には使用しない） |

### 未解決・要V2確認

| # | 項目 | 理由 | V2で何を調べるか |
|---|---|---|---|
| 1 | page-flip / react-pageflip の最終更新が古い（約5年前） | R6ルール（6ヶ月以内更新）に抵触する可能性 | 現行のNode/Vite環境でビルド・動作するか実地検証、代替案の要否を判断 |
| 2 | Reactを採用するか、vanilla TS+page-flip核ライブラリのみにするか | 依存最小化の方針と、実装コストのバランスを確認 | アーキテクチャ観点でトレードオフを整理し確定 |
| 3 | GitHub Pagesの日本語URL/カスタムドメイン扱い | 会員数増加時の運用性 | 公式ドキュメントでpublic repo要件・カスタムドメイン設定を確認 |
