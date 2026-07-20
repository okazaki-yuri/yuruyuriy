# 手順書 : デプロイ

> ⚠️ **旧構成（アーカイブ）**: 本書は Next.js 移行前の「リポジトリ全体をそのままFTPSアップロード（ビルド工程なし）」方式を記述したものです。
> 現行は `pnpm --filter web build` で生成した `apps/web/out/` のみをアップロードします。手順の正は [docs/migration/04-deploy.md](../migration/04-deploy.md) を参照してください。
> 下記の Xserver 側の注意点（FTP制限・FTPS）やトラブルシューティングは現行でも有効なため、記録として保存しています。

GitHub Actions を用いて Xserver（レンタルサーバー）へ FTPS でアップロードする。ビルド工程はない。

- ワークフロー: `.github/workflows/deploy.yaml`
- 上位ドキュメント: [README](../README.md)

---

## 1. 仕組み
- トリガーは `workflow_dispatch`（**GitHub上からの手動実行**）。push では自動デプロイされない。
- 処理内容:
  1. `actions/checkout` でリポジトリを取得。
  2. `SamKirkland/FTP-Deploy-Action` でリポジトリの内容を Xserver の公開ディレクトリへアップロード（`server-dir: /`）。
- **アップロード除外**: `docs/` / `README.md` / `CHANGELOG.md` は `exclude` 指定により本番へアップロードされない（Git管理のみ）。
  除外パターンを編集する場合、デフォルト除外（`.git*` / `node_modules`）が上書きされるため必ず併記すること。
- 除外ファイルは差分同期の仕様上「ローカルに無い」扱いとなり、**サーバー上に残っていても次回デプロイで削除される**。

## 2. デプロイ手順
1. 変更を `master` に反映する（PRマージ等）。
2. GitHub リポジトリの **Actions** タブを開く。
3. ワークフロー **「XServerDeploy」** を選択し、**Run workflow** を実行。
4. ログで成功（🚀 / 完了）を確認する。

## 3. 必要な設定（GitHub Secrets）
リポジトリの Settings → Secrets and variables → Actions に以下を登録しておく。

| Secret 名 | 内容 |
| --- | --- |
| `FTP_SERVER` | FTPサーバーのホスト名（例: `svXXXX.xserver.jp`）。`ftp://` やパスは付けない |
| `FTP_USERNAME` | FTPアカウントのユーザー名 |
| `FTP_PASSWORD` | FTPアカウントのパスワード |

## 4. Xserver 側の注意点
- **プロトコル**: Xserver は FTPS（明示的FTP over TLS）を利用する。SFTP専用設定では本アクションは接続できない（本アクションはSFTP非対応）。
- **FTP制限設定**: Xserverの「FTP制限設定」で接続元IPを限定していると、GitHub ActionsのランナーIP（毎回変動）が弾かれて接続タイムアウト（`Timeout (control socket)`）になる。ランナーIPは固定できないため、**許可リスト運用は不可**。デプロイ時はOFFにする。
- `FTP_SERVER` の値がホスト名のみか（プロトコルやパスが混入していないか）を確認する。

## 5. トラブルシューティング
| 症状 | 主な原因 | 対処 |
| --- | --- | --- |
| `Failed to connect... Timeout (control socket)` | FTP制限でIPブロック / ホスト名誤り / SFTPのみ有効 | FTP制限をOFF、`FTP_SERVER` を確認、FTPS有効化 |
| 認証エラー | ユーザー名・パスワード誤り | Secrets を再確認 |
| `Node 20 is being deprecated` の警告 | 使用アクションが内部でNode 20を宣言 | **警告のみで無害**。既にNode 24で動作。`ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true` は設定しない（古いNodeへ逆戻りするため）。消したい場合はアクションのバージョンを更新 |

## 6. ローカルでの事前確認
デプロイ前に、ローカルで表示・動作を確認しておくとよい。

```bash
python3 -m http.server 8000
# → http://localhost:8000/
```

ルート相対パス（`/assets/...` `/components/...`）を使っているため、**リポジトリのルートをドキュメントルート**にして起動すること。
