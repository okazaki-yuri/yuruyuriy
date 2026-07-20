# ゆるユーリ（tools.yl-yuriy.com）

「かわいい！！」をコンセプトに、日常で使える便利なWebツールを自主制作・公開している個人サイトです。
本ドキュメントはサイト全体のシステム設計をまとめたものです。各ページの詳細設計は [`docs/`](./docs/) 配下を参照してください。

---

## 1. システム概要

| 項目 | 内容 |
| --- | --- |
| サイト名 | ゆるユーリ |
| 公開URL | https://tools.yl-yuriy.com |
| 関連ブログ | https://yl-yuriy.com （別サイト・外部リンク） |
| 構成 | 静的サイト（HTML / CSS / Vanilla JS のみ、ビルド工程なし） |
| ホスティング | Xserver（レンタルサーバー） |
| デプロイ | GitHub Actions による FTPS アップロード |
| アクセス解析 | Google Analytics|
| フォント | Google Fonts「M PLUS Rounded 1c」 |
| 対応 | レスポンシブ（PC / スマホ） |

### 設計方針
- **フレームワーク・ビルドツールを使わない**シンプルな静的構成。ファイルをそのままサーバーへ配置すれば動作する。
- ツールはすべて**クライアントサイド完結**。サーバーサイド処理・DBは持たない。
- ユーザーデータの永続化が必要なツールは**ブラウザの localStorage** を利用する（サーバーに送信しない）。
- ヘッダー・フッターは共通部品化し、各ページから**JavaScript（fetch）で読み込む**。

---

## 2. ディレクトリ構成

```
/
├── index.html                  … トップページ
├── tools/
│   ├── index.html              … ツール一覧ページ
│   ├── wordroulette-chan/      … ことばルーレットちゃん（単語抽選ツール）
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   └── web-dice-chan/          … WEBサイコロちゃん（サイコロツール）
│       ├── index.html
│       ├── style.css
│       └── script.js
├── contact/
│   ├── index.html              … お問い合わせページ
│   └── style.css
├── legal/
│   ├── privacy-policy/index.html … プライバシーポリシー
│   ├── terms-of-service/index.html … 利用規約
│   └── style.css               … 規約・ポリシー共通CSS
├── components/                 … 全ページ共通のヘッダー・フッター
│   ├── header.html
│   ├── footer.html
│   ├── header-footer.css
│   └── header-footer.js
├── css/
│   └── style.css               … サイト共通CSS
├── assets/                     … 画像・アイコン類（ロゴ、SNSアイコン、favicon）
├── sitemap.xml                 … サイトマップ（SEO）
├── robots.txt                  … クローラ制御（SEO）
└── .github/workflows/deploy.yaml … デプロイ用ワークフロー
```

---

## 3. 共通アーキテクチャ

### 3.1 ページ共通の読み込み構造
すべてのHTMLページは概ね以下の構造を持つ。

1. `<head>` 内で以下を読み込む
   - ファビコン（`/assets/favicon.ico`）
   - サイト共通CSS（`/css/style.css`）
   - Google Fonts（M PLUS Rounded 1c）
   - ヘッダー・フッター共通CSS（`/components/header-footer.css`）
   - ページ専用CSS（存在する場合）
   - Google Analytics（gtag.js）
   - OGP / SEO 用の `<meta>` 群
2. `<body>` に空のプレースホルダ `<div id="header-container">` / `<div id="footer-container">` を配置
3. ページ末尾で `/components/header-footer.js` を読み込み、ヘッダー・フッターを動的に挿入
4. ツールページはさらにページ専用 `script.js` を読み込む

詳細は [共通コンポーネント設計書](./docs/common-components.md) を参照。

