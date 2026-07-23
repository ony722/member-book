# 採用停止基準表（Adoption Stop Criteria）

| 技術/サービス | 採用停止条件 | 代替案 |
|---|---|---|
| `page-flip`（StPageFlip core, MIT） | 現行LTS Node/Viteでビルドが継続的に失敗する、または重大なセキュリティ脆弱性が修正されないまま放置される場合 | CSS 3D Transform（`rotateY`）による自前の簡易めくり実装（アニメーション品質は下がるが依存ゼロで実装可能） |
| GitHub Pages | 無料枠の帯域上限（100GB/月）を継続的に超過する、または要件変更で認証付き配信が必須になった場合 | Netlify（無料枠100GB/月・Basic認証機能あり）またはCloudflare Pages |
| Vite | メンテナンスが停止し重大な脆弱性が放置される場合 | 他のビルドツール（esbuild単体構成、Parcel等）への移行 |
| 静的JSON管理方式 | 会員数が想定を大幅に超え（数百〜数千件）、ビルド時間や1ファイル編集の衝突リスクが運用上看過できなくなった場合 | 管理画面＋軽量DB（DEFER項目として設計済み、Phase V2で再検討） |
