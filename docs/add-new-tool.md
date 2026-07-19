# 手順書 : 新しいツールの追加

`tools/` 配下に新しいツールを追加する際の手順をまとめる。既存の [ことばルーレットちゃん](./wordroulette-chan.md) / [WEBサイコロちゃん](./web-dice-chan.md) と同じ構成・作法にそろえること。

- 上位ドキュメント: [README](../README.md)

---

## 1. ディレクトリとファイルを作成する

`tools/<tool-slug>/` を作成し、以下3ファイルを配置する（`<tool-slug>` は英小文字・ハイフン区切り。例: `web-dice-chan`）。

```
tools/<tool-slug>/
├── index.html   … ツール本体のマークアップ
├── style.css    … ツール専用スタイル
└── script.js    … ツール専用ロジック
```

## 2. index.html を作る（テンプレート）

既存ツールの `index.html` をベースにするのが早い。最低限、以下を既存ページと同じ形で揃える。

- `<head>`
  - `charset` / `viewport`
  - `description` と OGP（`og:title` / `og:description` / `og:image` / `og:url` / `og:type` / `og:site_name`）… **`og:url` はこのツールのURLに変更する**
  - `<title>`
  - ファビコン `/assets/favicon.ico`
  - 共通CSS `/css/style.css`
  - ツール専用CSS `style.css`（相対パス）
  - Google Fonts（M PLUS Rounded 1c）
  - ヘッダー・フッター共通CSS `/components/header-footer.css`
  - Google Analytics（gtag.js）ブロック
- `<body>`
  - `<div id="header-container"></div>`（先頭）
  - `<main>` … ツール本体
  - `.introduction-area`（ツール概要）と `.howto-area`（使い方ガイド）… 既存ツールに倣う。使い方ガイド末尾から[利用規約](./terms-of-service.md)へリンクする。
  - `<div id="footer-container"></div>`（末尾）
  - `<script src="/components/header-footer.js"></script>`
  - `<script src="script.js"></script>`（相対パス）

> 共通の読み込み構造は [共通コンポーネント設計書](./common-components.md) を参照。

## 3. スタイルを整える
- 共通の見た目（カード・カラー・フォント）は [スタイルガイド](./style-guide.md) に従う。
- ツール固有のスタイルのみ `tools/<tool-slug>/style.css` に書く。共通クラス（`.introduction-area` / `.howto-area` など）は再利用する。

## 4. localStorage を使う場合
- キー名は他ツールと衝突しない一意な名前にする（例: `wordrouletteWords` / `diceHistory`）。
- 保存する値に個人を特定する情報を含めない（[プライバシーポリシー](./privacy-policy.md) 5項に整合させる）。

## 5. ツール一覧に登録する（`tools/index.html`）
- `coming-soon` 枠のカードを1枚、公開ツールのカード（`.tool-card.active-tool`）に置き換える。
  - アイコン（絵文字）、ツール名、説明文、`<a class="tool-link" href="/tools/<tool-slug>/">` を設定。
- 必要に応じて `coming-soon` 枠を1枚追加/削除して枠数を調整する。

## 6. SEO 反映（`sitemap.xml`）
- `<url>` エントリを追加する。

```xml
<url>
  <loc>https://tools.yl-yuriy.com/tools/<tool-slug>/</loc>
  <priority>0.7</priority>
  <lastmod>YYYY-MM-DDThh:mm:ss+09:00</lastmod>
  <changefreq>monthly</changefreq>
</url>
```

## 7. 設計書を追加する
- `docs/<tool-slug>.md` を作成し、既存ツールの設計書（[wordroulette-chan.md](./wordroulette-chan.md) 等）と同じ章立てで記述する。
- [README](../README.md) の「各ページ設計書」テーブルに1行追加する。

## 8. 動作確認
- ローカルサーバーで起動し（`python3 -m http.server`）、リポジトリのルートをドキュメントルートとして確認する（ルート相対パス `/...` を使っているため）。
- 確認観点: ヘッダー/フッターの表示、ツールの主要動作、localStorageの保存/復元、スマホ表示、外部リンク。

## 9. 反映（デプロイ）
- 変更をコミット・プッシュし、[デプロイ手順](./deploy.md) に従って公開する。

---

## チェックリスト
- [ ] `tools/<tool-slug>/` に index.html / style.css / script.js を作成
- [ ] `<head>` の OGP `og:url` をツールURLに変更
- [ ] 概要・使い方ガイドを記載（利用規約へのリンク含む）
- [ ] localStorage キー名の一意性・個人情報を含めないことを確認
- [ ] `tools/index.html` にツールカードを追加
- [ ] `sitemap.xml` にURLを追記
- [ ] `docs/<tool-slug>.md` を作成し README のテーブルに追記
- [ ] ローカルで動作確認
- [ ] コミット → デプロイ
