# CLAUDE.md

このファイルは Claude Code（および開発者）向けのプロジェクト運用メモです。

## プロジェクト構成

- pnpm モノレポ（`pnpm-workspace.yaml`）。
- `apps/web` … Next.js（App Router）。`next.config.js` で `output: 'export'` の静的エクスポート構成。
- `packages/core` … ドメインロジック／データ（`toolsRepository` など）。web からは I/F 経由で参照する。
- **多言語対応（日本語 + 英語）**。日本語はルート直下（`/tools/` 等）、英語は `/en/` 配下。構成の詳細は `docs/i18n.md` を参照。

## 多言語対応（i18n）の運用（重要）

- **表示文言は JSX・CSS にハードコードしない**。`apps/web/app/i18n/ja.ts` と `en.ts` の辞書に持たせ、**文言の追加・変更は必ず両言語セットで行う**（キーの過不足は `satisfies Dictionary` の型チェックで検出される）。CSS の疑似要素で表示する文言も `data-*` 属性 + `content: attr()` 経由にする。
- 例外は法務ページ（利用規約・プライバシーポリシー）で、本文をロケール別ファイル（`app/(ja)/legal/` と `app/(en)/en/legal/`）に持つ。**日本語版が正文**であり、日本語版を改定したら**同じブランチ内で英語版も追随**させる。
- ページ・ツールを追加するときは、`app/content/` に実体を置き、`app/(ja)/…` と `app/(en)/en/…` の**両方に薄いラッパーを作成**する（手順は `docs/add-new-tool.md`）。`data/tools.json` の `name` / `description` は `{ ja, en }` の多言語オブジェクト。
- 内部リンク・canonical・OGP url・JSON-LD の URL は必ず `localizePath(locale, path)` を通す。
- 言語ごとの機能差（ブログリンク・LINE ボタンの表示可否など）は辞書のフラグ（`header.showBlog` / `share.showLine`）で制御する。
- 404（`app/global-not-found.tsx`）は experimental 機能を使用しているため、**Next.js アップグレード時は `out/404.html` のレイアウト適用を必ず確認**する。

## ビルド成果物の扱い（重要）

- **Git 管理はソースのみ**。具体的には `apps/web/app/**`（`*.tsx` / CSS など）、`packages/**`、設定ファイル群をコミットする。
- **`apps/web/out/`（静的エクスポート成果物）はコミットしない。** `.gitignore` 済み。
  - `out/` は**デプロイ時に `next build` で生成する**もので、リポジトリの管理対象・デプロイ対象ソースには含めない。
  - ローカルで `next build` を実行すると `out/` が再生成されるが、これは Git 差分に出さない（無視する）。
- 同様に `apps/web/.next/`、`node_modules/`、`*.tsbuildinfo` も管理対象外。

## SEO 方針

- 各ページのメタデータは Next.js の Metadata API で定義する。ページ実体（`apps/web/app/content/` の `buildXxxMetadata(locale)`）で組み立て、ルートの `page.tsx` から locale 指定で利用する。
- ルートレイアウト（実体は `apps/web/app/content/root.tsx`）の `metadataBase` を基準に、canonical・OGP 画像などは相対パスで指定してよい。
- canonical と hreflang（`ja` / `en` / `x-default`）は `apps/web/app/site.ts` の **`buildAlternates(locale, path)`** で組み立てる。canonical は各言語ページが自分自身を**トレイリングスラッシュ付き**で指す（`next.config.js` の `trailingSlash: true` と一致させる）。
- sitemap は `apps/web/app/sitemap.ts` で自動生成する（1パスにつき日英2エントリ + hreflang 相互参照）。ページ追加時はこのリストにも追記する。
- **`sitemap.ts` の `lastmod` は各ページの実更新日（`YYYY-MM-DD`）を言語別（`{ ja, en }`）に手動で指定する。** ビルド時刻（`new Date()`）は使わない（無変更ページも毎回更新され、誤った鮮度シグナルになるため）。
  - あるページのコンテンツや見た目を変更したら、その**該当ページ・該当言語の `lastmod` だけ**を更新日へ書き換える（両言語を変更したら両方）。
  - デザイントークン・共通CSS・レイアウトなど**全ページに影響する変更**をした場合は、**全エントリ・全言語の `lastmod`** を更新する。
