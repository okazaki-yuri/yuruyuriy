# 設計書 : ツール一覧ページ

公開中および今後公開予定のツールを一覧表示するページ。

- URL: `https://tools.yl-yuriy.com/tools/`
- ファイル: `tools/index.html`
- 使用CSS: `css/style.css`（`.tool-list-page` 系）, `components/header-footer.css`
- 専用JS: なし（共通の `header-footer.js` のみ）
- 上位ドキュメント: [README](../README.md)

---

## 1. 目的
- サイトが提供するツールを一覧化し、各ツールページへの導線を提供する。
- 準備中（Coming Soon）のツールも枠として表示し、今後の展開を示す。

## 2. 画面構成
1. **見出しエリア（`.tools-heading-area`）**
   - タイトル「🛠 ツール一覧」と説明文
2. **ツールカード一覧（`.tool-list-container`）** … カードを横並び（`flex` / 折り返し）で表示
   - **公開中ツール（`.tool-card.active-tool`）**: リンク付き。ホバーで浮き上がる演出。
     - ことばルーレットちゃん（🎡 / `/tools/wordroulette-chan/`）
     - WEBサイコロちゃん（🎲 / `/tools/web-dice-chan/`）
   - **準備中ツール（`.tool-card.coming-soon`）**: リンクなし・半透明表示（`opacity: 0.6`）。プレースホルダとして複数枠を配置。

## 3. カードの構造
各カードは以下で構成される。
- アイコン（絵文字 `.tool-icon`）
- ツール名（`.tool-name`）
- 説明文（`.tool-description`）

公開中カードのみ `<a class="tool-link">` でツールページへリンクする。

## 4. スタイル方針
- カード型UI（角丸・影・淡い背景）。
- `active-tool` はホバーで `translateY` による浮き上がり。
- スマホ表示（`max-width: 600px`）でカード幅を100%に。

## 5. 依存・外部連携
- Google Analytics（gtag.js）
- Google Fonts（M PLUS Rounded 1c）
- ヘッダー・フッター（[共通コンポーネント](./legacy/common-components.md)）

## 6. 拡張時の指針
- 新規ツールを追加する際は、`active-tool` カードを1枚追加し、対応する `coming-soon` 枠を1枚減らす運用。
- あわせて `sitemap.xml` にツールURLを追記する。
