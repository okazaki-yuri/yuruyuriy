# ゆるユーリ（tools.yl-yuriy.com）

「かわいい！！」をコンセプトに、日常で使える便利なWebツールを自主制作・公開している個人サイトです。
本ドキュメントはサイト全体のシステム設計をまとめたものです。各ページの詳細設計は [`docs/`](./docs/) 配下を参照してください。

> 旧・素のHTML/CSS/JS構成から **Next.js（静的エクスポート）＋ pnpm モノレポ** へ移行済みです。
> 移行の経緯・設計判断は [`docs/migration/`](./docs/migration/) にまとまっています。

---

## 1. システム概要

| 項目 | 内容 |
| --- | --- |
| サイト名 | ゆるユーリ |
| 公開URL | https://tools.yl-yuriy.com |
| 関連ブログ | https://yl-yuriy.com （別サイト・外部リンク） |
| 構成 | Next.js 15（App Router）+ React 19 の**静的エクスポート**（`output: 'export'`）／pnpm モノレポ |
| パッケージ管理 | pnpm 11（`packageManager` で固定） / Node.js 22 |
| ホスティング | Xserver（レンタルサーバー） |
| デプロイ | GitHub Actions でビルド → 生成物 `out/` を FTPS アップロード |
| アクセス解析 | Google Analytics（gtag.js） |
| フォント | Google Fonts「M PLUS Rounded 1c」 |
| 対応 | レスポンシブ（PC / スマホ） |

### 設計方針
- **静的サイトとして配信**する。Next.js でビルドし、生成された静的HTML（`apps/web/out/`）をサーバーへ配置する（サーバーサイド処理・DBは持たない）。
- ツールはすべて**クライアントサイド完結**。ユーザーデータの永続化が必要なものは**ブラウザの localStorage** を利用する（サーバーに送信しない）。
- **ツールの純粋ロジック（抽選・バリデーション等）は `@yuruyuriy/core` に集約**し、UI（`apps/web`）から分離する。DOM操作・localStorage・演出は Web 側が担う。
- URL は現行と一致させる（`trailingSlash: true` により `/tools/` 形式のディレクトリURLを維持）。

---

## 2. ディレクトリ構成

pnpm ワークスペース（`pnpm-workspace.yaml` の `apps/*` `packages/*`）によるモノレポ。

```
/
├── apps/
│   └── web/                      … Next.js アプリ（App Router / 静的エクスポート）
│       ├── app/
│       │   ├── i18n/             … 多言語対応の辞書・ヘルパー（ja.ts / en.ts。docs/i18n.md 参照）
│       │   ├── content/          … ページ実体（言語間で共有。root.tsx = 共通レイアウト実体）
│       │   ├── (ja)/             … 日本語ルート（/ /tools/ /contact/ /legal/ … 現行URLのまま）
│       │   ├── (en)/en/          … 英語ルート（/en/ 配下。content を locale='en' で呼ぶ）
│       │   ├── sitemap.ts        … sitemap.xml を生成
│       │   ├── global-not-found.tsx … 404（言語別レイアウト構成のため experimental 機能を使用）
│       │   ├── components/       … Header / Footer / ShareButtons ほか共通コンポーネント
│       │   └── styles/           … style.css / header-footer.css
│       ├── public/               … 静的資産（/assets/** favicon・ロゴ・SNSアイコン、robots.txt）
│       ├── next.config.js        … output:'export' / trailingSlash / transpilePackages
│       └── out/                  … ビルド生成物（gitignore・デプロイ対象）
├── packages/
│   └── core/                     … @yuruyuriy/core：ツールの純粋ロジック（UI非依存）
│       └── src/
│           ├── index.ts          … 公開APIのバレル
│           ├── roulette.ts       … 抽選ロジック（pickRandom / sortWords）
│           ├── dice.ts           … サイコロロジック（rollDice / validate / stats）
│           └── data/             … ツールメタのデータI/F（toolsRepository / types）
├── data/
│   └── tools.json                … ツール一覧のマスタデータ（core が取り込む）
├── docs/                         … 設計書・移行手順（docs/migration/ ほか）
├── pnpm-workspace.yaml
├── package.json                  … ルート（dev / build スクリプト、pnpm を固定）
└── .github/workflows/deploy.yaml … ビルド & FTPS デプロイ用ワークフロー
```

---

## 3. 共通アーキテクチャ

### 3.1 共通レイアウト（ヘッダー・フッター）
- 言語別ルートレイアウト（`app/(ja)/layout.tsx` / `app/(en)/layout.tsx`、実体は `app/content/root.tsx`）が全ページ共通の枠組み（`<html lang>`/`<body>`、ヘッダー・フッター、Googleフォント、Google Analytics）を提供する。
- ヘッダー・フッターは `app/components/Header.tsx` / `Footer.tsx` の **React コンポーネント**として常時描画される（旧方式の `header-footer.js` による fetch 挿入は廃止）。
- 共通スタイルは `app/styles/style.css`（サイト全体）と `app/styles/header-footer.css`（ヘッダー・フッター専用）を layout で読み込む。

### 3.2 ツールロジック（`@yuruyuriy/core`）
- 抽選・サイコロ・バリデーションなどの**純粋ロジックは `packages/core`** に置き、UI から分離する（DOM・localStorage・演出は含めない）。
- `next.config.js` の `transpilePackages: ['@yuruyuriy/core']` により、生の TypeScript を Next 側でコンパイルして利用する。
- ページ側（`app/content/*/`）は Client Component（`'use client'`）で入力・localStorage・アニメーションを担当し、抽選部分だけ `core` を呼ぶ。

