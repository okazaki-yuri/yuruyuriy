# 設計書 : ツール一覧ページ

公開中および今後公開予定のツールを一覧表示するページ。

- URL: `https://tools.yl-yuriy.com/tools/`
- ファイル: `apps/web/app/(ja)/tools/page.tsx`（薄いラッパー）。実体は `apps/web/app/content/tools.tsx`（[i18n.md](./i18n.md) 参照）
- 使用CSS: `apps/web/app/styles/style.css`（`.tool-list-page` 系）, `apps/web/app/styles/header-footer.css`
- 上位ドキュメント: [README](../README.md)
- ツールの追加手順は [add-new-tool.md](./add-new-tool.md) を参照。

---

## 1. 目的
- サイトが提供するツールを一覧化し、各ツールページへの導線を提供する。
- 準備中（Coming Soon）のツールも枠として表示し、今後の展開を示す。

## 2. データ取得
- 公開中ツールの一覧は `@yuruyuriy/core` の **`toolsRepository.getTools(locale)`** から取得する（データ実体は `data/tools.json`。`name` / `description` は `{ ja, en }` の多言語オブジェクトで、リポジトリがロケール解決して返す）。
- ページはデータ実体（JSON/API）を知らず、**repository I/F 経由でのみ**参照する。カードの手動編集は不要で、`tools.json` への追加だけで一覧に反映される。

## 3. 画面構成
1. **見出しエリア（`.tools-heading-area`）**
   - タイトル「🛠 ツール一覧」と説明文
2. **ツールカード一覧（`.tool-list-container`）** … カードを横並び（`flex` / 折り返し）で表示
   - **公開中ツール（`.tool-card.active-tool`）**: `tools` 配列から `map` で生成。リンク付き。ホバーで浮き上がる演出。
   - **準備中ツール（`.tool-card.coming-soon`）**: リンクなし・半透明表示。プレースホルダ枠（現在2枚）を `Array.from` で生成。

## 4. カードの構造
各カードは以下で構成される（`tools.json` の `icon` / `name` / `description` / `href` に対応）。
- アイコン（絵文字 `.tool-icon`）
- ツール名（`.tool-name`）
- 説明文（`.tool-description`）

公開中カードのみ `<a class="tool-link">` でツールページへリンクする。

## 5. SEO・メタデータ
- `metadata` … title「ツール一覧」/ description / canonical `/tools/` / OGP（`buildOpenGraph()`）。
- 構造化データ（JSON-LD） … `BreadcrumbList` と、ツール一覧から生成する `ItemList` を `JsonLd` コンポーネントで埋め込む。

## 6. 依存・外部連携
- `@yuruyuriy/core`（`toolsRepository`）
- Google Analytics（gtag.js）/ Google Fonts / ヘッダー・フッターは言語別ルートレイアウト（`apps/web/app/(ja)/layout.tsx`、実体は `apps/web/app/content/root.tsx`）で共通提供される。

## 7. 拡張時の指針
- 新規ツールの追加は [add-new-tool.md](./add-new-tool.md) の手順に従う（`data/tools.json` へ登録 → カードは自動生成）。
- 必要に応じて `coming-soon` プレースホルダ枚数を調整する。
- あわせて `apps/web/app/sitemap.ts` にツールURLを追記する。
