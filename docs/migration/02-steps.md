# 02. 段階的移行手順（本体）

各 Step は独立してコミットすること。ローカルで確認できるまで次へ進まない。

---

## Step 0. 準備・ブランチ作成

```bash
node -v      # 20 LTS 以上（CIの node-version: 20 と揃える）
corepack enable && corepack prepare pnpm@latest --activate

git switch -c feature/nextjs-migration
```

- 移行作業は既存の `master` を壊さないよう **ブランチで進める**。
- 旧HTML群は移行完了まで**消さずに残す**（比較・ロールバック用）。

---

## Step 1. モノレポの骨組み

ルートに `pnpm-workspace.yaml`：

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

ルート `package.json`（抜粋）：

```json
{
  "name": "yuruyuriy",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter web build"
  }
}
```

`packages/core/package.json`：

```json
{
  "name": "@yuruyuriy/core",
  "version": "0.0.0",
  "type": "module",
  "main": "src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./data/*": "./src/data/*.ts"
  }
}
```

- `src/index.ts` はバレルファイル。`roulette.ts` / `dice.ts` / `data/` の公開APIを re-export する。
- `"./data/*"` のサブパス export は、[05章](./05-data-interface.md)の
  `@yuruyuriy/core/data/toolsRepository` という import を解決させるために必要。

---

## Step 2. Next.js アプリを作成し、静的エクスポート設定

```bash
# 対話を残さないよう選択肢はフラグで明示（Tailwind/ESLintは現行構成に無いため不使用）
pnpm create next-app apps/web --ts --app --no-src-dir --no-tailwind --no-eslint --import-alias "@/*" --use-pnpm
```

`apps/web/next.config.js` を**静的エクスポート用**に設定：

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // out/ に静的書き出し
  trailingSlash: true,       // /tools/ 形式を維持（現行URLと一致させる）
  images: { unoptimized: true }, // 静的エクスポートでは最適化サーバが無いためオフ
  transpilePackages: ['@yuruyuriy/core'], // workspaceパッケージの生TSをNext側でコンパイル
};
module.exports = nextConfig;
```

- **`transpilePackages` は必須**。`core` は生のTypeScript（`src/index.ts`）を公開する設計のため、
  この指定がないと Step 5 以降で `core` を import した時点でビルドが失敗する。
- `trailingSlash: true` が肝。現行は `/tools/` のようなディレクトリ形式なので、これで
  `out/tools/index.html` が生成され **URLが完全一致**する（[03章](./03-seo.md)参照）。
- `pnpm --filter web dev` で `http://localhost:3000` が開けることを確認。

---

## Step 3. 共通レイアウト（ヘッダ/フッタ/GA/メタ）

`apps/web/app/layout.tsx` に集約する：

- `components/header.html` / `footer.html` の中身を **Reactコンポーネント化**して常時描画
- Google Analytics(gtag) は `next/script` で読み込む：

```tsx
import Script from 'next/script';

// <head> 相当。metadata は各 page.tsx でも上書き可
export const metadata = {
  metadataBase: new URL('https://tools.yl-yuriy.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-WP93BYLBD9" strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-WP93BYLBD9');
        `}</Script>
      </body>
    </html>
  );
}
```

> `header-footer.js`（JS後読み込み）は移植せず廃止する。

---

## Step 4. 静的資産の移設

現行の以下を `apps/web/public/` にそのまま移す（**パスは変えない**）：

```
assets/**        → apps/web/public/assets/**   （favicon.ico もこの中。/assets/favicon.ico のまま）
robots.txt       → apps/web/public/robots.txt
sitemap.xml      → apps/web/public/sitemap.xml   （or app/sitemap.ts で生成：03章）
css/style.css    → globals.css もしくは CSS Modules へ移植
```

> favicon はルート直下ではなく `assets/favicon.ico` にあり、各HTMLの `<link rel="icon">` も
> `/assets/favicon.ico` を参照している。`assets/**` の移設だけでパスが維持されるので、
> ルートへ移したり `app/favicon.ico`（Next.jsの自動配置）を使ったりしない。

`public/` 直下のものは `/` からのパスで配信される（例：`public/assets/logo.png` → `/assets/logo.png`）。
既存HTMLの参照パス（`/assets/...` `/css/...`）と一致するように配置する。

---

## Step 5. ツールロジックを `core` へ切り出し

例：wordroulette の抽選を純粋関数化して `packages/core/src/roulette.ts` に移す。

```ts
// packages/core/src/roulette.ts
export function pickRandom<T>(items: T[], rng: () => number = Math.random): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(rng() * items.length)];
}
```

- **DOM操作・localStorage・演出は含めない**（それらはWeb側）。純粋ロジックだけを置く。
- `rng` を差し替え可能にしておくと**テストが安定**し、スマホでも同じ結果を再現できる。
- ページ側（`app/tools/wordroulette-chan/page.tsx`）は Client Component（`'use client'`）にして、
  入力・localStorage・アニメーションを担当し、抽選部分だけ `core` を呼ぶ。

同様に web-dice を `packages/core/src/dice.ts` へ。

---

## Step 6. 各ページの移植

[01章のマッピング表](./01-architecture.md#現行--新構成-のマッピング)に沿って `page.tsx` を作成。

- 静的な文言・リンクはそのままJSX化
- **各ページの `<title>` / `description` / OGP** は必ず移植（[03章](./03-seo.md)）
- 参照データを使うページは `core` のデータI/F経由で取得（[05章](./05-data-interface.md)）

移植後、`pnpm --filter web dev` で全URLを目視確認：
`/` `/tools/` `/tools/wordroulette-chan/` `/tools/web-dice-chan/` `/contact/`
`/legal/privacy-policy/` `/legal/terms-of-service/`

---

## Step 7. ビルド確認

```bash
pnpm --filter web build      # out/ が生成される
npx serve apps/web/out       # ローカルで静的配信して最終確認
```

- 生成された `out/` の中に、現行と**同じディレクトリ/ファイル構成**（各ルートに `index.html`）が
  できていることを確認。
- ここまで緑になったらデプロイ設定へ（[04章](./04-deploy.md)）。

---

## Step 8. 切り替えと後始末

1. [04章](./04-deploy.md)の手順でステージング確認 → 本番反映
2. 本番でSEO/表示/計測に問題がないことを数日モニタ
3. 問題なければ旧 `index.html` / `tools/*.html` / `components/` / 旧 `css/` 等を削除してコミット
   （サーバ側の旧ファイルは切替初回デプロイの差分同期で既に削除されている（[04章](./04-deploy.md)参照）。
   ここでの削除はリポジトリ整理が目的）
