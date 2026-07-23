# PROGRESS.md — メンバーブック

## 現在フェーズ: Phase 8（本番移行）— GitHub Pagesへのデプロイ完了

- リポジトリ: https://github.com/ony722/member-book （public）
- 公開URL: https://ony722.github.io/member-book/
- デプロイ方式: GitHub Actions（`.github/workflows/deploy.yml`）、`main`へのpushで自動ビルド・E2E・デプロイ
- 最終確認: 実URLへPlaywrightでアクセスし、表紙・目次見開き（会員24件・目次1/3,2/3表示）が正常表示されることを確認済み（2026-07-23）

### デプロイ時に発見・修正した不具合（Phase 8実地検証）

CI環境で初めて顕在化した問題が3件あり、いずれもローカル開発環境だけでは気づけなかった。

| # | 問題 | 原因 | 対応 |
|---|---|---|---|
| 1 | `validate:members`がCIで失敗 | Node 20は2026-04-30にEOL済み、かつ`--experimental-strip-types`はNode 22.6+が必要 | CI/`package.json engines`をNode 22.6+に変更（一次ソース: nodejs.org, nodejs/Release README） |
| 2 | モバイル(WebKit)向けE2Eが全滅 | CIのPlaywrightブラウザインストールがchromiumのみでwebkit未インストール | `npx playwright install --with-deps chromium webkit`に修正 |
| 3 | E2E-01/06がCI×WebKitで断続的にtimeout | page-flipの影エフェクト要素(`.stf__outerShadow`)がクリックを妨害／アニメーション完了前に次操作していた | `pointer-events: none`を影要素に付与（実装バグとして修正）、E2Eをページ番号変化ベースの待機に統一 |

いずれも「ローカルでは全PASS、CIで初めて失敗」というパターンであり、本番相当環境（CI）での実行確認の重要性を再確認した。

## Phase 7（検証）完了時点の記録

最終更新: 2026-07-23 / セッション: 1（50往復ルール内で完了）

---

## Definition of Done チェックリスト（CLAUDE.md PART B 対応）

1. [x] 全 Must 機能が実装済み（FR-SYS-001,002,003,004,007,010／FR-DATA-001／FR-EXT-001）
2. [x] 全テスト通過（カバレッジ 92.39% line / 90.59% statement、目標80%以上を達成）
3. [x] E2E シナリオ全 PASS（6シナリオ × chromium-desktop / mobile(WebKit) = 12テスト全PASS）
4. [x] セキュリティチェック完了（noopener/noreferrer付与をユニットテストで確認、`npm audit --production` 0件）
5. [x] スペックドリフトなし（下記スペックドリフト検出結果参照）
6. [x] レビュー GO 判定（harness/review-log.md、Round1でGO）
7. [x] PROGRESS.md 最新（本ファイル）

---

## スペックドリフト検出結果（SD-01/SD-02簡易実施）

| # | 確認内容 | 結果 |
|---|---|---|
| SD-01 | SRS/SDD/CLAUDE.mdの記載と実装の突合 | Must要件は全てSDDのコンポーネント設計通りに実装。差分はADR-002（SizeType回避策）としてSDD/研究文書に反映済み |
| SD-02 | 受入基準（acceptance_criteria.md）を1つずつ確認 | Must/Should全項目をE2E/Unitで検証。詳細は下表 |
| SD-03 | テスト改ざん検出 | テストの削除・skip追加・アサーション弱体化は発生していない（全テストが実装ロジックへの正当な検証として作成された） |

### 受入基準トレース結果（抜粋、全件はacceptance_criteria.md参照）

| 要件ID | 検証方法 | 結果 |
|---|---|---|
| FR-SYS-001〜004, 007, 010 | E2E-01, E2E-03 | PASS |
| FR-DATA-001 | Unit(dataLoader.test.ts) + E2E-05 | PASS |
| FR-EXT-001 | Unit(linkRenderer.test.ts) + E2E-01 | PASS |
| FR-SYS-005, 006, 008, 011 | Integration(flipBookNavigation.test.ts, navigationDispose.test.ts) + E2E-01 | PASS |
| FR-SYS-009 | Unit(fullscreen.test.ts) | PASS |
| NFR-PERF-002（バンドルサイズ） | ビルド実測 gzip合計 約16.5KB（目標200KB以内） | PASS |
| NFR-SEC-001 | Unit(linkRenderer.test.ts) | PASS |
| NFR-MAINT-001（カバレッジ80%以上） | `npm run test:coverage` | PASS（92.39%） |
| NFR-PORT-001 | `npm run build`で`dist/`が単独生成されることを確認 | PASS |

