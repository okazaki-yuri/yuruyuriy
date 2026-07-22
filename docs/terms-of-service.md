# 設計書 : 利用規約ページ

当サイトおよびツールの利用条件を掲載する法務ページ。

- URL: `https://tools.yl-yuriy.com/legal/terms-of-service/`
- ファイル: `apps/web/app/(ja)/legal/terms-of-service/page.tsx`（日本語・正文）/ `apps/web/app/(en)/en/legal/terms-of-service/page.tsx`（英語版。「日本語版が正文・優先」の Language 条項付き）。法務ページは本文をロケール別ファイルとして保持し、辞書化しない。**日本語版を改定したら英語版も追随させる**
- 使用CSS: `apps/web/app/styles/style.css`, `apps/web/app/content/legal.css`（規約・ポリシー共通、両言語で共用）, `apps/web/app/styles/header-footer.css`
- 上位ドキュメント: [README](../README.md)

---

## 1. 目的
- ツール・コンテンツの利用範囲、禁止事項、免責、著作権、外部サービスの扱いをユーザーに明示する。

## 2. 掲載内容（セクション構成）
1. 当サイトについて（個人の趣味で制作・公開、誰でも自由に利用可）
2. ご利用にあたって（YouTube・ブログ等での利用可、収益化可、連絡・許可不要／出典表記は任意）
3. 教育機関でのご利用について（授業・教材等での利用可、申請不要）
4. 禁止事項（不正アクセス・過負荷、無断転載・再配布、迷惑行為）
5. ツールやコンテンツについて（動作・結果の無保証、不具合報告の案内、免責）
6. 著作権など（コンテンツの帰属、商用展開の制限）
7. 外部サービスについて（Google フォーム・X 等）
8. その他（規約の見直し）
9. 更新日表記（本文末尾に記載）

## 3. SEO・メタデータ
- `metadata` … title「利用規約」/ description / canonical `/legal/terms-of-service/` / OGP（`buildOpenGraph()`）。
- 構造化データ（JSON-LD） … `BreadcrumbList` を `JsonLd` コンポーネントで埋め込む。

## 4. 設計・整合性メモ
- 各ツールの「使い方ガイド」から本ページへリンクしている（[ことばルーレットちゃん](./wordroulette-chan.md) / [WEBサイコロちゃん](./web-dice-chan.md)）。
- 不具合報告・問い合わせは[お問い合わせページ](./contact.md)へ誘導。
- サーバーコンポーネント（静的表示のみ）で、独自のクライアントJavaScript処理は持たない。

## 5. 依存・外部連携
- Google Analytics（gtag.js）/ Google Fonts / ヘッダー・フッターは言語別ルートレイアウト（`apps/web/app/(ja)/layout.tsx`、実体は `apps/web/app/content/root.tsx`）で共通提供される。

## 6. 特記事項
- 規約改定時は本文の更新日表記も更新すること。
