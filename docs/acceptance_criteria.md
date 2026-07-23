# 受入基準表（Acceptance Criteria）

| 要件ID | 受入基準（ACC-*） | 検証方法（TC-*） | 合否 |
|---|---|---|---|
| FR-SYS-001 | ACC-FR-SYS-001: ルートURLアクセス時、フリップブックの1ページ目に表紙（サイトタイトル文字列を含む要素）が表示される | TC-FR-SYS-001（E2E） | 未実施 |
| FR-SYS-002 | ACC-FR-SYS-002: 表紙から1ページ進めると、全会員名（`members.json`件数分）を含む目次ページが表示される | TC-FR-SYS-002（E2E） | 未実施 |
| FR-SYS-003 | ACC-FR-SYS-003: 任意の会員ページに、その会員の`name`・`bio`テキストと`links`（1件以上時）のみが表示され、画像要素が存在しない | TC-FR-SYS-003（E2E） | 未実施 |
| FR-SYS-004 | ACC-FR-SYS-004: ページ端をクリックまたはドラッグすると、CSSトランジション/`page-flip`のめくりアニメーションが発火し、300ms〜1000ms以内にページ内容が切り替わる。最終ページで次へ操作をしても遷移しない | TC-FR-SYS-004（E2E + 境界値） | 未実施 |
| FR-SYS-007 | ACC-FR-SYS-007: 目次で会員名をクリックすると、`page-flip`の`flip`完了イベント発火をもって該当会員ページへの自動ページ送り完了とみなす（イベント発火を主判定とし、所要時間はNFR-PERF-001の枠内で参考計測・ログ記録のみとしCI上のアサーションはしない。Round1レビュー指摘F-C6対応：固定時間しきい値によるCIのflaky化を回避） | TC-FR-SYS-007（E2E） | 未実施 |
| FR-DATA-001 | ACC-FR-DATA-001: `members.json`に不正なレコード（`name`欠落等）が含まれる場合、`npm run build`が非ゼロ終了コードで失敗する。正常データの場合はビルド成功しレコード件数分のページが生成される | TC-FR-DATA-001（単体テスト） | 未実施 |
| FR-EXT-001 | ACC-FR-EXT-001: 会員ページ内の全リンク要素が`target="_blank"`かつ`rel="noopener noreferrer"`属性を持つ。`http(s)://`で始まらないURLを含むデータはビルド時にエラーになる | TC-FR-EXT-001（単体テスト+E2E） | 未実施 |
| FR-SYS-010 | ACC-FR-SYS-010: 320px/768px/1024px/1920pxの4ビューポートでE2Eを実行し、いずれも横スクロールバーが発生しない（`document.documentElement.scrollWidth <= window.innerWidth`） | TC-FR-SYS-010（E2E・複数ビューポート） | 未実施 |
| FR-SYS-005 | ACC-FR-SYS-005: 「次へ」「前へ」ボタンクリックでページが1つ送り/戻りする。先頭ページで「前へ」、最終ページで「次へ」が非活性（`disabled`）である | TC-FR-SYS-005（E2E） | 未実施 |
| FR-SYS-006 | ACC-FR-SYS-006: 右矢印キー押下で次ページ、左矢印キー押下で前ページに遷移する | TC-FR-SYS-006（E2E） | 未実施 |
| FR-SYS-008 | ACC-FR-SYS-008: 画面内に「現在ページ数 / 総ページ数」のテキストが表示され、ページ送りに応じて数値が更新される | TC-FR-SYS-008（E2E） | 未実施 |
| FR-SYS-011 | ACC-FR-SYS-011: 会員ページ内の「目次へ戻る」要素クリックで目次ページへ遷移する | TC-FR-SYS-011（E2E） | 未実施 |
| FR-SYS-009 | ACC-FR-SYS-009: 全画面ボタンクリックで`document.fullscreenElement`が非nullになる。Fullscreen API非対応ブラウザではボタンが非表示 | TC-FR-SYS-009（E2E、Could優先度のため任意実施） | 未実施 |
| FR-SYS-012 | ACC-FR-SYS-012: 初回読み込み中はローディング要素が表示され、データ読み込み完了後に非表示化される | TC-FR-SYS-012（E2E、Could優先度のため任意実施） | 未実施 |
| NFR-FUNC-001 | ACC-NFR-FUNC-001: Must/Should全FRのE2Eテストが100%成功する | TC-NFR-FUNC-001 | 未実施 |
| NFR-PERF-001 | ACC-NFR-PERF-001: Lighthouse計測でLCPが3秒以内（Slow 3Gスロットリング条件） | TC-NFR-PERF-001 | 未実施 |
| NFR-PERF-002 | ACC-NFR-PERF-002: `dist/assets/*.js`の合計gzipサイズが200KB以内 | TC-NFR-PERF-002 | 未実施 |
| NFR-COMP-001 | ACC-NFR-COMP-001: Chrome/Safari/Edge/Firefox最新2版でのE2Eがいずれも成功 | TC-NFR-COMP-001 | 未実施 |
| NFR-SEC-001 | ACC-NFR-SEC-001: 全外部リンクに`noopener noreferrer`が付与されていることを静的解析で確認 | TC-NFR-SEC-001 | 未実施 |
| NFR-MAINT-001 | ACC-NFR-MAINT-001: `vitest --coverage`のライン網羅率が80%以上 | TC-NFR-MAINT-001 | 未実施 |
| NFR-PORT-001 | ACC-NFR-PORT-001: `npm run build`のみでdist/が生成され、GitHub Pages/Netlify双方にそのままデプロイ可能なことを確認 | TC-NFR-PORT-001 | 未実施 |
