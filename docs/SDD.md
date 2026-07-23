# 設計書（SDD）— メンバーブック（IEEE 1016準拠）

## 0. 文書管理

| 項目 | 内容 |
|---|---|
| 版数 | v1.0 |
| 作成日 | 2026-07-23 |
| 入力文書 | [SRS.md](./SRS.md)、[research/research_v2.md](../research/research_v2.md) |

---

## 1. 論理ビュー（コンポーネント構成）

### コンポーネント一覧

| ID | コンポーネント名 | 責務 | 依存先 | 対応要件 |
|---|---|---|---|---|
| C-01 | DataLoader | `members.json` の読み込み・スキーマ検証（build-time） | なし | FR-DATA-001 |
| C-02 | PageModel | 会員データから「表紙・目次(N分割)・会員ページ」の論理ページ列を生成 | C-01 | FR-SYS-001, 002, 003, 007 |
| C-03 | FlipBookView | `page-flip`ライブラリを初期化しDOMへページをレンダリング、めくりアニメーションを制御 | C-02, 外部OSS(`page-flip`) | FR-SYS-004 |
| C-04 | NavigationController | ボタン/キーボード/目次ジャンプ操作をFlipBookViewへ橋渡し | C-03 | FR-SYS-005, 006, 007, 011 |
| C-05 | ResponsiveController | ウィンドウサイズ変化に応じてFlipBookViewの表示サイズを再計算 | C-03 | FR-SYS-010 |
| C-06 | LinkRenderer | 会員リンクのURL検証・`target="_blank" rel="noopener noreferrer"`付与レンダリング | C-01 | FR-EXT-001, NFR-SEC-001 |
| C-07 | FullscreenController | Fullscreen APIのトグル制御 | C-03 | FR-SYS-009 |
| C-08 | PageIndicator | 現在ページ/総ページ数の表示更新 | C-03 | FR-SYS-008 |
| C-09 | TemplateRenderer（`templates.ts`） | Page配列を受け取り表紙/目次/会員ページのHTML文字列を生成する。会員ページ生成時にC-06を呼び出してリンクをレンダリングする | C-02, C-06 | FR-SYS-001, 002, 003 |

### コンポーネント間の依存関係

```
C-01(DataLoader) → C-02(PageModel) → C-09(TemplateRenderer) → C-06(LinkRenderer)
                                              │
                                              ▼
                                     C-03(FlipBookView) ⇄ C-04(NavigationController)
                                              │
                                              ├→ C-05(ResponsiveController)
                                              ├→ C-07(FullscreenController)
                                              └→ C-08(PageIndicator)
```

C-06 LinkRendererの呼び出し元はC-09 TemplateRenderer（会員ページHTML生成時）のみであり、C-01/C-02から直接呼ばれることはない（Round1レビュー指摘F-C2で修正、旧版の「C-02がページHTML生成時に利用」という記述は誤りだったため訂正）。

### インターフェース定義