### 3.2 共通コンポーネント（ヘッダー・フッター）
- `components/header-footer.js` が `DOMContentLoaded` 後に `header.html` / `footer.html` を `fetch` して挿入する。
- ヘッダーはPC用ナビとスマホ用ハンバーガーメニューを内包し、開閉制御もこのJSが担う。
- fetch挿入までのレイアウトシフト（CLS）を防ぐため、`#header-container` に `min-height` を予約している。

### 3.3 スタイル構成
- `css/style.css` … サイト全体で使う共通スタイル（トップ、ツール一覧、ツール共通の概要/使い方エリアなど）。
- `components/header-footer.css` … ヘッダー・フッター専用。全ページで読み込む。
- 各ページ / ツールディレクトリの `style.css` … そのページ固有のスタイル。
- カラーは全体的に**クリーム・ベージュ系のやさしいトーン**で統一。

### 3.4 データの扱い
- サーバー送信は行わず、ツールの状態は **localStorage** に保存する。
  - `wordrouletteWords` … ことばルーレットちゃんの登録単語一覧
  - `diceHistory` … WEBサイコロちゃんの抽選履歴
- 個人を特定する情報は保存しない（[プライバシーポリシー](./docs/privacy-policy.md)参照）。

---

## 4. デプロイ / CI

- ワークフロー: `.github/workflows/deploy.yaml`
- トリガー: `workflow_dispatch`（GitHub上から手動実行）
- 処理: リポジトリをチェックアウトし、`SamKirkland/FTP-Deploy-Action` で Xserver へアップロード
- 認証情報は GitHub Secrets（`FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD`）で管理
- Xserver は FTPS（明示的FTP over TLS）を利用。サーバー側の「FTP制限設定」が有効だとランナーIPが弾かれるため注意。

---

## 5. SEO

- `sitemap.xml` … 主要ページのURL・優先度・更新頻度を記載。
- `robots.txt` … 全クローラを許可し、`sitemap.xml` の場所を通知。
- 各ページに `description` / OGP（`og:title`・`og:description`・`og:image`・`og:url` 等）メタを設定。

---

## 6. 各ページ設計書

| ページ | パス | 設計書 |
| --- | --- | --- |
| トップページ | `/` | [docs/top.md](./docs/top.md) |
| ツール一覧 | `/tools/` | [docs/tools-list.md](./docs/tools-list.md) |
| ことばルーレットちゃん | `/tools/wordroulette-chan/` | [docs/wordroulette-chan.md](./docs/wordroulette-chan.md) |
| WEBサイコロちゃん | `/tools/web-dice-chan/` | [docs/web-dice-chan.md](./docs/web-dice-chan.md) |
| お問い合わせ | `/contact/` | [docs/contact.md](./docs/contact.md) |
| プライバシーポリシー | `/legal/privacy-policy/` | [docs/privacy-policy.md](./docs/privacy-policy.md) |
| 利用規約 | `/legal/terms-of-service/` | [docs/terms-of-service.md](./docs/terms-of-service.md) |
| 共通コンポーネント（ヘッダー・フッター） | `/components/` | [docs/common-components.md](./docs/common-components.md) |

---

## 7. 運用・開発ドキュメント

| ドキュメント | 内容 |
| --- | --- |
| [docs/add-new-tool.md](./docs/add-new-tool.md) | 新しいツールを追加する手順（チェックリスト付き） |
| [docs/deploy.md](./docs/deploy.md) | デプロイ手順・Secrets・Xserver注意点・トラブルシューティング |
| [docs/style-guide.md](./docs/style-guide.md) | デザイン / コーディング規約（カラーパレット・命名・共通クラス） |
| [CHANGELOG.md](./CHANGELOG.md) | 変更履歴 |

---

## 8. ローカルでの動作確認

ビルド不要。任意の静的HTTPサーバーで配信すればよい（ルート相対パス `/...` を使っているため、リポジトリのルートをドキュメントルートとして起動すること）。

```bash
# 例: Python の簡易サーバー
python3 -m http.server 8000
# → http://localhost:8000/ で確認
```
