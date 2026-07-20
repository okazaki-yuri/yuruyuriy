# 設計書 : トップページ

サイトの入口となるトップページ。サイト紹介と主要ページ・外部リンクへの導線を提供する。

- URL: `https://tools.yl-yuriy.com/`
- ファイル: `index.html`
- 使用CSS: `css/style.css`（`.top-page` 系）, `components/header-footer.css`
- 専用JS: なし（共通の `header-footer.js` のみ）
- 上位ドキュメント: [README](../README.md)

---

## 1. 目的
- サイト「ゆるユーリ」のコンセプトと概要を伝える。
- 「ツール一覧」「ブログ」「外部リンク（SNS）」への導線を提供する。

## 2. 画面構成
1. **サイトタイトル**（`<h1>ゆるユーリ`）
2. **サイト説明（`.top-description`）**
   - ロゴ画像（`/assets/logo.png`）
   - サイトのコンセプト文（個人製作、趣味のツール公開、「かわいい！！」）
3. **各ページリンク（`.top-section-links`）**
   - ツール一覧ボックス … `/tools/` への遷移ボタン
   - ブログボックス … `https://yl-yuriy.com/`（別タブ）への遷移ボタン
4. **外部リンク（`.external-links`）**
   - リンクカード形式で、X / Instagram / YouTube への導線（すべて別タブ・`rel="noopener"`）
   - 各カードはアイコン画像（`/assets/*_icon.png`）とサービス名で構成

## 3. スタイル方針
- カード型UI（角丸・淡い影・クリーム系背景）。
- リンクボックス・外部リンクグリッドは `flex` / `grid` によるレスポンシブ配置。
- スマホ表示（`max-width: 600px`）でロゴを縮小。

## 4. 画像
| 画像 | 用途 | 備考 |
| --- | --- | --- |
| `/assets/logo.png` | サイトロゴ | `width`/`height` 属性でCLS防止 |
| `/assets/x_icon.png` | Xアイコン | `loading="lazy"` |
| `/assets/instagram_icon.png` | Instagramアイコン | `loading="lazy"` |
| `/assets/youtube_icon.png` | YouTubeアイコン | `loading="lazy"` |

※画像は表示サイズに合わせて最適化済み（アイコン128px / ロゴ480px）。

## 5. 依存・外部連携
- Google Analytics（gtag.js）
- Google Fonts（M PLUS Rounded 1c）
- ヘッダー・フッター（[共通コンポーネント](./legacy/common-components.md)）

## 6. 特記事項
- ページ自体は静的表示のみで、独自のJavaScript処理は持たない。
- 外部リンクはすべて別タブ遷移かつ `rel="noopener"` を付与。