---

## 既知の未実施・限定事項（正直な残課題として記録）

| # | 内容 | 分類 | 理由・対応方針 |
|---|---|---|---|
| 1 | FR-SYS-012（ローディング表示） | Could・未実装 | 会員データはビルド時に静的バンドルされ、実行時の非同期読み込みが存在しないため、表示すべき「読み込み中」状態が実質発生しない設計になった。将来fetch方式に変更する場合は再検討する |
| 2 | NFR-PERF-001（LCP 3秒以内） | Must・自動計測未実施 | Lighthouse CIをTEST_PLAN.mdにS8として設計したが、本セッションでは未セットアップ。バンドルが約16.5KB gzipと極小のため達成は濃厚だが、実測による証拠は本番移行前に取得すること（Phase 8着手条件に追加） |
| 3 | NFR-COMP-001（主要ブラウザ最新2版） | Must・部分検証 | 本セッションではChromium（デスクトップ）とWebKit（iPhone SE相当、モバイル）の2エンジンで検証した。Firefox・Edge単体では未検証（Chromiumベースのため実質カバー率は高いが、Firefoxは異なるエンジンのため本番移行前に追加検証を推奨） |
| 4 | S7（バンドルサイズの自動判定センサー） | 手動確認のみ | `size-limit`等のCI組み込みは`.github/workflows/deploy.yml`に未追加。現状はビルドログの目視確認 |
| 5 | 実データ投入 | 意図的に未実施 | Phase 0確定方針により、本セッションはダミー会員24件のサンプルデータのみ。実データ投入はRISK-006/007の対応完了後（CLAUDE.md PART G参照） |

---

## 目視確認（スクリーンショット）で発見・修正した不具合

自動E2E（Playwrightのロケータ操作）は全てPASSしていたが、実際にスクリーンショットで見た目を確認したところ、
デスクトップの一般的なビューポート（1000×800px）で `.mb-flipbook` の高さが `aspect-ratio: 3/4` と
`max-width: 900px` の組み合わせにより1200px相当まで伸び、ビューポートから大きくはみ出して
操作ボタンが画面外に追いやられる不具合を発見した。E2Eはボタンをロケータ経由でクリックしており
Playwrightが自動スクロールするため機能的には成功していたが、実際のユーザー体験としては大きな欠陥だった。
`src/style.css` の `.mb-flipbook` を `aspect-ratio` 依存から `width: min(900px, 92vw)` /
`height: min(640px, 68vh)` という幅・高さ両方をビューポート基準で明示的に制限する方式に修正し、
page-flip の `size:'stretch'` が実測ボックス内に正しく収まるようにした（修正後、スクリーンショットで
表紙・目次見開き・会員ページ・モバイル表示いずれもビューポート内に収まることを確認済み）。
**教訓**: 機能的なE2Eテストが全てPASSしていても、実際のスクリーンショットによる目視確認でしか
見つからないレイアウト崩れがある。今後、UI変更時は自動テストに加えて目視確認を行うこと。

## 実装で得られた重要な知見

`page-flip@2.0.7`の実行時バンドルが型定義上存在する`SizeType`列挙型を実際にはエクスポートしておらず、そのままでは常に初期化エラー→フォールバックUIに陥るバグを実装・E2E検証で発見し、`'stretch' as SizeType`への型キャストで回避した（docs/risk_register.md RISK-001、research/research_v2.md参照）。5年間更新のないOSSは型定義とビルド成果物の乖離があり得るため、実ブラウザでの動作確認が不可欠という教訓を得た。

---

## 成果物一覧

- ドキュメント: docs/intake_sheet.md, scope_table.md, SRS.md, SDD.md, TEST_PLAN.md, E2E_SCENARIOS.md, requirements_ledger.md, acceptance_criteria.md, exit_criteria.md, adoption_stop_criteria.md, risk_register.md, summary_for_owner.md
- リサーチ: research/research_v1.md, research_v2.md, feasibility_log.md
- ハーネス: harness/HARNESS.md, review-log.md, finding_ledger.md, reproposal_log.md
- 制約: CONSTRAINTS.md
- 実装: src/（core/ui/config/data 全モジュール）, scripts/validate-members.ts
- テスト: tests/unit(6ファイル), tests/integration(2ファイル), tests/e2e(1ファイル・6シナリオ)
- CI: .github/workflows/deploy.yml

## 概算コスト
- ホスティング: GitHub Pages 無料枠内（追加費用なし）
- 外部API利用: なし（費用発生要素なし）
