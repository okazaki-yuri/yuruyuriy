# 03. SEOを落とさないためのチェックリスト

移行で最もリスクが高いのがSEOの毀損。**「URL・メタ・構造を1:1で維持する」**ことを徹底する。

---

## 1. URLを完全一致させる（最重要）

現行URL（末尾スラッシュ付きのディレクトリ形式）を維持する：

| 現行URL | 対応する page |
|---|---|
| `/` | `app/page.tsx` |
| `/tools/` | `app/tools/page.tsx` |
| `/tools/wordroulette-chan/` | `app/tools/wordroulette-chan/page.tsx` |
| `/tools/web-dice-chan/` | `app/tools/web-dice-chan/page.tsx` |
| `/contact/` | `app/contact/page.tsx` |
| `/legal/privacy-policy/` | `app/legal/privacy-policy/page.tsx` |
| `/legal/terms-of-service/` | `app/legal/terms-of-service/page.tsx` |

- `next.config.js` の **`trailingSlash: true`** で末尾スラッシュを維持（[02章 Step 2](./02-steps.md#step-2-nextjs-アプリを作成し静的エクスポート設定)）。
- URLを変える必要が出た場合のみ、Xserverの `.htaccess` で **301リダイレクト**を張る
  （変えないのが原則。安易にURLを変えない）。

---

## 2. ページ単位のメタ情報を移植する

現 `index.html` にある以下を、各 `page.tsx` の `metadata` に**漏れなく**移す：

```tsx
// 例: app/page.tsx
export const metadata = {
  title: 'ゆるユーリ | かわいいWebツールを集めたサイト',
  description: 'ゆるユーリは、日常で使える便利なWebツールを自主制作しているサイトです。',
  openGraph: {
    title: 'ゆるユーリ | 便利なWebツールを自主制作しているサイト',
    description: '日常で使える便利なWebツールを自主制作しているサイトです。',
    url: 'https://tools.yl-yuriy.com',
    siteName: 'ゆるユーリ',
    images: ['/assets/logo.png'],
    type: 'website',
  },
};
```

チェック項目（全ページ）：

- [ ] `<title>`
- [ ] `meta description`
- [ ] `og:title` / `og:description` / `og:image` / `og:url` / `og:type` / `og:site_name`
- [ ] `lang="ja"`（layout.tsx で設定）
- [ ] `viewport`（Next.jsが標準付与。必要なら `viewport` export で調整）

> `og:url` はページごとに正しい絶対URLにする。`metadataBase` を設定しておくと相対→絶対変換が効く。

---

## 3. sitemap.xml / robots.txt

**方法A（そのまま維持・簡単）**：現行の `sitemap.xml` / `robots.txt` を `public/` に置くだけ。

> ⚠️ ただし**現行の sitemap.xml には `/legal/privacy-policy/` が入っていない**。
> 方法Aを選ぶ場合もこの欠落だけは直すこと（方法Bなら下記リストに含まれており自動的に解消）。

**方法B（自動生成・おすすめ）**：ページ追加時の更新漏れを防げる。

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://tools.yl-yuriy.com';
  return [
    '', 'tools/', 'tools/wordroulette-chan/', 'tools/web-dice-chan/',
    'contact/', 'legal/privacy-policy/', 'legal/terms-of-service/',
  ].map((p) => ({ url: `${base}/${p}`, changeFrequency: 'monthly' }));
}
```

- [ ] sitemapのURL群が本番URLと**完全一致**しているか
- [ ] robots.txt に sitemap の場所が書かれているか
- [ ] （方法B使用時）`out/sitemap.xml` が生成されているか

---

## 4. 構造・レンダリングの確認

- [ ] **ヘッダ/フッタがHTMLに最初から含まれている**（JS後読み込みを廃止したことの確認）。
      `out/index.html` を開いてナビゲーションのテキストが素のHTMLに存在すること。
- [ ] `<h1>` が各ページに1つ、見出し階層が現行を踏襲しているか
- [ ] 画像に `alt` / `width` / `height` が付いているか（レイアウトシフト対策：既存を踏襲）
- [ ] 内部リンクが正しく `/.../` 形式で張られているか
- [ ] 404ページ（`app/not-found.tsx`）が用意されているか
      - 静的エクスポートでは `out/404.html` が生成されるだけで、Xserverに配信させるには
        `.htaccess` に `ErrorDocument 404 /404.html` の追記が必要（未設定ならXserver標準の404が出る）

---

## 5. 反映後の確認（本番）

- [ ] Google Search Console で対象URLを**URL検査 → インデックス登録をリクエスト**
- [ ] 主要ページのHTTPステータスが 200（旧URLが404になっていないか）
- [ ] OGPが正しく出るか（X/Discord等でURLを貼って確認、またはOGPデバッガ）
- [ ] Google Analytics(gtag) の計測が復活しているか（リアルタイムで確認）
- [ ] Lighthouse で SEO / Performance スコアが移行前より落ちていないか