| コンポーネント | 公開関数 | 入力 | 出力 | エラー時の振る舞い |
|---|---|---|---|---|
| C-01 DataLoader | `loadMembers(json: unknown): Member[]` | 生JSON | 検証済みMember配列 | スキーマ不一致は`ValidationError`をthrowしビルドを失敗させる |
| C-02 PageModel | `buildPages(members: Member[]): { pages: Page[]; memberIndex: Map<string, number> }` | Member配列 | 表紙/目次N枚/会員N枚のPage配列＋会員ID→ページ番号の索引（目次からのジャンプ先計算に使用、実装時にC-04単体では持てない情報のため追加） | 空配列時は「準備中」状態のPageを1枚生成 |
| C-09 TemplateRenderer | `renderPage(page: Page, memberIndex: Map<string, number>): string`（HTML文字列） | Page・会員索引 | HTML文字列（会員ページの場合C-06の出力を含み、目次ページの場合`memberIndex`からジャンプ先ページ番号を埋め込む） | `bio`空文字は空要素として描画、例外をthrowしない |
| C-03 FlipBookView | `mount(container: HTMLElement, pages: Page[], memberIndex: Map<string, number>, options?: FlipBookOptions): FlipBookHandle` | DOM要素・Page配列・会員索引・オプション | 操作用ハンドル(`flipNext/flipPrev/flipToPage/destroy/onFlip/getPageCount/getCurrentPage`) | `page-flip`初期化失敗時はエラーバウンダリで捕捉し、`options.onInitError`コールバック経由でNavigationControllerへ通知、ボタンのみのフォールバックUIに切り替える |
| C-04 NavigationController | `bindControls(handle: FlipBookHandle): NavigationHandle`（`{ next, prev, jumpTo, dispose }`） | FlipBookHandle | ボタン/キーボード/目次クリックのイベントバインド解除用ハンドル | フォールバックモード時は`handle`がボタン専用実装に差し替わるため呼び出し側の変更は不要 |
| C-05 ResponsiveController | `observeResize(handle: FlipBookHandle): () => void`（後始末関数を返す） | FlipBookHandle | リサイズ監視解除関数 | 200msデバウンス、`ResizeObserver`未対応環境では`window.resize`にフォールバック |
| C-06 LinkRenderer | `renderLink(link: Link): HTMLAnchorElement` | Link | `<a>`要素（`target="_blank" rel="noopener noreferrer"`付与済み） | `http(s)://`で始まらない場合はビルド時に`ValidationError` |
| C-07 FullscreenController | `toggleFullscreen(container: HTMLElement): void` | DOM要素 | なし（副作用としてFullscreen API呼び出し） | API未対応時はボタン非表示（呼び出し元でfeature detection） |
| C-08 PageIndicator | `subscribe(handle: FlipBookHandle, onChange: (current: number, total: number) => void): () => void` | FlipBookHandle・コールバック | 購読解除関数 | ページ数0件時は`0 / 0`ではなく「準備中」表示に切り替え |

### テスト用障害注入インターフェース（Round1レビュー指摘F-C1への対応）

E2E-04（`page-flip`初期化失敗時のフォールバック検証）を実装可能にするため、`FlipBookOptions`にテスト専用の障害注入フックを正式な設計要素として定義する。

```ts
interface FlipBookOptions {
  onInitError?: (error: unknown) => void;
  /** テスト専用。E2E-04でのみtrueを注入する */
  __forceInitErrorForTest?: boolean;
}
```

- **実装時の設計修正（Phase 6, 2026-07-23）**: 当初案では`import.meta.env.MODE === 'test'`によるビルド時Tree-shakingを想定したが、Viteの環境変数はビルド時に静的評価されるため、`TEST_PLAN.md`が前提とする「`vite preview`で配信する本番同等ビルドに対してPlaywrightを実行する」という環境（6章）とは整合しなかった（テスト用ビルドを別途用意する必要が生じ、E2Eが実際の配布物と異なるバンドルを検証することになるため）。そのため`__forceInitErrorForTest`は**URLクエリパラメータ**（例: `?__forceInitErrorForTest=1`）から読み取る方式に変更する。`mount()`呼び出し前に`new URLSearchParams(location.search)`で判定するだけの軽量な分岐であり、実ユーザーが偶然このクエリを付与しても「読み込みに失敗したていで表示される」以上の実害はない（データ改変・情報漏洩を伴わない）。Playwright側は`page.goto('/?__forceInitErrorForTest=1')`で本番ビルドと同一の`dist/`に対してこの状態を再現する
- この設計要素はCONSTRAINTS.md C-AI-001（SRS未記載機能の追加禁止）の例外として、本SDDに明記された時点で「仕様化された機能」として扱う

### RISK-001対策（代替実装への切替容易性）の設計上の根拠（Round1レビュー指摘F-C8への対応）

