# 再提案ログ — メンバーブック

## Round 1 再提案（2026-07-23）

黄金ルール#5（レビュー指摘は再リサーチIDへ変換）に基づき、各指摘を「コード修正」ではなく「まず文書（SRS/SDD/TEST_PLAN/HARNESS/CONSTRAINTS/RISK台帳）への反映」として処理した（本プロジェクトは実装未着手のため、今回の反映先はそのまま設計そのものである）。

### 修正事項

| 指摘ID | 修正前 | 修正後 | 影響範囲 |
|---|---|---|---|
| F-C1 | E2E-04が「テスト用にモック」とだけ記載され実装方法が未定義 | `FlipBookOptions.__forceInitErrorForTest`というテスト専用フックをSDDに正式定義し、Playwrightの`addInitScript`から注入する方式を明記 | docs/SDD.md §1、docs/E2E_SCENARIOS.md E2E-04 |
| F-C2 | `templates.ts`が未定義コンポーネントでC-06依存元が3箇所で矛盾 | C-09 TemplateRendererを正式コンポーネントとして追加し、依存関係図・インターフェース表・トレーサビリティマトリクスを統一 | docs/SDD.md §1, §8 |
| F-C3 | FR-SYS-003が「リンク1件以上」必須と読める表現 | 「リンクが1件以上ある場合は…」の条件付き表現に修正、例外条件に0件時の挙動を明記 | docs/SRS.md §7 |
| F-C4 | Exit CriteriaがFR側Mustのみ、NFR側MustがCIセンサー未カバー | Exit CriteriaにMust NFRを追記、S7(バンドルサイズ)/S8(Lighthouse)センサーを追加 | docs/TEST_PLAN.md §7, 決定論的センサー表、harness/HARNESS.md |
| F-C5 | 実地検証ログが本セッション内のみで再現不可、公式サポート下限(Node20)未検証 | research/feasibility_log.mdに検証ログを保存、TEST_PLAN Entry CriteriaにNode20 LTSでの再検証を追加 | research/feasibility_log.md（新規）、docs/TEST_PLAN.md §6 |
| F-C6 | 「3秒以内」という時間しきい値がCI上でflaky化するリスク | `flip`完了イベントの発火を主判定とし、時間は参考計測のみに変更 | docs/acceptance_criteria.md, docs/E2E_SCENARIOS.md E2E-03 |
| F-C7 | C-04/05/07/08の公開関数シグネチャが未定義 | 4コンポーネント分のインターフェース定義を追加 | docs/SDD.md §1 |
| F-C8 | RISK-001対策の「代替実装への切替容易性」を裏付ける設計がない | FlipBookHandle抽象化がC-04〜08の依存対象であることを明記し、切替容易性の設計根拠を追加（実装自体は未着手である旨も明記） | docs/SDD.md §1 |
| F-O1 | インシデント対応手順がCONSTRAINTS.mdに存在せず、force push禁止と矛盾 | C-AI-005に例外条項を追加し、CONSTRAINTS.md第7章に6手順のインシデント対応手順を新設 | CONSTRAINTS.md |
| F-O2 | 実データ投入時の同意取得・削除対応プロセスが不在 | RISK-006を新設しCLAUDE.md PART Gに本番移行前チェック項目を追加 | docs/risk_register.md, CLAUDE.md |
| F-O3 | 非エンジニア運用前提と実運用手順(Git/PR)の乖離 | SRS第4章に非エンジニア向けGitHub Web UI手順を追記、RISK-003残存リスクを低→中に格上げ | docs/SRS.md §4, docs/risk_register.md |
| F-O4 | SEO/検索エンジンインデックス方針が未検討 | RISK-007を新設、CLAUDE.md PART Gに確認項目を追加 | docs/risk_register.md, CLAUDE.md |
| F-O5 | 非エンジニア向けの平易な説明資料が不在 | docs/summary_for_owner.md（1枚サマリー）を新規作成 | docs/summary_for_owner.md（新規） |
| F-O6 | DEFER項目に優先度・トリガーが未記載 | scope_table.mdのDEFERを表形式に変更し優先度・トリガー列を追加 | docs/scope_table.md |

### 再テスト結果

本プロジェクトは実装未着手（Phase 6未着手）のため、コードレベルのUnit/Integration/E2Eテストは対象外。文書レベルの整合性については以下を確認した。

| チェック | 結果 | 備考 |
|---|---|---|
| SDDトレーサビリティマトリクスの全要件カバー | PASS | C-09追加後も全FR/NFRが設計コンポーネントに接続済みであることを再確認 |
| CONSTRAINTS.md自己矛盾チェック | PASS | C-AI-005とインシデント対応手順の整合を再確認（例外条項により矛盾解消） |
| risk_register.md孤立リスクチェック | PASS | RISK-006/007とも関連要件ID（SRS章・CLAUDE.md）に接続済み |
| requirements_ledger.mdとacceptance_criteria.mdの整合 | PASS | ACC-FR-SYS-007の文言変更をrequirements_ledger.md側の記載（TC-*接続）と突き合わせ、不整合なし |

### 次のアクション
Phase 5完了条件（review-log.md参照）を満たしたため、Phase 6（実装）へ進む。実装時の最初のTODOとして、F-C5で追加したNode 20 LTS環境での再検証（GitHub Actions CI構築）を優先的に実施する。