- 構造化データ（JSON-LD）は `apps/web/app/components/JsonLd.tsx` を用いて各ページに埋め込む。
- OGP 画像（1200×630 の `og-image.png`）は `apps/web/scripts/generate-og.cjs` が **build 時に生成**する（`apps/web` の `build` スクリプトが `next build` の前に実行）。生成物 `apps/web/public/assets/og-image.png` は `.gitignore` 済みでコミットしない。画像本体は言語共通で、`apps/web/app/og.ts` の `OG_IMAGE`（ja）/ `OG_IMAGE_EN`（alt のみ英語）を `buildOpenGraph` がロケールに応じて `openGraph.images` に指定する。
- PWA / apple-touch-icon 用の正方形アイコン（`apple-touch-icon.png` / `icon-192.png` / `icon-512.png`）も `apps/web/scripts/generate-icons.cjs` が **build 時に生成**する（同じく `.gitignore` 済み）。同スクリプトがルート `/favicon.ico` も `assets/favicon.ico` から**ビルド時に複製**する（`<link>` を見ずルートを直接取得するクローラー向け。ソースは assets 側、複製先は `.gitignore` 済み）。Web App Manifest は `apps/web/app/manifest.ts` で `/manifest.webmanifest` として静的生成する。
- OGP/アイコンは日本語をロゴ画像に委ね、`ImageResponse` で latin のみ描画している（同梱フォントが日本語非対応のため）。

## CHANGELOG の運用

- ユーザーに影響する変更（機能・文言・デザイン・SEO・ドキュメントなど）を行ったら、**同じブランチ内で `CHANGELOG.md` にも追記**してからマージする。ビルド設定のみの変更やリファクタリングなど、外から見えない変更は任意。
- フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) 準拠。**日付（`YYYY-MM-DD`、JST）ごとのセクション**に、`### 追加` / `### 変更` / `### 修正` / `### ドキュメント` の小見出しで分類して記載する。
  - 当日のセクションが既にあれば**そこへ追記**し、無ければ**先頭に新しい日付セクションを作る**（新しい日付が上）。
- 記載は「何をなぜ変えたか」が1行で分かる粒度にする。コミット単位の羅列ではなく、**読者（利用者・将来の開発者）目線で意味のあるまとまり**に要約する。
- ページのコンテンツを変更した場合は、`sitemap.ts` の `lastmod` 更新（前述の SEO 方針）と対で漏れがないか確認する。

## docs の運用

- 機能改修に着手する前に、**`docs/` 配下の該当設計書を読んで現状の設計（画面構成・データ設計・主なロジック・依存関係）を把握**してから作業する。実装だけを見て進めず、設計書に書かれた方針・制約（アクセシビリティ対応、localStorage のキー設計など）を踏まえること。
- 機能改修（機能・UI・データ構造・SEO などの変更）を行ったら、**同じブランチ内で `docs/` 配下の該当設計書も更新**してからマージする。対象の目安:
  - ページ・ツールの変更 … 該当ページの設計書（`docs/top.md` / `docs/tools-list.md` / `docs/web-dice-chan.md` / `docs/wordroulette-chan.md` / 法務ページ等）。
  - デザイン・CSS 方針の変更 … `docs/style-guide.md`。
  - ツール追加・構成変更 … `docs/add-new-tool.md` / `docs/local-development.md`。
  - 多言語対応（辞書・ルート構成・hreflang・言語別フラグ等）の変更 … `docs/i18n.md`。
- 設計書は**実装と整合していること**が目的。画面構成・データ設計（localStorage キー等）・主なロジック・依存関係に変更が及んだ箇所を反映する。
- リファクタリングなど外から見えない変更でも、設計書に書かれた内容（ファイル構成・関数名・ロジック）が変わる場合は更新する。
- `docs/legacy/` は旧構成の退避資料のため更新不要。

## Git 運用

- **作業開始前に `master` をチェックアウトし、`git pull` で最新化してから作業ブランチを切る。** ローカルの `master` が古いままブランチを切ると、リモートでマージ済みの変更と競合したり rebase のやり直しが発生するため、必ず最新の `master` を分岐元にする。
  ```bash
  git checkout master
  git pull origin master
  git checkout -b feature/xxx
  ```
- **コミット前に必ず作業ブランチを切る。** `master`（デフォルトブランチ）へ直接コミットしない。作業内容に応じた名前でブランチを作成してから作業・コミットする（例: `feature/design-system`、`fix/...`）。
- 1つのブランチ／コミットには**関連する変更のみ**を含める。無関係の変更（例: 別目的の `.gitignore` 変更）は別コミット・別ブランチに分ける。
