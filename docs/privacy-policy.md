# 設計書 : プライバシーポリシーページ

当サイトにおける個人情報・データの取り扱い方針を掲載する法務ページ。

- URL: `https://tools.yl-yuriy.com/legal/privacy-policy/`
- ファイル: `apps/web/app/(ja)/legal/privacy-policy/page.tsx`（日本語・正文）/ `apps/web/app/(en)/en/legal/privacy-policy/page.tsx`（英語版。「日本語版が正文・優先」の Language 条項付き）。法務ページは本文をロケール別ファイルとして保持し、辞書化しない。**日本語版を改定したら英語版も追随させる**
- 使用CSS: `apps/web/app/styles/style.css`, `apps/web/app/content/legal.css`（規約・ポリシー共通、両言語で共用）, `apps/web/app/styles/header-footer.css`
- 上位ドキュメント: [README](../README.md)

---

## 1. 目的
- 個人情報の収集・利用・第三者提供、外部サービス・Cookie・localStorage の利用方針をユーザーに明示する。

## 2. 掲載内容（セクション構成）
1. 個人情報の収集について（お問い合わせフォーム経由）
2. 個人情報の利用目的
3. 個人情報の第三者提供について
4. アクセス解析・外部サービスの利用（Google Analytics / Cookie / Google フォーム）
5. ローカルストレージの利用について（ツールの設定・入力内容の保存、個人特定情報は含まない）
6. 外部リンクについて
7. プライバシーポリシーの変更
8. お問い合わせ先（[お問い合わせページ](./contact.md)へのリンク）

## 3. SEO・メタデータ
- `metadata` … title「プライバシーポリシー」/ description / canonical `/legal/privacy-policy/` / OGP（`buildOpenGraph()`）。
- 構造化データ（JSON-LD） … `BreadcrumbList` を `JsonLd` コンポーネントで埋め込む。

## 4. 設計・整合性メモ
- 本ページの記載は実装と整合している必要がある。
  - 4項 … 実際に gtag.js（Google Analytics）と Google フォームを利用（[お問い合わせ](./contact.md)）。
  - 5項 … 実際にツールが localStorage を使用（[ことばルーレットちゃん](./wordroulette-chan.md) / [WEBサイコロちゃん](./web-dice-chan.md)）。
- サーバーコンポーネント（静的表示のみ）で、独自のクライアントJavaScript処理は持たない。

## 5. 依存・外部連携
- Google Analytics（gtag.js）/ Google Fonts / ヘッダー・フッターは言語別ルートレイアウト（`apps/web/app/(ja)/layout.tsx`、実体は `apps/web/app/content/root.tsx`）で共通提供される。

## 6. 特記事項
- 解析ツールや外部サービスの追加・変更時は、本ページの記載も更新すること。
