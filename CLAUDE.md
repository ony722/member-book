# メンバーブック — CLAUDE.md

## PART A: プロジェクト情報 ★毎セッション確認
- プロジェクト名: メンバーブック（漫画ページめくり風・会員紹介サイト）
- 目的(1文): 紙のメンバーブックをめくる体験をWebで再現し、会員を1人1ページ（文字＋リンク）で紹介する静的サイトを提供する
- 技術スタック: TypeScript + Vite（vanilla、フレームワークなし） / `page-flip`(StPageFlip core, MIT) / Vitest / Playwright / GitHub Pages
- 現在フェーズ: Phase 8完了 — GitHub Pagesへデプロイ済み（https://ony722.github.io/member-book/ 、サンプルデータのみ）。実データ投入はRISK-006/007対応後。詳細は PROGRESS.md 参照
- 現在セッション: 1

## PART B: 完了基準 (Definition of Done)
1. [ ] 全 Must 機能（FR-SYS-001,002,003,004,007,010 / FR-DATA-001 / FR-EXT-001）が実装済み
2. [ ] 全テスト通過（単体テストカバレッジ 80%以上、NFR-MAINT-001）
3. [ ] E2E シナリオ全 PASS（docs/E2E_SCENARIOS.md）
4. [ ] セキュリティチェック完了（PART F 全項目、特に外部リンクの noopener/noreferrer）
5. [ ] スペックドリフトなし（SD-01 で HIGH ドリフト 0件）
6. [ ] レビュー GO 判定（harness/review-log.md）
7. [ ] PROGRESS.md 最新

## PART C: 作業ルール
- 承認制: コード変更は必ず人間の確認を取る
- 1コミット1変更: 1つのコミットに複数の無関係な変更を含めない
- スペックドリフト防止: ドリフト発見時は SD-ALERT 形式で即報告
- ファイルに書く: 会話での合意はその場でファイルに反映する

## PART D: 絶対禁止事項
- SRS 未記載機能の追加禁止（新機能は SRS 追記 → 承認後に実装）
- 会員写真・画像掲載の禁止（scope_table.mdでOUT OF SCOPE、実装しない）
- 会員データへの機微情報（住所・電話番号等）の掲載禁止（NFR-SEC-002）
- `members.json` のスキーマ検証をバイパスするコード変更禁止（CC-04）
- 外部リンクに `rel="noopener noreferrer"` を付与しないコード変更禁止（NFR-SEC-001）
- テスト削除・改ざん禁止（テストが通らない場合は実装を修正する）
- force push 禁止（変更履歴は保持する）
- CONSTRAINTS.md の無断変更禁止（変更は人間の承認後のみ）
- 50往復超のセッション継続禁止（→ docs/harness/session-mgmt.md）

## PART E: セッション管理
- 開始時: PROGRESS.md 読了 → 前回の続きから再開
- 終了時: PROGRESS.md 更新 → git commit
- 50往復超: 即座にセッション切替（例外なし）
- 詳細: → docs/harness/session-mgmt.md

## PART F: セキュリティチェックリスト
- [x] 認証・認可設計済み（本サイトは認証なし＝公開サイトと確定、SRS第11章）
- [x] データ保護設計済み（機微情報を掲載しない運用ルール、NFR-SEC-002）
- [x] 外部連携の安全設計済み（外部APIは存在しない。外部リンクは`noopener noreferrer`必須、NFR-SEC-001）
- [ ] 入力検証実装済み（`members.json`のスキーマ検証、C-01 DataLoader — 実装フェーズで完了）
- [ ] 依存パッケージの脆弱性チェック済み（`npm audit`をCIに組み込み予定）

## PART G: 本番移行チェックリスト（Google SRE PRR 準拠・簡易版）
- [ ] アーキテクチャレビュー完了（docs/SDD.md参照、静的サイトのため縮小版PRRを適用）
- [ ] 容量計画: GitHub Pages無料枠（100GB/月）内で運用（想定PV規模は小〜中）
- [ ] 監視・アラート: 該当なし（サーバーレス静的サイトのため。GitHub Actionsのビルド失敗通知のみ）
- [ ] ロールバック手順: 直前のデプロイ済み静的ファイルがそのまま配信され続けるため実質ロールバック不要
- [ ] 運用ドキュメント: docs/SDD.md 4.デプロイ方法 参照
- [ ] **実データ投入前の同意取得方法・削除ポリシーの確認**（会員本人からの掲載同意取得手順、掲載中止依頼時の対応フローがrisk_register.md RISK-006に沿って確定していること。Round1レビュー指摘F-O2対応。サンプルデータのみのMVP公開ではこの項目は対象外＝チェック不要）
- [ ] 検索エンジンインデックス方針の確定（`noindex`要否の判断、risk_register.md RISK-007参照。F-O4対応）

## PART H: RYG ゲート
- **Green**: 次フェーズへ進行 OK。全チェック項目クリア
- **Yellow**: sandbox / PoC のみ許可。本番操作禁止。注意事項あり
- **Red**: 停止。再設計・再リサーチが必要。進行禁止

## PART I: スペック検証スケジュール
- 実装完了時: SD-02（受入条件検証）実行
- テスト変更時: SD-03（テスト改ざん検出）実行
- 詳細: → docs/harness/spec-drift.md

## PART J: ハーネス設計
- 本プロジェクトは破壊的操作（本番DB操作・自動投稿・課金）を持たないため dry-run/sandbox/承認ゲートは非該当（docs/SDD.md 7章参照）
- ビルド失敗は即座にCIログで検知（rollback不要な静的配信構成）
- 操作ログ: 全操作を記録（PROGRESS.md + git log）

## PART K: テスト計画概要
- Unit テスト: Vitest（DataLoader/PageModel/LinkRendererのロジック検証、カバレッジ80%目標）
- Integration テスト: FlipBookView + NavigationController の結合動作
- E2E テスト: Playwright（正常系3・異常系2・境界系1、docs/E2E_SCENARIOS.md）
- 詳細: → docs/TEST_PLAN.md

## PART L: 成長型ハーネス
- 知識蓄積・テンプレート進化は本プロジェクト規模では簡易運用とし、失敗パターンは docs/harness/failure_patterns.md に集約する
- 詳細: → docs/harness/three-layers.md

## PART M: 変更履歴
| 版 | 日付 | 変更内容 |
|---|---|---|
| v1.0.0 | 2026-07-23 | 初版作成（Phase 3 SDD完了時点で生成） |