C-04〜C-08はいずれも`page-flip`固有の型ではなく、C-03が返す`FlipBookHandle`（`flipNext/flipPrev/flipToPage/destroy`という抽象操作のみを公開）にのみ依存する設計とする。これにより、`page-flip`が採用停止基準（adoption_stop_criteria.md）に抵触した場合でも、C-03の内部実装をCSS 3D Transform版に差し替えるだけでC-04〜C-08の呼び出し側コードは変更不要という設計上の保証がある。ただし、現時点でCSS 3D Transform版の実装自体は存在しない（RISK-001対策は「切替先の設計インターフェースが用意されている」段階であり、「切替先の実装が用意されている」わけではない）。risk_register.mdの残存リスク欄にこの区別を明記する。

---

## 2. プロセスビュー（フロー/並行性）

### メインフロー（初回読み込み〜表示）

1. ブラウザが`index.html`と静的JS/CSSバンドルを取得
2. `main.ts`が起動し、ビルド時に埋め込み済みの`members.json`（C-01で検証済み）を読み込む
3. C-02 PageModelが表紙・目次(会員数に応じて分割)・会員ページの配列を構築
4. C-03 FlipBookViewが`page-flip`を初期化しDOMにページ要素をマウント
5. C-04/05/07/08が各操作系コンポーネントをFlipBookViewにバインド
6. 表紙ページが表示され、訪問者の操作待ちになる

### ユーザー操作フロー（ページ送り）

```
訪問者操作(クリック/ドラッグ/ボタン/キー/目次クリック)
  → NavigationController が対応するFlipBookViewメソッドを呼ぶ
  → page-flip ライブラリがめくりアニメーションを実行
  → アニメーション完了イベントで PageIndicator が現在ページ数を更新
```

### 並行処理

- 本サイトに非同期の外部通信は存在しない（静的サイトのため）。JSON読み込みはビルド時に完了しており、実行時は同期的なDOM操作のみ
- リサイズイベント（C-05）はデバウンス処理（200ms）を行い、頻繁な再計算による描画負荷を抑える

### エラーハンドリングフロー

- ビルド時: `members.json`のスキーマ検証エラー → ビルド失敗（非ゼロ終了コード）、CIログに具体的な不正フィールドを出力（CC-04）
- 実行時: `page-flip`初期化に失敗した場合 → コンソールエラーを出力し、フォールバックとして「次へ/前へ」ボタンのみのシンプルな表示に切り替える（FR-SYS-004の代替導線としてFR-SYS-005を保証）

---

## 3. データビュー（モデル/データフロー）

### データモデル

| エンティティ | 属性 | 型 | 制約 |
|---|---|---|---|
| Member | id, name, bio, links | string, string, string, Link[] | id: 一意・英数字とハイフン、name: 1-100文字、bio: 0-1000文字（既定空文字） |
| Link | label, url | string, string | label: 1-50文字、url: `http(s)://`必須 |
| Page（実行時生成、永続化しない） | type, memberRef?, pageNumber | 'cover'\|'toc'\|'member', Member?, number | type='member'の場合のみmemberRef必須 |

### データフロー

```
members.json（リポジトリ管理・信頼できる入力源）
  → C-01 DataLoader（スキーマ検証、ビルド時）
  → C-02 PageModel（Page配列に変換、実行時）
  → C-03 FlipBookView（DOM描画）
```

### 保存方式

- 会員データ: `src/data/members.json`（Gitで版管理、DBなし）
- 実行時状態（現在ページ番号等）: メモリ上のみ、永続化しない（NFR-PORT-001準拠、サーバー状態を持たない）

### データライフサイクル

- 作成・更新: JSONファイルをGitへコミット
- 削除: JSONからレコードを削除しリビルド
- バックアップ: Git履歴がバックアップを兼ねる（追加のバックアップ機構は不要、理由: 該当データが低頻度更新かつGit管理下にあるため）

---

## 4. 物理ビュー（デプロイ構成）

### 実行環境

- ビルド環境: Node.js 22.6以上（Maintenance LTS。`scripts/validate-members.ts`が使う`node --experimental-strip-types`がNode 22.6で導入されたための下限。Node 20はPhase 8のCI実地検証で「EOL済み(2026-04-30)かつ当該フラグ非対応」と判明し不採用に変更した。実地検証はNode v25で実施、CI(GitHub Actions)はNode 22で運用）
- ブラウザ実行環境: モダンブラウザ（NFR-COMP-001準拠）、サーバーサイドランタイムなし

