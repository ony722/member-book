# 要件ID台帳（Requirements Ledger）

要件本文・Given-When-Then・例外条件の詳細は [SRS.md](./SRS.md) 第7章を正とする（本表は追跡可能性のための索引）。

## Evidence ID 一覧（根拠）

| Evidence ID | 内容 | ソース | 信頼度 |
|---|---|---|---|
| EV-GH-PAGEFLIP-001 | page-flip/react-pageflipはMITライセンス、依存ゼロ | https://github.com/Nodlik/react-pageflip/blob/master/LICENSE | A |
| EV-BUILD-PAGEFLIP-001 | Node v25/Vite8/TS6環境で`page-flip`のインストール・ビルドが成功（実地検証） | 本セッション内 feasibility-check 実行ログ | A（一次データ・自己検証） |
| EV-TURNJS-001 | Turn.jsは無償版が非商用ライセンスのため不採用 | http://turnjs.com/get | A |
| EV-VITE-001 | Viteの静的ビルド・デプロイ手順 | https://vite.dev/guide/static-deploy | A |
| EV-INTAKE-A2 | 「本格的な紙めくり演出」を求める旨の社長回答 | AskUserQuestion（Phase 0, 質問2「ページめくりの演出」） | A（一次ヒアリング） |
| EV-INTAKE-A4 | 「誰でも見られる公開サイト」の社長回答 | AskUserQuestion（Phase 0, 質問4「公開範囲」） | A（一次ヒアリング） |
| EV-INTAKE-ARGS | 「1人1ページで文字とリンクからなる」の初期指示 | ユーザー初期指示（`/nagame-dev` 引数） | A（一次ヒアリング） |
| EV-INTAKE-A1 | 「まずはサンプルデータでデモ」の社長回答 | AskUserQuestion（Phase 0, 質問1「運用方法」） | A（一次ヒアリング） |
| EV-INTAKE-A3 | 「中規模（20〜100名）」の社長回答 | AskUserQuestion（Phase 0, 質問3「会員数」） | A（一次ヒアリング） |

## 要件ID台帳本体

