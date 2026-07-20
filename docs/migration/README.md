# ゆるユーリ 移行手順書（第1段階：Next.js 静的エクスポート化）

現状の静的サイト（素のHTML/CSS/JS + Xserver FTPデプロイ）を、
**SEO・URL・デプロイ方法を維持したまま** Next.js ベースの構成へ段階移行するための手順書です。

## この移行のゴール

- フロントを **Next.js（Static Export / SSG）** に置き換える
- ツールロジックを **`packages/core`** に集約し、Web / 将来のスマホで共通化する
- 参照データを **`data/`** に静的JSONとして持ち、**データ取得I/F越し**に読む
  （第2段階でAPI化しても**フロント無改修**で差し替え可能にする）
- **Xserver + 現状のFTPデプロイ** はそのまま使い続ける

## やらないこと（第1段階のスコープ外）

- 常駐バックエンド（Spring Boot / Node SSR）の導入 … Xserver共有プランで動かないため
- DB・書き込み処理・認証 … これらは「第2段階」。本手順の [05-data-interface.md](./05-data-interface.md) で布石だけ打つ

## 大原則

> **URLを1文字も変えない。** 既存のSEO資産（インデックス済みページ・被リンク・sitemap）を失わないことが最優先。
> 見た目・URL・メタ情報を維持したまま「中身の実装だけ」を差し替える。

## 章立て

| # | ファイル | 内容 |
|---|---|---|
| 01 | [01-architecture.md](./01-architecture.md) | 目標のディレクトリ構成と技術選定 |
| 02 | [02-steps.md](./02-steps.md) | 段階的な移行手順（本体） |
| 03 | [03-seo.md](./03-seo.md) | SEOを落とさないためのチェックリスト |
| 04 | [04-deploy.md](./04-deploy.md) | ビルド & Xserver FTPデプロイ（GitHub Actions） |
| 05 | [05-data-interface.md](./05-data-interface.md) | データ取得I/Fと第2段階への布石 |

## 前提環境

- Node.js 20 LTS 以上（CIのビルド環境が Node 20 のため揃える。18 は 2025年4月にEOL済み）
- pnpm（corepack で有効化。セットアップ手順は [02-steps.md](./02-steps.md) の Step 0 を参照）

## 進め方の推奨順序

1. [02-steps.md](./02-steps.md) の Step 0〜2 で雛形とローカル動作を確立
2. [02-steps.md](./02-steps.md) の Step 3〜6 でレイアウト・静的資産・ツールロジックを移設しつつ、[03-seo.md](./03-seo.md) のチェックリストと突き合わせながらページを移植
3. [02-steps.md](./02-steps.md) の Step 7 でビルドし、生成された `out/` をローカル配信して全ページを最終確認
4. [04-deploy.md](./04-deploy.md) でデプロイを切り替え、**本番反映前に必ずステージング確認**
5. 問題なければ [02-steps.md](./02-steps.md#step-8-切り替えと後始末) の Step 8 に沿って**リポジトリ上の**旧HTML群を削除
   （**サーバ上の**旧ファイルは切替初回デプロイで自動削除される。詳細は [04-deploy.md](./04-deploy.md) の警告を参照）

各ステップは独立してコミットし、いつでも [04-deploy.md](./04-deploy.md#ロールバック) の手順で戻せる状態を保つこと。