### デプロイ方法

- `npm run build` → `dist/` に静的HTML/CSS/JSが出力される
- GitHub Actionsが`main`ブランチへのpush時に自動ビルド・GitHub Pagesへデプロイ（[ADR-004](#adr-004-デプロイ方式)）

### ディレクトリ構成

```
project-root/
├── src/
│   ├── main.ts                  # エントリポイント
│   ├── core/
│   │   ├── types.ts             # Member/Link/Page型定義
│   │   ├── dataLoader.ts        # C-01: JSON読込・スキーマ検証
│   │   └── pageModel.ts         # C-02: ページ列生成
│   ├── ui/
│   │   ├── flipBookView.ts      # C-03: page-flip統合
│   │   ├── navigation.ts        # C-04: 操作ハンドラ
│   │   ├── responsive.ts        # C-05: リサイズ対応
│   │   ├── linkRenderer.ts      # C-06: リンクレンダリング
│   │   ├── fullscreen.ts        # C-07: 全画面制御
│   │   ├── pageIndicator.ts     # C-08: ページ番号表示
│   │   └── templates.ts         # 表紙/目次/会員ページのHTML生成
│   ├── data/
│   │   └── members.json         # サンプル会員データ（20〜100件）
│   └── style.css
├── tests/
│   ├── unit/                    # C-01, C-02, C-06 のロジックテスト
│   ├── integration/             # C-03+C-04 結合テスト
│   └── e2e/                     # Playwright E2Eシナリオ
├── index.html
├── vite.config.ts
├── package.json
├── .github/workflows/deploy.yml # GitHub Pages自動デプロイ
├── docs/                        # SRS/SDD/TEST_PLAN等
├── research/                    # research_v1/v2
├── harness/                     # HARNESS/review-log等
├── CLAUDE.md
├── CONSTRAINTS.md
└── PROGRESS.md
```

---

## 5. C4モデル

### Container図

| Container | 技術 | 責務 |
|---|---|---|
| Static Web App | TypeScript + Vite + `page-flip` | フリップブックUIの提供（本プロジェクトの唯一のContainer） |
| Hosting (GitHub Pages) | 静的ファイルCDN配信 | ビルド成果物の配信 |

外部API・DB・バックエンドContainerは存在しない（[research_v2.md]で確定済み）。

### Component図（Static Web App内部）

上記「1. 論理ビュー」のコンポーネント一覧と同一（C-01〜C-08）。

---

## 6. ADR（Architecture Decision Record）

### ADR-001: 言語・ビルドツールの選定

**状態**: 承認（Phase 6実装時にTypeScriptバージョンを確定・追記）
**決定**: TypeScript + Vite（vanilla、UIフレームワークなし）を採用する。TypeScriptは**5系**（`^5.9`）で固定する。Phase 6実装時、`npm install`で解決される最新版TypeScript 7系を試したところ、`typescript-eslint@8.65.0`のpeer dependency（`typescript >=4.8.4 <6.1.0`）と競合し`npm install`が失敗することを実地で確認した（ERESOLVE）。lintツールチェーン全体との互換性を優先し、エコシステムが広くサポートする5系にダウングレードした
**理由**: 状態管理・ルーティングが不要な単純表示サイトであり、依存最小化の設計原則（SRS NFR-MAINT-002）に合致する。Viteは静的サイトビルドのデファクトスタンダードであることを[信頼度A]で確認済み（research_v2.md）
**代替案**:
| 案 | メリット | デメリット | 不採用理由 |
|---|---|---|---|
| React + react-pageflip | コンポーネント指向で拡張しやすい | react-pageflipが2021年から更新停止、React18/19対応未確認、バンドルサイズ増 | 不要な複雑性・互換リスクを避けるため |
| Next.js (static export) | フルスタック拡張余地 | 本サイトの要件に対しオーバースペック | 単純表示サイトに不要な依存が増える |
**変更禁止レベル**: L2-慎重
**影響を受ける要件**: FR-SYS-001〜012, NFR-MAINT-002, NFR-PORT-001

### ADR-002: ページめくりライブラリの選定

**状態**: 承認
**決定**: `page-flip`（StPageFlip core, MIT）を採用する
**理由**: MITライセンスで商用利用可、依存関係ゼロ、Node v25/Vite8/TS6環境での実地ビルド検証に成功（EV-BUILD-PAGEFLIP-001）。「本格的な紙めくり演出」という要件（EV-INTAKE-A2）を満たす
**代替案**:
| 案 | メリット | デメリット | 不採用理由 |
|---|---|---|---|
| Turn.js | 歴史が長く実績豊富 | 無償版は非商用ライセンス、商用利用に別途ライセンス購入が必要[信頼度A: turnjs.com] | 予算制約（無料枠運用）と矛盾するため不採用 |
| 自前CSS 3D Transform実装 | 依存ゼロ | 開発コストが高く「本格的な紙めくり」品質の再現が困難 | 開発コスト対効果が悪いため不採用（ただしadoption_stop_criteria.mdの代替案として温存） |
**変更禁止レベル**: L2-慎重
**影響を受ける要件**: FR-SYS-004, RISK-001

### ADR-003: データ管理方式

**状態**: 承認
**決定**: 静的JSONファイル（`src/data/members.json`）でデータ管理し、DBは使用しない
**理由**: Phase 0で「まずはサンプルデータでデモ」と確定。中規模（20〜100件）の会員数であればJSON管理で十分機能し、サーバー不要でホスティングコストがゼロになる
**代替案**:
| 案 | メリット | デメリット | 不採用理由 |
|---|---|---|---|
| SQLite等の軽量DB＋管理画面 | 運用者がノーコードで編集可能 | サーバー実行環境が必要になりホスティング無料枠から外れる | Phase 0で「サンプルデータでデモ」と確定、管理画面はDEFER |
**変更禁止レベル**: L2-慎重
**影響を受ける要件**: FR-DATA-001, RISK-003

### ADR-004: デプロイ方式

**状態**: 承認
**決定**: GitHub Pages + GitHub Actionsによる自動デプロイを第一候補とする
**理由**: 無料・静的サイトのみで完結・予算制約に合致（[信頼度A] vite.dev/guide/static-deploy）
**代替案**:
| 案 | メリット | デメリット | 不採用理由 |
|---|---|---|---|
| Netlify | ビルドパイプラインが柔軟 | GitHub Pagesと比べ追加のアカウント設定が必要 | 第一候補はGitHub Pagesとするが、`dist/`さえあればどちらにもデプロイ可能な設計のため実質どちらでも良い（NFR-PORT-001で担保） |
**変更禁止レベル**: L3-柔軟（`dist/`が生成できる限りホスティング先は差し替え可能）
**影響を受ける要件**: NFR-PORT-001

### ADR-005: テスト戦略

**状態**: 承認
**決定**: 単体・結合テストにVitest、E2EにPlaywrightを採用する
**理由**: Viteとの親和性が高いVitest、複数ブラウザ・複数ビューポートのE2E自動化に適したPlaywrightを組み合わせることで、NFR-COMP-001（複数ブラウザ）・NFR-PERF-001（Lighthouse連携）を効率的に検証できる
**代替案**:
| 案 | メリット | デメリット | 不採用理由 |
|---|---|---|---|
| Jest + Cypress | 実績豊富 | Vite環境との統合にJest設定の追加調整が必要 | Vitestの方がVite設定をそのまま再利用でき保守コストが低い |
**変更禁止レベル**: L3-柔軟
**影響を受ける要件**: NFR-FUNC-001, NFR-COMP-001, NFR-MAINT-001

---

## 7. 横断的ルール（Cross-Cutting Concerns）

| # | ルール | 内容 | 適用範囲 |
|---|---|---|---|
| CC-01 | エラーハンドリング | ビルド時の`members.json`検証エラーは非ゼロ終了コードで明示的に失敗させる。実行時エラーはコンソール出力＋フォールバック表示 | C-01, C-03 |
| CC-02 | ログ出力 | 実行時ログは開発者コンソールのみ（個人情報を含む会員データをログに出力しない） | 全コンポーネント |
| CC-03 | 設定値管理 | サイトタイトル等はハードコード禁止、`src/config/site.ts`に集約する | C-02, templates.ts |
| CC-04 | 入力バリデーション | `members.json`は必ずスキーマ検証を通す（C-01）。URLは`http(s)://`必須検証（C-06） | C-01, C-06 |
| CC-05 | 冪等性 | 同一`members.json`から生成される`dist/`は常に同一内容（ビルドの決定性） | ビルドプロセス全体 |

**アダプター＋DRY_RUNパターンについて**: 本プロジェクトは外部API・破壊的操作（本番DB操作・自動投稿・課金）を一切持たないため、SDD標準の「アダプター＋DRY_RUNモック」設計は**該当なし**とする（黄金ルール#3は破壊的操作が存在する場合にのみ適用され、本プロジェクトには対象操作が存在しない）。

---

## 8. トレーサビリティマトリクス

| 要件ID | 設計コンポーネント | ADR | テストID | 状態 |
|---|---|---|---|---|
| FR-SYS-001 | C-02, C-09, C-03 | ADR-001, ADR-002 | TC-FR-SYS-001 | 設計済 |
| FR-SYS-002 | C-02, C-09, C-03 | ADR-001 | TC-FR-SYS-002 | 設計済 |
| FR-SYS-003 | C-02, C-09, C-06 | ADR-001, ADR-003 | TC-FR-SYS-003 | 設計済 |
| FR-SYS-004 | C-03 | ADR-002 | TC-FR-SYS-004 | 設計済 |
| FR-SYS-005 | C-04 | ADR-001 | TC-FR-SYS-005 | 設計済 |
| FR-SYS-006 | C-04 | ADR-001 | TC-FR-SYS-006 | 設計済 |
| FR-SYS-007 | C-02, C-04 | ADR-001 | TC-FR-SYS-007 | 設計済 |
| FR-SYS-008 | C-08 | ADR-001 | TC-FR-SYS-008 | 設計済 |
| FR-SYS-009 | C-07 | ADR-001 | TC-FR-SYS-009 | 設計済 |
| FR-SYS-010 | C-05 | ADR-001, ADR-002 | TC-FR-SYS-010 | 設計済 |
| FR-SYS-011 | C-04 | ADR-001 | TC-FR-SYS-011 | 設計済 |
| FR-SYS-012 | C-03 | ADR-001 | TC-FR-SYS-012 | 設計済 |
| FR-DATA-001 | C-01 | ADR-003 | TC-FR-DATA-001 | 設計済 |
| FR-EXT-001 | C-06 | ADR-001 | TC-FR-EXT-001 | 設計済 |
| NFR-FUNC-001 | 全C | ADR-005 | TC-NFR-FUNC-001 | 設計済 |
| NFR-PERF-001/002 | C-03, ビルド設定 | ADR-001, ADR-002 | TC-NFR-PERF-001/002 | 設計済 |
| NFR-COMP-001 | C-05, C-03 | ADR-005 | TC-NFR-COMP-001 | 設計済 |
| NFR-SEC-001 | C-06 | CC-04 | TC-NFR-SEC-001 | 設計済 |
| NFR-MAINT-001 | 全C | ADR-005 | TC-NFR-MAINT-001 | 設計済 |
| NFR-PORT-001 | ビルド/デプロイ構成 | ADR-004 | TC-NFR-PORT-001 | 設計済 |

---

## 9. Phase 3 完了確認

- [x] 4設計ビュー記述済み
- [x] C4モデル作成済み
- [x] 主要設計判断5件にADR作成済み（ADR-001〜005）
- [x] 横断的ルール定義済み（CC-01〜05、DRY_RUN該当なしの理由明記）
- [x] ディレクトリ構成確定済み
- [x] トレーサビリティマトリクスで全要件カバー済み
- [x] CLAUDE.md草案作成済み（プロジェクトルート参照）
