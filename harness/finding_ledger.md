# 指摘事項台帳（Finding Ledger）

| ID | Round | レビュアー | カテゴリ | 内容 | 対応状況 | 修正ファイル | 修正日 |
|---|---|---|---|---|---|---|---|
| F-C1 | R1 | Codex役 | BLK | E2E-04（page-flip初期化失敗フォールバック）のテスト実装手段が未設計 | 修正済 | docs/SDD.md（FlipBookOptions.__forceInitErrorForTest追加）、docs/E2E_SCENARIOS.md | 2026-07-23 |
| F-C2 | R1 | Codex役 | MST | `templates.ts`がコンポーネント一覧に未定義。C-06の呼び出し元が表と図で矛盾 | 修正済 | docs/SDD.md（C-09 TemplateRenderer追加、依存関係図・トレーサビリティマトリクス修正） | 2026-07-23 |
| F-C3 | R1 | Codex役 | MST | FR-SYS-003のThen節が「リンク1件以上」を要求し、DATA-001/FR-DATA-001/E2E-06/ACCと矛盾 | 修正済 | docs/SRS.md（FR-SYS-003 Then/例外節を条件付き表現に修正） | 2026-07-23 |
| F-C4 | R1 | Codex役 | MST | TEST_PLANのExit CriteriaがMust指定NFRを取りこぼし、CIセンサーに性能ゲートがない | 修正済 | docs/TEST_PLAN.md（Exit Criteria追記、S7/S8センサー追加）、harness/HARNESS.md | 2026-07-23 |
| F-C5 | R1 | Codex役 | SHD | page-flip実地検証環境がNode v25で、公式サポート宣言(Node20 LTS)未検証。検証ログが未保存 | 修正済 | research/feasibility_log.md（新規作成）、docs/TEST_PLAN.md（Entry Criteriaに再検証項目追加） | 2026-07-23 |
| F-C6 | R1 | Codex役 | SHD | E2E-03/ACC-FR-SYS-007の「3秒以内」基準がSRSに根拠なく、flaky化リスクあり | 修正済 | docs/acceptance_criteria.md、docs/E2E_SCENARIOS.md（イベント発火判定に変更、時間は参考計測のみ） | 2026-07-23 |
| F-C7 | R1 | Codex役 | SHD | C-04/C-05/C-07/C-08の公開インターフェースが未定義 | 修正済 | docs/SDD.md（インターフェース定義表に4コンポーネント追加） | 2026-07-23 |
| F-C8 | R1 | Codex役 | SHD | RISK-001対策「代替実装への切替可能性」を裏付ける抽象化層が設計上明示されていない | 修正済 | docs/SDD.md（RISK-001対策の設計根拠セクション追加、FlipBookHandle抽象化を明記） | 2026-07-23 |
| F-O1 | R1 | Opus役 | MST | SRS第11章が約束するインシデント対応手順がCONSTRAINTS.mdに未記載、force push禁止と矛盾 | 修正済 | CONSTRAINTS.md（C-AI-005に例外条項追加、第7章インシデント対応手順を新規追加） | 2026-07-23 |
| F-O2 | R1 | Opus役 | MST | 実データ投入時の本人同意取得・削除依頼対応プロセスが未定義 | 修正済 | docs/risk_register.md（RISK-006追加）、CLAUDE.md（PART G追記） | 2026-07-23 |
| F-O3 | R1 | Opus役 | SHD | 「非エンジニアがJSON編集のみで運用できる」という前提と実際のGit/PR運用フローの乖離 | 修正済 | docs/SRS.md（第4章に非エンジニア向けWeb UI手順追記）、docs/risk_register.md（RISK-003残存リスクを低→中に格上げ） | 2026-07-23 |
| F-O4 | R1 | Opus役 | SHD | 検索エンジンインデックス（SEO露出）への対応方針が未検討 | 修正済 | docs/risk_register.md（RISK-007追加）、CLAUDE.md（PART G追記） | 2026-07-23 |
| F-O5 | R1 | Opus役 | SHD | 社長（非エンジニア）向けの平易なサマリー資料が存在しない | 修正済 | docs/summary_for_owner.md（新規作成） | 2026-07-23 |
| F-O6 | R1 | Opus役 | LTR | DEFER項目に優先度・着手トリガーの記載がなく一貫性を欠く | 修正済 | docs/scope_table.md（DEFER表に優先度・トリガー列を追加） | 2026-07-23 |

**Round 1終了時点の残存件数**: Blocker 0件 / Must 0件 / Should 0件 / Later 0件（全14件対応済み）