| ID | 分類 | 要件名 | 優先度 | 対象フェーズ | Evidence ID | 関連画面 | 関連データ | ACC-* | TC-* | RISK-* | 責任者 | 状態 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| FR-SYS-001 | 機能 | 表紙ページを表示する | Must | V1(MVP) | EV-INTAKE-ARGS | SCR-001 | DATA-001 | ACC-FR-SYS-001 | TC-FR-SYS-001 | RISK-002 | 開発者 | Draft |
| FR-SYS-002 | 機能 | 目次ページを表示する | Must | V1(MVP) | EV-INTAKE-A3 | SCR-002 | DATA-001 | ACC-FR-SYS-002 | TC-FR-SYS-002 | RISK-003 | 開発者 | Draft |
| FR-SYS-003 | 機能 | 会員紹介ページを1人1ページとして表示する | Must | V1(MVP) | EV-INTAKE-ARGS | SCR-003 | DATA-001, DATA-002 | ACC-FR-SYS-003 | TC-FR-SYS-003 | RISK-003 | 開発者 | Draft |
| FR-SYS-004 | 機能 | めくり操作でページ遷移する | Must | V1(MVP) | EV-INTAKE-A2, EV-BUILD-PAGEFLIP-001 | SCR-003 | N/A | ACC-FR-SYS-004 | TC-FR-SYS-004 | RISK-001, RISK-002 | 開発者 | Draft |
| FR-SYS-007 | 機能 | 目次から任意の会員ページへ直接ジャンプできる | Must | V1(MVP) | EV-INTAKE-A3 | SCR-002, SCR-003 | DATA-001 | ACC-FR-SYS-007 | TC-FR-SYS-007 | RISK-003 | 開発者 | Draft |
| FR-DATA-001 | 機能 | 静的JSONから会員データを読み込み表示する | Must | V1(MVP) | EV-INTAKE-A1 | SCR-002, SCR-003 | DATA-001, DATA-002 | ACC-FR-DATA-001 | TC-FR-DATA-001 | RISK-003 | 開発者 | Draft |
| FR-EXT-001 | 機能 | 会員ページ内リンクを新規タブで開く | Must | V1(MVP) | EV-INTAKE-ARGS | SCR-003 | DATA-002 | ACC-FR-EXT-001 | TC-FR-EXT-001 | RISK-004 | 開発者 | Draft |
| FR-SYS-010 | 機能 | レスポンシブ対応（PC/タブレット/スマホ） | Must | V1(MVP) | EV-INTAKE-ARGS | SCR-001, SCR-002, SCR-003 | N/A | ACC-FR-SYS-010 | TC-FR-SYS-010 | RISK-002 | 開発者 | Draft |
| FR-SYS-005 | 機能 | 次へ/前へボタンでページ送り | Should | V1(MVP) | EV-INTAKE-A2 | SCR-003 | N/A | ACC-FR-SYS-005 | TC-FR-SYS-005 | RISK-002 | 開発者 | Draft |
| FR-SYS-006 | 機能 | キーボード左右矢印でページ送り | Should | V1(MVP) | EV-INTAKE-A2 | SCR-003 | N/A | ACC-FR-SYS-006 | TC-FR-SYS-006 | N/A | 開発者 | Draft |
| FR-SYS-008 | 機能 | 現在ページ番号/総ページ数表示 | Should | V1(MVP) | EV-INTAKE-A3 | SCR-003 | N/A | ACC-FR-SYS-008 | TC-FR-SYS-008 | N/A | 開発者 | Draft |
| FR-SYS-011 | 機能 | 会員ページから目次への戻り導線 | Should | V1(MVP) | EV-INTAKE-A3 | SCR-003 | N/A | ACC-FR-SYS-011 | TC-FR-SYS-011 | N/A | 開発者 | Draft |
| FR-SYS-009 | 機能 | 全画面表示切替 | Could | V1(MVP) | EV-INTAKE-A2 | SCR-001〜003 | N/A | ACC-FR-SYS-009 | TC-FR-SYS-009 | N/A | 開発者 | Draft |
| FR-SYS-012 | 機能 | ローディング表示 | Could | V1(MVP) | N/A（内部品質判断） | SCR-001 | N/A | ACC-FR-SYS-012 | TC-FR-SYS-012 | N/A | 開発者 | Draft |
| NFR-FUNC-001 | 非機能 | 全FR(Must/Should)がE2Eで正しく動作 | Must | V1(MVP) | N/A | 全画面 | N/A | ACC-NFR-FUNC-001 | TC-NFR-FUNC-001 | N/A | 開発者 | Draft |
| NFR-PERF-001 | 非機能 | LCP 3秒以内(3G相当) | Must | V1(MVP) | EV-BUILD-PAGEFLIP-001 | 全画面 | N/A | ACC-NFR-PERF-001 | TC-NFR-PERF-001 | RISK-002 | 開発者 | Draft |
| NFR-PERF-002 | 非機能 | JSバンドル gzip 200KB以内 | Must | V1(MVP) | EV-BUILD-PAGEFLIP-001 | 全画面 | N/A | ACC-NFR-PERF-002 | TC-NFR-PERF-002 | N/A | 開発者 | Draft |
| NFR-COMP-001 | 非機能 | 主要ブラウザ最新2版・320px以上で表示崩れなし | Must | V1(MVP) | N/A | 全画面 | N/A | ACC-NFR-COMP-001 | TC-NFR-COMP-001 | N/A | 開発者 | Draft |
| NFR-SEC-001 | 非機能 | 外部リンクにnoopener noreferrer付与 | Must | V1(MVP) | N/A | SCR-003 | DATA-002 | ACC-NFR-SEC-001 | TC-NFR-SEC-001 | RISK-004 | 開発者 | Draft |
| NFR-MAINT-001 | 非機能 | 単体テストカバレッジ80%以上 | Should | V1(MVP) | N/A | N/A | N/A | ACC-NFR-MAINT-001 | TC-NFR-MAINT-001 | N/A | 開発者 | Draft |
| NFR-PORT-001 | 非機能 | `npm run build`のみで配信可能な静的成果物 | Should | V1(MVP) | EV-VITE-001 | N/A | N/A | ACC-NFR-PORT-001 | TC-NFR-PORT-001 | N/A | 開発者 | Draft |

**Must要件接続チェック**: 全8件のMust FR（SYS-001,002,003,004,007,010、DATA-001、EXT-001）および5件のMust NFRにEvidence ID・ACC-*・TC-*が接続済み（黄金ルール#1・#2準拠）。孤立ID・重複IDなし。
