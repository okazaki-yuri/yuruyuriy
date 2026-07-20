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
- 構造化データ（JSON-LD）は `apps/web/app/components/JsonLd.tsx` を用いて各ページに埋め込む。
- OGP 画像（1200×630 の `og-image.png`）は `apps/web/scripts/generate-og.cjs` が **build 時に生成**する（`apps/web` の `build` スクリプトが `next build` の前に実行）。生成物 `apps/web/public/assets/og-image.png` は `.gitignore` 済みでコミットしない。各ページは `apps/web/app/og.ts` の `OG_IMAGE` を `openGraph.images` に指定する。
