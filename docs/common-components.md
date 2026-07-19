# 設計書 : 共通コンポーネント（ヘッダー・フッター）

全ページで共有するヘッダー・フッターの部品群。各ページのHTMLには含めず、JavaScriptで動的に読み込む。

- 関連ファイル
  - `components/header.html` … ヘッダーのマークアップ
  - `components/footer.html` … フッターのマークアップ
  - `components/header-footer.css` … ヘッダー・フッター専用スタイル
  - `components/header-footer.js` … 読み込み・開閉制御スクリプト
- 上位ドキュメント: [README](../README.md)

---

## 1. 目的
- サイト全体で共通のナビゲーション（ヘッダー・フッター）を**一箇所で管理**し、全ページへ反映する。
- 各HTMLに重複してヘッダー・フッターを書かないことで、修正時の変更漏れを防ぐ。

## 2. 読み込みの仕組み（`header-footer.js`）
1. `DOMContentLoaded` を契機に実行。
2. `<div id="header-container">` を `body` 先頭に、`<div id="footer-container">` を `body` 末尾にプレースホルダとして生成・配置する。
   - ※各ページ側にも同名の空divが置かれているが、スクリプトでも生成しているため二重構造になっている（現状の実装仕様）。
3. `fetch("/components/header.html")` でヘッダーを取得し `innerHTML` に挿入。挿入後にメニュー開閉のイベントを登録する。
4. `fetch("/components/footer.html")` でフッターを取得し `innerHTML` に挿入。

## 3. ヘッダー構成（`header.html`）
- ロゴ（`/assets/logo.png` / トップへのリンク）
- PC用ナビゲーション（`.nav-desktop`）: `TOP` / `ツール一覧` / `ブログ`
- スマホ用ハンバーガーボタン（`#hamburgerBtn`）
- スマホ用オーバーレイメニュー（`#mobileMenu`）: `TOP` / `ツール一覧` / `ブログ` / `プライバシーポリシー` / `利用規約` / `お問い合わせ`
- クローズボタン（`#overlayCloseBtn`）

### メニュー開閉の挙動（JSで制御）
- ハンバーガーボタン押下でメニュー（`.show`）とアイコン（`.open`）をトグル。
- クローズボタン押下でメニューを閉じる。
- メニュー・ボタン外側のクリックでメニューを閉じる。

## 4. フッター構成（`footer.html`）
- フッターナビ: `TOP` / `ツール一覧` / `プライバシーポリシー` / `利用規約` / `お問い合わせ`
- コピーライト表記（`© 2025 Ylyuriy All rights reserved.`）

## 5. スタイル（`header-footer.css`）
- `*` に対する `box-sizing`・マージン/パディングリセット、`body` の flex 縦並び（フッターを最下部に固定するための `min-height: 100vh` + `margin-top: auto`）。
- ヘッダー: 固定高のロゴ（高さ44px）、PCナビのボタン装飾、ハンバーガーのアニメーション、スマホ用フルスクリーンオーバーレイ。
- フッター: 左右がフェードするグラデーション背景・ボーダー。
- レスポンシブ境界: `max-width: 768px` でPCナビを隠しハンバーガーを表示。
- **CLS対策**: `#header-container` に `min-height: 69px`（ロゴ44px + 上下padding + border相当）を設定し、fetch挿入前後でのレイアウトのずれを防止。

## 6. 特記事項・改善余地
- ヘッダー・フッターは fetch 後に描画されるため、初回表示時にわずかな遅延がある。`min-height` 予約でレイアウトシフトは抑制済み。
- `header-footer.js` はページ側の空divとスクリプト生成divが重複し得る構造になっている。整理の余地あり。
- 予約している高さ（69px）は実レイアウトに合わせた概算値。デザイン変更時は要調整。
