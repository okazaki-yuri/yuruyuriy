# 設計書 : お問い合わせページ

サイト運営者への連絡手段を案内するページ。

- URL: `https://tools.yl-yuriy.com/contact/`
- ファイル: `apps/web/app/(ja)/contact/page.tsx`（薄いラッパー）。実体は `apps/web/app/content/contact.tsx` / `contact.css`（[i18n.md](./i18n.md) 参照）
- 使用CSS: `apps/web/app/styles/style.css`, `apps/web/app/content/contact.css`, `apps/web/app/styles/header-footer.css`
- 上位ドキュメント: [README](../README.md)

---

## 1. 目的
- 問い合わせ導線を提供する。フォーム機能自体は自前で持たず、**外部サービス（Googleフォーム）へ誘導**する。

## 2. 画面構成
1. **タイトル・案内文（`.contact-section`）**
2. **Googleフォームへのボタン（`.contact-button-area`）**
   - 外部のGoogleフォーム（`docs.google.com/forms/...`）へ別タブ遷移（`rel="noopener noreferrer"`）
3. **その他の連絡先（`.contact-list`）**
   - メール: `mailto:info@tools.yl-yuriy.com`
   - X（旧Twitter）DM: `https://x.com/ylyuriy_1st`（別タブ）

## 3. SEO・メタデータ
- `metadata` … title「お問い合わせ」/ description / canonical `/contact/` / OGP（`buildOpenGraph()`）。
- 構造化データ（JSON-LD） … `BreadcrumbList` を `JsonLd` コンポーネントで埋め込む。

## 4. 設計方針
- 個人情報を自サイトで直接収集せず、フォーム送信は Google 側に委譲する（[プライバシーポリシー](./privacy-policy.md) 4項に整合）。
- サーバーコンポーネント（静的表示のみ）で、独自のクライアントJavaScript処理は持たない。

## 5. 依存・外部連携
- Google フォーム（問い合わせ受付）
- Google Analytics（gtag.js）/ Google Fonts / ヘッダー・フッターは言語別ルートレイアウト（`apps/web/app/(ja)/layout.tsx`、実体は `apps/web/app/content/root.tsx`）で共通提供される。

## 6. 特記事項
- 問い合わせ先メールアドレス・フォームURL・SNSアカウントを変更する場合は本ページのリンクを更新すること。
