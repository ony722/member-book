# テスト計画書（IEEE 829準拠）— メンバーブック

## 1. テスト計画ID
`TP-メンバーブック-v1.0`

## 2. 目的
[SRS.md](./SRS.md) 第7章の全Must/Should機能要件、および[SDD.md](./SDD.md)の設計が、仕様通りに実装・動作することを証拠（テスト結果）をもって証明する。

## 3. テスト対象

| コンポーネント | テスト種別 |
|---|---|
| C-01 DataLoader（JSON検証） | Unit |
| C-02 PageModel（ページ列生成） | Unit |
| C-06 LinkRenderer（URL検証・レンダリング） | Unit |
| C-03 FlipBookView + C-04 NavigationController | Integration |
| C-05 ResponsiveController | Integration |
| フリップブック閲覧シナリオ全体 | E2E |
| ビルド成果物（`dist/`）のサイズ・構造 | Build検証 |

## 4. テスト対象外

| 対象外 | 理由 |
|---|---|
| 外部API連携テスト | 本プロジェクトは外部APIを一切使用しない（research_v2.md参照） |
| 負荷テスト（大量同時アクセス） | 静的サイト＋CDN配信のためアプリケーション側の負荷対策設計が不要（GitHub Pages側のSLAに準拠） |
| 認証・認可テスト | 認証機構が存在しない（SRS第11章で確定） |
| DEFER機能（管理画面・写真・検索等） | scope_table.mdでOUT OF SCOPE/DEFERと明記済み |

## 5. テストアプローチ（テストピラミッド）

| 層 | テスト種別 | 対象 | ツール | 実行頻度 |
|---|---|---|---|---|
| 1 | Unit | C-01, C-02, C-06 のロジック | Vitest | コミット毎 |
| 2 | Integration | C-03+C-04, C-05 | Vitest（jsdom） | PR毎 |
| 3 | E2E | 6シナリオ（後述） | Playwright | デプロイ前 |
| 4 | Acceptance | acceptance_criteria.md の全ACC-* | E2E/Unit兼用 | リリース前 |
| 5 | Security | 外部リンクのnoopener/noreferrer、URLバリデーション、`npm audit` | Vitest + npm audit | リリース前 |
| 6 | Regression | 既存E2E全件の再実行 | Playwright | リリース前 |
| 7 | Smoke | 表紙表示・目次表示・1会員ページ表示の3点 | Playwright（軽量サブセット） | デプロイ直後 |

### カバレッジ目標
- Unit: 行カバレッジ **80%以上**（NFR-MAINT-001）
- Integration: 主要フロー**100%**（ページ送り・目次ジャンプ・リサイズ）
- E2E: 後述の6シナリオ **100%**

## 6. Entry Criteria（テスト開始条件）
- [x] SDD の設計完了（本ドキュメント作成時点）
- [ ] テスト対象コードがビルド可能（`npm run build`成功）
- [ ] テスト環境構築済み（Node 20+、Vitest、Playwright インストール済み）
- [ ] テストデータ（サンプル`members.json` 20〜100件）準備済み
- [ ] GitHub Actions CI（Node 20 LTS）上で`page-flip`のインストール・ビルドが成功することを確認済み（Round1レビュー指摘F-C5対応：Phase 1の実地検証はNode v25で実施したため、公式サポート宣言の下限環境での再検証が必要。research/feasibility_log.md参照）

## 7. Exit Criteria（テスト終了条件）
- [ ] 全Must機能要件（FR-SYS-001,002,003,004,007,010／FR-DATA-001／FR-EXT-001）のテストがPASS
- [ ] 全Must非機能要件（NFR-FUNC-001／NFR-PERF-001／NFR-PERF-002／NFR-COMP-001／NFR-SEC-001）のテストがPASS（Round1レビュー指摘F-C4対応：requirements_ledger.mdでMust指定のNFRが本節に漏れていたため追記）
- [ ] コードカバレッジ80%以上
- [ ] Blocker/Mustの不具合ゼロ
- [ ] E2E 6シナリオ全PASS（RYG=Green）

## 8. Suspension Criteria（テスト中断条件）
- Blocker不具合が3件以上同時発生
- テスト環境（Node/npm）が利用不能
- ビルドが3回連続で失敗する

## 9. テスト環境

| 項目 | 内容 |
|---|---|
| OS | macOS / Linux / CI(GitHub Actions ubuntu-latest) |
| ランタイム | Node.js 20 LTS以上 |
| テストランナー | Vitest（Unit/Integration）、Playwright（E2E） |
| テストデータ | `src/data/members.json`（サンプル会員データ、正常系20〜100件＋境界値検証用の別ケース） |
| ビューポート | 320px（スマホ最小）/ 768px（タブレット）/ 1024px（PC）/ 1920px（大画面） |

## 10. テストスケジュール

| フェーズ | 実施内容 | 実施者 |
|---|---|---|
| Phase 6実装中 | Unit/Integrationテストを実装と並行して作成 | Generator |
| Phase 7検証 | E2E全シナリオ実行、カバレッジ計測 | Evaluator |
| リリース前 | Regression + Smoke再実行 | Evaluator |

## 11. リスクと対策

| リスク | 対策 |
|---|---|
| `page-flip`のDOM操作がjsdom環境でエラーになる（RISK-001関連） | Integrationテストは実ブラウザ相当のPlaywrightで代替し、jsdomでは純粋なロジック（C-01/02/06）のみテストする |
| E2Eのアニメーション待機でテストが不安定化（flaky） | アニメーション完了イベント（`page-flip`の`flip`イベント）を待機してからアサーションする設計とする |

## 12. 成果物
- 本テスト計画書（`docs/TEST_PLAN.md`）
- E2Eシナリオ一覧（`docs/E2E_SCENARIOS.md`）
- テストコード（`tests/unit/`, `tests/integration/`, `tests/e2e/`）
- テスト結果レポート（Phase 7で`PROGRESS.md`に記録）

---

## P/G/E 3エージェント体制

| エージェント | 責務 | 成果物 |
|---|---|---|
| Planner | 本テスト計画・受入基準の定義 | 本ドキュメント、acceptance_criteria.md |
| Generator | テストコード実装・実行・カバレッジ計測 | tests/配下、カバレッジレポート |
| Evaluator | テスト結果評価・GO/NO-GO判定提案 | harness/review-log.md |

## 決定論的センサー（Deterministic Sensors）

| # | センサー | コマンド | 合格基準 |
|---|---|---|---|
| S1 | テスト | `npm run test` (vitest run) | 全テストPASS |
| S2 | 型チェック | `tsc --noEmit` | エラー0件 |
| S3 | リント | `npm run lint` (ESLint) | エラー0件（警告は許容） |
| S4 | ビルド | `npm run build` (tsc && vite build) | 正常終了、`dist/`生成 |
| S5 | E2E | `npx playwright test` | 全6シナリオPASS |
| S6 | セキュリティ | `npm audit --production` + noopener/noreferrer静的チェック | High/Critical脆弱性0件、リンク属性欠落0件 |
| S7 | バンドルサイズ | `size-limit`（または`dist/assets/*.js`のgzipサイズ計測スクリプト） | 合計gzip 200KB以内（NFR-PERF-002） |
| S8 | 性能（Lighthouse CI） | `lhci autorun`（Slow 3Gスロットリング） | LCP 3秒以内（NFR-PERF-001） |

S7・S8はRound1レビュー指摘F-C4対応で追加（Must指定のNFR-PERF-001/002がCIで自動判定されていなかったため）。全センサーは自動実行し、1つでもFAILなら次フェーズへ進めない。