### 3.3 データの扱い
- ツール一覧のマスタは `data/tools.json`。`@yuruyuriy/core` の `toolsRepository` 経由で取得する（将来 API 化する際も呼び出し側を無改修にできる I/F）。
- ツールの状態はサーバー送信せず **localStorage** に保存する。
  - `wordrouletteWords` … ことばルーレットちゃんの登録単語一覧
  - `diceHistory` … WEBサイコロちゃんの抽選履歴
- 個人を特定する情報は保存しない（[プライバシーポリシー](./docs/privacy-policy.md)参照）。

---

## 4. デプロイ / CI

- ワークフロー: `.github/workflows/deploy.yaml`
- トリガー: `workflow_dispatch`（GitHub上から手動実行）
- 処理: チェックアウト → pnpm/Node 22 セットアップ → `pnpm install --frozen-lockfile` → `pnpm --filter web build`（`apps/web/out/` を生成）→ `SamKirkland/FTP-Deploy-Action` で Xserver へ **`out/` だけ**をアップロード
- 認証情報は GitHub Secrets（`FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD`）で管理
- Xserver は FTPS（明示的FTP over TLS）を利用。サーバー側の「FTP制限設定」が有効だとランナーIPが弾かれるため注意。
- FTP-Deploy-Action は差分同期。`local-dir` を `out/` に絞っているため、ソースや `node_modules` は本番に上がらない。詳細は [docs/migration/04-deploy.md](./docs/migration/04-deploy.md)。

---

## 5. SEO

- `apps/web/app/sitemap.ts` … 主要ページのURL等を記載した `sitemap.xml` をビルド時に生成。
- `apps/web/public/robots.txt` … 全クローラを許可し、`sitemap.xml` の場所を通知。
- 各ページの `<title>` / `description` / OGP は各 `page.tsx` の `metadata` で設定。方針は [docs/migration/03-seo.md](./docs/migration/03-seo.md)。

---

## 6. 各ページ設計書

| ページ | パス | 設計書 |
| --- | --- | --- |
| トップページ | `/` | [docs/top.md](./docs/top.md) |
| ツール一覧 | `/tools/` | [docs/tools-list.md](./docs/tools-list.md) |
| ことばルーレットちゃん | `/tools/wordroulette-chan/` | [docs/wordroulette-chan.md](./docs/wordroulette-chan.md) |
| WEBサイコロちゃん | `/tools/web-dice-chan/` | [docs/web-dice-chan.md](./docs/web-dice-chan.md) |
| あみだくじちゃん | `/tools/amidakuji-chan/` | [docs/amidakuji-chan.md](./docs/amidakuji-chan.md) |
| お問い合わせ | `/contact/` | [docs/contact.md](./docs/contact.md) |
| プライバシーポリシー | `/legal/privacy-policy/` | [docs/privacy-policy.md](./docs/privacy-policy.md) |
| 利用規約 | `/legal/terms-of-service/` | [docs/terms-of-service.md](./docs/terms-of-service.md) |

> 各ページには英語版（`/en/` 配下、例: `/en/tools/`）があります。設計書は日本語版と共通で、多言語対応の構成は [docs/i18n.md](./docs/i18n.md) を参照してください。

> 一部の設計書は旧・素のHTML構成を前提に書かれています。現行アーキテクチャの正は [`docs/migration/`](./docs/migration/) を参照してください。

---

## 7. 運用・開発ドキュメント

| ドキュメント | 内容 |
| --- | --- |
| [docs/local-development.md](./docs/local-development.md) | ローカルでの起動・動作確認手順（環境準備・チェックリスト・トラブル対応） |
| [docs/migration/](./docs/migration/) | Next.js 静的エクスポート構成への移行手順・設計判断（現行構成の正） |
| [docs/add-new-tool.md](./docs/add-new-tool.md) | 新しいツールを追加する手順（現行構成・チェックリスト付き） |
| [docs/style-guide.md](./docs/style-guide.md) | デザイン / コーディング規約（カラーパレット・命名・共通クラス） |
| [docs/i18n.md](./docs/i18n.md) | 多言語対応（i18n）基盤の設計書（辞書・Route Groups・localizePath） |
| [docs/i18n-plan.md](./docs/i18n-plan.md) | 多言語対応の方針・フェーズ計画・懸念点の検討資料 |
| [docs/legacy/](./docs/legacy/) | 旧・素のHTML構成時代のアーカイブ文書（参考） |
| [CHANGELOG.md](./CHANGELOG.md) | 変更履歴 |

---

## 8. ローカルでの開発・確認

Node.js 22.13以上 と pnpm 11（`corepack enable` で有効化）が必要。

```bash
pnpm install

# 開発サーバー（http://localhost:3000）
pnpm dev            # = pnpm --filter web dev

# 静的エクスポートのビルド → apps/web/out/ を生成
pnpm build          # = pnpm --filter web build

# 生成物をローカル配信して最終確認
npx serve apps/web/out
```

環境準備（Node/pnpm が見つからない場合の対処含む）・動作確認チェックリスト・トラブル対応は
[docs/local-development.md](./docs/local-development.md) にまとめている。
