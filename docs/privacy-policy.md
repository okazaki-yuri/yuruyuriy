# 設計書 : プライバシーポリシーページ

当サイトにおける個人情報・データの取り扱い方針を掲載する法務ページ。

- URL: `https://tools.yl-yuriy.com/legal/privacy-policy/`
- ファイル: `legal/privacy-policy/index.html`
- 使用CSS: `css/style.css`, `legal/style.css`（規約・ポリシー共通）, `components/header-footer.css`
- 専用JS: なし（共通の `header-footer.js` のみ）
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

## 3. 設計・整合性メモ
- 本ページの記載は実装と整合している必要がある。
  - 4項 … 実際に gtag.js（Google Analytics）と Google フォームを利用（[お問い合わせ](./contact.md)）。
  - 5項 … 実際にツールが localStorage を使用（[ことばルーレットちゃん](./wordroulette-chan.md) / [WEBサイコロちゃん](./web-dice-chan.md)）。
- 静的表示のみで独自JavaScriptは持たない。

## 4. 依存・外部連携
- Google Analytics（gtag.js）/ Google Fonts / ヘッダー・フッター（[共通](./legacy/common-components.md)）

## 5. 特記事項
- 解析ツールや外部サービスの追加・変更時は、本ページの記載も更新すること。
