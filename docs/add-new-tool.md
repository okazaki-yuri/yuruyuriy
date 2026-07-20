# 手順書 : 新しいツールの追加

`apps/web/app/tools/` 配下に新しいツールを追加する際の手順をまとめる。既存の [ことばルーレットちゃん](./wordroulette-chan.md) / [WEBサイコロちゃん](./web-dice-chan.md) と同じ構成・作法にそろえること。

- 上位ドキュメント: [README](../README.md)
- 現行アーキテクチャ（モノレポ / `@yuruyuriy/core` / 静的エクスポート）は [docs/migration/](./migration/) を参照。

---

## 1. マスタデータに登録する（`data/tools.json`）

ツール一覧（`/tools/`）は `data/tools.json` から自動生成される。まずここに1件追加する。

```json
{
  "slug": "<tool-slug>",
  "name": "ツール名",
  "description": "一覧に出す短い説明。",
  "href": "/tools/<tool-slug>/",
  "icon": "🎲"
}
```

- `<tool-slug>` は英小文字・ハイフン区切り（例: `web-dice-chan`）。ディレクトリ名・URL と一致させる。
- 登録すると `/tools/` に公開カード（`.tool-card.active-tool`）が自動で並ぶ。手動でのカード編集は不要。
- 必要に応じて `apps/web/app/tools/page.tsx` の `coming-soon` プレースホルダ枚数を調整する。

## 2. ロジックを `@yuruyuriy/core` に置く（必要な場合）

抽選・計算・バリデーション等の**純粋ロジックは `packages/core/src/` に実装**し、`packages/core/src/index.ts` から re-export する。

- **DOM操作・localStorage・演出は含めない**（それらは Web 側の責務）。
- 乱数は `rng: () => number = Math.random` のように差し替え可能にしておくとテストが安定する（既存 `roulette.ts` / `dice.ts` に倣う）。
- UI からは `import { ... } from '@yuruyuriy/core'` で利用する。

## 3. ページを作成する（`apps/web/app/tools/<tool-slug>/`）

```
apps/web/app/tools/<tool-slug>/
├── page.tsx          … Server Component。metadata（title/description/OGP）とページ枠
├── <Component>.tsx   … 'use client' のUI本体（入力・localStorage・演出、core を呼ぶ）
└── <tool-slug>.css   … ツール専用スタイル（Component から import）
```

- `page.tsx` の `metadata` に **`title` / `description` / OGP（`openGraph.title`・`description`・`url`・`siteName`・`images`・`type`）** を必ず設定する。`url` はこのツールのURL（`https://tools.yl-yuriy.com/tools/<tool-slug>/`）にする。
- インタラクティブ部分は別ファイルの Client Component（先頭に `'use client'`）に切り出し、`page.tsx` から描画する。
- ヘッダー・フッター・GA・フォントは `app/layout.tsx` が全ページ共通で描画するため、各ページで書かない。

## 4. スタイルを整える
- 共通の見た目（カード・カラー・フォント）は [スタイルガイド](./style-guide.md) に従い、共通クラス（`.introduction-area` / `.howto-area` など）を再利用する。
- ツール固有のスタイルのみ `<tool-slug>.css` に書き、Client Component から `import './<tool-slug>.css'` する。

## 5. localStorage を使う場合
- キー名は他ツールと衝突しない一意な名前にする（例: `wordrouletteWords` / `diceHistory`）。
- 保存する値に個人を特定する情報を含めない（[プライバシーポリシー](./privacy-policy.md) 5項に整合させる）。

## 6. SEO 反映（`apps/web/app/sitemap.ts`）
- `sitemap.ts` はパスの手動リスト。新ツールのパスを追記する。

```ts
// apps/web/app/sitemap.ts の配列に追加
'tools/<tool-slug>/',
```

## 7. 設計書を追加する
- `docs/<tool-slug>.md` を作成し、既存ツールの設計書（[wordroulette-chan.md](./wordroulette-chan.md) 等）と同じ章立てで記述する。
- [README](../README.md) の「各ページ設計書」テーブルに1行追加する。

## 8. 動作確認
- `pnpm dev`（`http://localhost:3000`）で `/tools/<tool-slug>/` を開き確認する。
- 確認観点: 一覧への表示、ツールの主要動作、localStorage の保存/復元、スマホ表示、外部リンク。
- `pnpm build` が通り、`apps/web/out/tools/<tool-slug>/index.html` が生成されることを確認する。

## 9. 反映（デプロイ）
- 変更をコミット・プッシュし、[デプロイ手順](./migration/04-deploy.md) に従って公開する。

---

## チェックリスト
- [ ] `data/tools.json` にツールを1件追加（slug / name / description / href / icon）
- [ ] 純粋ロジックが必要なら `packages/core` に実装し `index.ts` で export
- [ ] `apps/web/app/tools/<tool-slug>/` に page.tsx / Client Component / 専用CSS を作成
- [ ] `page.tsx` の `metadata`（title / description / OGP `url`）を設定
- [ ] 概要・使い方ガイドを記載（利用規約へのリンク含む）
- [ ] localStorage キー名の一意性・個人情報を含めないことを確認
- [ ] `apps/web/app/sitemap.ts` にパスを追記
- [ ] `docs/<tool-slug>.md` を作成し README のテーブルに追記
- [ ] `pnpm dev` / `pnpm build` で動作確認
- [ ] コミット → デプロイ
