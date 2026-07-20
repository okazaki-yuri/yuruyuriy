# 01. 目標構成と技術選定

## 技術選定と理由

| レイヤ | 採用 | 理由 |
|---|---|---|
| フロント | **Next.js（App Router）** | SSGでSEOを維持。将来SSR/ISRへ拡張余地も残せる |
| ビルド出力 | **Static Export（`output: 'export'`）** | 常駐サーバ不要 → 生成された静的ファイルを**今のFTPでXserverへ**置ける |
| 言語 | **TypeScript** | `core` を Web/スマホで共有するため型で揃える |
| モノレポ | **pnpm workspace** | `core` / `data` / `web` を1リポジトリで管理。追加ツール不要で軽い |
| スマホ（将来） | **React Native (Expo)** | `core` と `data` をそのまま再利用でき、挙動を一致させられる |

> Xserver共有プランは **常駐プロセス（JVM/Node）が動かない**ため、Spring Boot・Next.jsのSSRサーバは不可。
> 「静的書き出し」に限定することがこの構成の絶対条件。

## 目標ディレクトリ構成

```
yuruyuriy/
├── package.json                 # workspace ルート
├── pnpm-workspace.yaml
├── data/                        # ★参照データ群（静的JSON等）
│   └── tools.json               #   例：ツール一覧のメタ情報
├── packages/
│   └── core/                    # ★共通ロジック(TS) … Web/スマホ共通
│       ├── package.json
│       └── src/
│           ├── index.ts         #   バレル（roulette/dice/data を re-export）
│           ├── roulette.ts      #   wordroulette の抽選ロジック
│           ├── dice.ts          #   web-dice のロジック
│           └── data/            #   データ取得I/F（05章）
│               ├── types.ts
│               └── toolsRepository.ts
├── apps/
│   └── web/                     # Next.js アプリ
│       ├── package.json
│       ├── next.config.js
│       ├── public/              # 静的資産（下記マッピング参照）
│       │   ├── assets/          #   favicon.ico もこの中（現行どおり /assets/favicon.ico）
│       │   ├── robots.txt
│       │   └── sitemap.xml      #   or app/sitemap.ts で動的生成
│       └── app/
│           ├── layout.tsx       #   共通ヘッダ/フッタ・GA・メタ
│           ├── page.tsx         #   /            (現 index.html)
│           ├── tools/
│           │   ├── page.tsx     #   /tools/
│           │   ├── wordroulette-chan/page.tsx
│           │   └── web-dice-chan/page.tsx
│           ├── contact/page.tsx
│           └── legal/
│               ├── privacy-policy/page.tsx
│               └── terms-of-service/page.tsx
└── docs/migration/              # 本手順書
```

## 現行 → 新構成 のマッピング

| 現行ファイル | 新しい置き場所 |
|---|---|
| `index.html` | `apps/web/app/page.tsx` |
| `tools/index.html` | `apps/web/app/tools/page.tsx` |
| `tools/wordroulette-chan/index.html` | `apps/web/app/tools/wordroulette-chan/page.tsx` |
| `tools/wordroulette-chan/script.js` | `packages/core/src/roulette.ts`（ロジック）＋ページ側のイベント配線 |
| `tools/web-dice-chan/*` | 同上（`packages/core/src/dice.ts`） |
| `contact/index.html` | `apps/web/app/contact/page.tsx` |
| `legal/**/index.html` | `apps/web/app/legal/**/page.tsx` |
| `components/header.html` / `footer.html` | `apps/web/app/layout.tsx`（Reactコンポーネント化） |
| `components/header-footer.js` | **不要**（JSでのHTML後読み込みを廃止 → SEO/性能向上） |
| `css/style.css` ほか | `apps/web/app/**` の CSS Modules or `globals.css` |
| `assets/`（favicon.ico 含む）, `robots.txt`, `sitemap.xml` | `apps/web/public/` |

> favicon はルートではなく `assets/favicon.ico` にあり、HTMLから `/assets/favicon.ico` で参照されている。
> `assets/**` をそのまま `public/assets/**` へ移せばパスは維持される（ルートへの移動は不要）。

## 重要な設計ポイント

- **ヘッダ/フッタのJS後読み込みを廃止**する。現状は `header-footer.js` がDOMに後から差し込んでいるが、
  Next.jsのlayoutで最初からHTMLに含めることで、クローラに確実に見え、レイアウトシフトも消える。
- **ツールロジックは必ず `core` に置く**。ページ側は「入力を受けて `core` を呼び、結果を描画する」だけにする。
  これが Web/スマホ挙動一致の担保になる。
- **データは `core/src/data/` のI/F経由でのみ参照**する（[05章](./05-data-interface.md)）。
