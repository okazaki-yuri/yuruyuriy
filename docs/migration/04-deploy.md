# 04. ビルド & Xserver FTPデプロイ

デプロイ方式（GitHub Actions → Xserver FTP）は**維持**する。
変わるのは「**アップロード前に Next.js をビルドし、`out/` を上げる**」点だけ。

---

## 現行ワークフローとの差分

現行 `.github/workflows/deploy.yaml` は、リポジトリのルートをそのままFTPアップロードしている。
新方式では **ビルド工程を追加** し、生成物 `apps/web/out/` だけをアップロードする。

## 新しい deploy.yaml（例）

```yaml
name: "XServerDeploy"

on:
  workflow_dispatch:   # 手動トリガーは維持

jobs:
  deploy-to-xserver:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: latest

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build (static export)
        run: pnpm --filter web build      # → apps/web/out/ を生成

      - name: Upload to Xserver (only built output)
        uses: SamKirkland/FTP-Deploy-Action@v4.3.6
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          protocol: ftps                    # 指定しないと平文FTPになる（デフォルトは ftp）
          local-dir: ./apps/web/out/        # ★ここが重要（末尾スラッシュ必須）
          server-dir: /
```

ポイント：

- `local-dir: ./apps/web/out/` を指定して、**ビルド生成物だけ**を上げる
  （ソースやnode_modulesは上げない）。
- Secrets（`FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD`）は現行のものをそのまま使う。
- FTP-Deploy-Action は差分同期。変更分の転送に加え、**ローカルから消えたファイルはサーバからも削除される**
  （サーバ上の `.ftp-deploy-sync-state.json` と比較して同期する）。

### ⚠️ 切替初回デプロイで旧ファイルはサーバから自動削除される

`local-dir` を `./`（リポジトリ全体）から `./apps/web/out/` に切り替えた**初回のデプロイで、
`out/` に存在しない旧ファイル群（`css/` `components/` 旧 `docs/` など）はサーバから自動的に削除される**。

- これは望ましい挙動（旧構成の残骸が残らない）だが、**ビルド漏れがあるとそのファイルも本番から消える**。
  切替前の「本番フルバックアップ」（下記ロールバック参照）は必須。
- 副次的な改善：現行ワークフローはリポジトリ全体を上げているため、実は `README.md` / `CHANGELOG.md` /
  `docs/` 等も本番で公開されている。新方式ではこれらの露出も解消される。
- なお、FTP以外の手段で直接サーバに置いたファイル（手動配置の `.htaccess` 等）は
  sync-state に含まれないため削除されない。

---

## `_next/` について（Xserver）

Next.jsの静的エクスポートは、JS/CSS等を `out/_next/` 配下に出力する。
`out/` ごとアップロードすれば `/_next/...` として正しく配信され、追加設定は基本不要。

- もし配信されない場合のみ、Xserverの `.htaccess` でアンダースコア始まりディレクトリのアクセス制限を確認する。

---

## リリース前の必須確認（ステージング）

**いきなり本番 `/` に上書きしない。** 事故時の影響が大きい。

推奨手順：

1. Xserver上に一時ディレクトリ（例：`/staging/`）を用意し、`server-dir: /staging/` で先にアップロード
2. `https://tools.yl-yuriy.com/staging/` で表示・リンク・OGPを確認
   - ※ 絶対パス（`/assets/...`）を使っているためサブディレクトリ表示は崩れる箇所がある。
     最終確認は本番同等パスで行うのが確実（下記ロールバック前提で本番へ）
3. 問題なければ `server-dir: /` に戻して本番反映

---

## ロールバック

移行はブランチで進め、旧HTML群を残しているため、切り戻しは容易。

- **コード**：`git revert` もしくは旧構成のコミットを `master` に戻す
- **本番ファイル**：旧構成の状態でワークフローを再実行すれば、FTPで元のHTMLに上書き戻しできる
- 事前に **現行本番のフルバックアップ**（FTPで丸ごとダウンロード or Xserverのバックアップ機能）を取っておくこと

---

## デプロイ・チェックリスト

- [ ] ローカルで `pnpm --filter web build` が成功し `apps/web/out/` が生成される
- [ ] `npx serve apps/web/out` で全ページ表示OK
- [ ] 本番のフルバックアップを取得済み
- [ ] Secrets が有効（FTP_SERVER/USERNAME/PASSWORD）
- [ ] ステージングまたは慎重な本番反映で表示・URL・OGP・GAを確認
- [ ] 反映後、[03章の反映後チェック](./03-seo.md#5-反映後の確認本番) を実施
