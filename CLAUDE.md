# CLAUDE.md

このファイルは Claude Code（および開発者）向けのプロジェクト運用メモです。

## プロジェクト構成

- pnpm モノレポ（`pnpm-workspace.yaml`）。
- `apps/web` … Next.js（App Router）。`next.config.js` で `output: 'export'` の静的エクスポート構成。
- `packages/core` … ドメインロジック／データ（`toolsRepository` など）。web からは I/F 経由で参照する。

## ビルド成果物の扱い（重要）

- **Git 管理はソースのみ**。具体的には `apps/web/app/**`（`*.tsx` / CSS など）、`packages/**`、設定ファイル群をコミットする。
- **`apps/web/out/`（静的エクスポート成果物）はコミットしない。** `.gitignore` 済み。
  - `out/` は**デプロイ時に `next build` で生成する**もので、リポジトリの管理対象・デプロイ対象ソースには含めない。
  - ローカルで `next build` を実行すると `out/` が再生成されるが、これは Git 差分に出さない（無視する）。
- 同様に `apps/web/.next/`、`node_modules/`、`*.tsbuildinfo` も管理対象外。

## SEO 方針

- 各ページのメタデータは Next.js の Metadata API（`export const metadata` / 各ページの `page.tsx`）で定義する。
- `apps/web/app/layout.tsx` の `metadataBase` を基準に、canonical・OGP 画像などは相対パスで指定してよい。
- 正規 URL（canonical）は各ページで `alternates.canonical` に**トレイリングスラッシュ付き**で指定する（`next.config.js` の `trailingSlash: true` と一致させる）。
- sitemap は `apps/web/app/sitemap.ts` で自動生成する。ページ追加時はこのリストにも追記する。
- **`sitemap.ts` の `lastmod` は各ページの実更新日（`YYYY-MM-DD`）を手動で指定する。** ビルド時刻（`new Date()`）は使わない（無変更ページも毎回更新され、誤った鮮度シグナルになるため）。
  - あるページのコンテンツや見た目を変更したら、その**該当ページの `lastmod` だけ**を更新日へ書き換える。
  - デザイントークン・共通CSS・レイアウトなど**全ページに影響する変更**をした場合は、**全エントリの `lastmod`** を更新する。
- 構造化データ（JSON-LD）は `apps/web/app/components/JsonLd.tsx` を用いて各ページに埋め込む。
- OGP 画像（1200×630 の `og-image.png`）は `apps/web/scripts/generate-og.cjs` が **build 時に生成**する（`apps/web` の `build` スクリプトが `next build` の前に実行）。生成物 `apps/web/public/assets/og-image.png` は `.gitignore` 済みでコミットしない。各ページは `apps/web/app/og.ts` の `OG_IMAGE` を `openGraph.images` に指定する。
- PWA / apple-touch-icon 用の正方形アイコン（`apple-touch-icon.png` / `icon-192.png` / `icon-512.png`）も `apps/web/scripts/generate-icons.cjs` が **build 時に生成**する（同じく `.gitignore` 済み）。Web App Manifest は `apps/web/app/manifest.ts` で `/manifest.webmanifest` として静的生成する。
- OGP/アイコンは日本語をロゴ画像に委ね、`ImageResponse` で latin のみ描画している（同梱フォントが日本語非対応のため）。

## CHANGELOG の運用

- ユーザーに影響する変更（機能・文言・デザイン・SEO・ドキュメントなど）を行ったら、**同じブランチ内で `CHANGELOG.md` にも追記**してからマージする。ビルド設定のみの変更やリファクタリングなど、外から見えない変更は任意。
- フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.1.0/) 準拠。**日付（`YYYY-MM-DD`、JST）ごとのセクション**に、`### 追加` / `### 変更` / `### 修正` / `### ドキュメント` の小見出しで分類して記載する。
  - 当日のセクションが既にあれば**そこへ追記**し、無ければ**先頭に新しい日付セクションを作る**（新しい日付が上）。
- 記載は「何をなぜ変えたか」が1行で分かる粒度にする。コミット単位の羅列ではなく、**読者（利用者・将来の開発者）目線で意味のあるまとまり**に要約する。
- ページのコンテンツを変更した場合は、`sitemap.ts` の `lastmod` 更新（前述の SEO 方針）と対で漏れがないか確認する。

## docs の運用

- 機能改修（機能・UI・データ構造・SEO などの変更）を行ったら、**同じブランチ内で `docs/` 配下の該当設計書も更新**してからマージする。対象の目安:
  - ページ・ツールの変更 … 該当ページの設計書（`docs/top.md` / `docs/tools-list.md` / `docs/web-dice-chan.md` / `docs/wordroulette-chan.md` / 法務ページ等）。
  - デザイン・CSS 方針の変更 … `docs/style-guide.md`。
  - ツール追加・構成変更 … `docs/add-new-tool.md` / `docs/local-development.md`。
- 設計書は**実装と整合していること**が目的。画面構成・データ設計（localStorage キー等）・主なロジック・依存関係に変更が及んだ箇所を反映する。
- リファクタリングなど外から見えない変更でも、設計書に書かれた内容（ファイル構成・関数名・ロジック）が変わる場合は更新する。
- `docs/legacy/` は旧構成の退避資料のため更新不要。

## Git 運用

- **コミット前に必ず作業ブランチを切る。** `master`（デフォルトブランチ）へ直接コミットしない。作業内容に応じた名前でブランチを作成してから作業・コミットする（例: `feature/design-system`、`fix/...`）。
- 1つのブランチ／コミットには**関連する変更のみ**を含める。無関係の変更（例: 別目的の `.gitignore` 変更）は別コミット・別ブランチに分ける。
