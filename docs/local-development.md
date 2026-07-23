# 手順書 : ローカル開発・動作確認

ローカルでサイトを起動し、変更を確認するための手順。開発サーバー（`next dev`）での確認と、
本番同等の**静的エクスポート成果物**での確認の2通りを用意する。

- 上位ドキュメント: [README](../README.md)
- デプロイ手順は [docs/migration/04-deploy.md](./migration/04-deploy.md) を参照。

---

## 1. 前提環境

| 項目 | 要件 |
| --- | --- |
| Node.js | **22.13 以上**（`pnpm@11` が要求。CI も `node-version: 22`） |
| pnpm | **11 系**（`package.json` の `packageManager` で `pnpm@11.15.1` に固定） |

pnpm は Node 同梱の **Corepack** から用意するのが確実（`npm i -g pnpm` は不要）。

```bash
node -v                 # v22.13 以上であること
corepack enable         # pnpm を有効化
pnpm -v                 # 11.15.1（packageManager の固定版）が出ればOK
```

> **`node` / `pnpm` が「command not found」になる場合** … Node が PATH に載っていない。
> インストール先の `bin` を PATH に追加してから上記を再実行する。例（この環境では `~/.local/node` に配置）:
> ```bash
> export PATH="$HOME/.local/node/bin:$PATH"
> ```
> 恒久化するなら `~/.bashrc` に同じ行を追記する。

---

## 2. 依存関係のインストール

リポジトリのルートで一度だけ（および依存更新時に）実行する。pnpm ワークスペース全体
（`apps/web` と `packages/core`）がまとめて解決される。

```bash
pnpm install
```

CI と同じ状態を厳密に再現したいときは lockfile を固定する:

```bash
pnpm install --frozen-lockfile
```

---

## 3. 開発サーバーで確認する（普段の開発）

ホットリロードが効く。UI やロジックを編集しながら確認する用途。

```bash
pnpm dev            # = pnpm --filter web dev
```

- ブラウザで **http://localhost:3000** を開く（WSL2 でも Windows 側ブラウザからそのままアクセス可）。
- ポート 3000 が使用中の場合、Next.js が自動で別ポートに切り替える（起動ログのURLを見る）。
- 停止は `Ctrl + C`。

---

## 4. 静的エクスポート成果物で確認する（本番同等）

本番は `apps/web/out/` の静的ファイルを配信する。**リリース前の最終確認はこちらで行う**
（`trailingSlash` によるURL形式や静的化の挙動が本番と一致する）。

```bash
# 1) 静的ビルド → apps/web/out/ を生成
pnpm build          # = pnpm --filter web build

# 2) 生成物をローカル配信して確認
npx serve apps/web/out
```

- `npx serve` は表示されたURL（例 `http://localhost:3000`）を開く。
  **初回は `serve` パッケージをダウンロードする**ため、ネットワークが必要。
- ダウンロードを避けたい／オフラインの場合は、`out/` をドキュメントルートにできる任意の静的サーバーでよい:
  ```bash
  # 例: Python（ディレクトリ→index.html を解決してくれる）
  cd apps/web/out && python3 -m http.server 3000
  ```
  ※ 絶対パス（`/assets/...`）を使っているため、必ず `out/` をルートにして起動すること。
- ビルドが成功すると、各ルートに `index.html` が生成される（`out/index.html`, `out/tools/index.html`,
  `out/tools/wordroulette-chan/index.html` …）。現行と同じURL構成になっていることが確認ポイント。

---

## 5. 動作確認チェックリスト

主要URL:
`/` `/tools/` `/tools/wordroulette-chan/` `/tools/web-dice-chan/`
`/contact/` `/legal/privacy-policy/` `/legal/terms-of-service/`

- [ ] 全ページが表示され、ヘッダー／フッターが出る（ロゴからトップへ、フッターの各リンク）
- [ ] スマホ幅（ブラウザを狭める）でハンバーガーメニューが開閉する
- [ ] ツール一覧（`/tools/`）に公開ツールのカードが `data/tools.json` どおり並ぶ
- [ ] **ことばルーレットちゃん**: 単語追加 → 抽選 → リロードしても単語が残る（`localStorage: wordrouletteWords`）
- [ ] **WEBサイコロちゃん**: 範囲・個数を入力 → 振る → 履歴が残る（`localStorage: diceHistory`）／不正入力でバリデーション
- [ ] 各ページの `<title>` / OGP が個別に設定されている
- [ ] favicon（`/assets/favicon.ico`）・ロゴ（`/assets/logo.png`）・Google Fonts が読める
- [ ] `/sitemap.xml` と `/robots.txt` が返る

---

## 6. よくあるトラブル

| 症状 | 原因 | 対処 |
| --- | --- | --- |
| `node: command not found` / `pnpm: command not found` | Node が PATH に無い | §1 のとおり `bin` を PATH に追加し `corepack enable` |
| `pnpm install` でバージョン不一致エラー | pnpm が 11 系でない | Corepack 経由で起動（`corepack enable`）。グローバル pnpm は使わない |
| `pnpm build` が `@yuruyuriy/core` の型/import で失敗 | `next.config.js` の設定漏れ | `transpilePackages: ['@yuruyuriy/core']` が必要（生TSを取り込むため） |
| ポート 3000 が使用中 | 既存プロセスが占有 | 表示された別ポートを開く、または占有プロセスを終了 |
| `--frozen-lockfile` で失敗 | `pnpm-lock.yaml` と依存が不整合 | 依存を変えたなら通常の `pnpm install` で lockfile を更新してコミット |
| `pnpm typecheck` が `.next/types/...` の `Cannot find module` で失敗 | ブランチ切替等で古い `.next/types`（別ブランチのページの生成型）が残留 | `pnpm build` で再生成するか、`apps/web/.next/` を削除して再実行 |

---

## 参考: よく使うコマンド早見

```bash
pnpm install                 # 依存インストール（ルートで実行）
pnpm dev                     # 開発サーバー（http://localhost:3000）
pnpm typecheck               # 型チェック（tsc --noEmit。CI でも PR ごとに実行される）
pnpm build                   # 静的エクスポート（apps/web/out/ を生成）
npx serve apps/web/out       # 静的成果物をローカル配信して最終確認
```
