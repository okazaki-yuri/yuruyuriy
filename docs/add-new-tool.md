# 手順書 : 新しいツールの追加

新しいツールを追加する際の手順をまとめる。既存の [ことばルーレットちゃん](./wordroulette-chan.md) / [WEBサイコロちゃん](./web-dice-chan.md) と同じ構成・作法にそろえること。

- 上位ドキュメント: [README](../README.md)
- 現行アーキテクチャ（モノレポ / `@yuruyuriy/core` / 静的エクスポート）は [docs/migration/](./migration/) を参照。
- 多言語対応の構成（辞書・content/・Route Groups）は [i18n.md](./i18n.md) を参照。

---

## 1. マスタデータに登録する（`data/tools.json`）

ツール一覧（`/tools/`）は `data/tools.json` から自動生成される。まずここに1件追加する。

```json
{
  "slug": "<tool-slug>",
  "name": { "ja": "ツール名" },
  "description": { "ja": "一覧に出す短い説明。" },
  "href": "/tools/<tool-slug>/",
  "icon": "🎲"
}
```

- `<tool-slug>` は英小文字・ハイフン区切り（例: `web-dice-chan`）。ディレクトリ名・URL と一致させる。
- `name` / `description` は多言語オブジェクト（`{ ja, en }`）。en 未翻訳の間は ja のみでよい（ja へフォールバックされる）。
- `href` はロケール接頭辞なしで書く（`/en/` の付与は web 側の `localizePath` が行う）。
- 登録すると `/tools/` に公開カード（`.tool-card.active-tool`）が自動で並ぶ。手動でのカード編集は不要。
- 必要に応じて `apps/web/app/content/tools.tsx` の `coming-soon` プレースホルダ枚数を調整する。

## 2. ロジックを `@yuruyuriy/core` に置く（必要な場合）

抽選・計算・バリデーション等の**純粋ロジックは `packages/core/src/` に実装**し、`packages/core/src/index.ts` から re-export する。

- **DOM操作・localStorage・演出は含めない**（それらは Web 側の責務）。
- 乱数は `rng: () => number = Math.random` のように差し替え可能にしておくとテストが安定する（既存 `roulette.ts` / `dice.ts` に倣う）。
- UI からは `import { ... } from '@yuruyuriy/core'` で利用する。

## 3. 文言を辞書に追加する（`apps/web/app/i18n/`）

ページ・UI の文言は JSX に直接書かず、辞書に追加する（[i18n.md](./i18n.md) §2 参照）。

1. `app/i18n/types.ts` の `Dictionary` 型にツール用のセクション（メタデータ・本文・widget 文言）を追加する。
2. `app/i18n/ja.ts` に日本語文言、`app/i18n/en.ts` に英語文言を追加する（キー漏れは `satisfies Dictionary` でコンパイルエラーになる）。

## 4. ページを作成する（`content/` + `(ja)/`）

```
apps/web/app/content/<tool-slug>/
├── page-content.tsx  … ページ実体（Server Component）。buildXxxMetadata(locale) と本文。文言は辞書から
├── <Component>.tsx   … 'use client' のUI本体（locale を受け取る。入力・localStorage・演出、core を呼ぶ）
└── <tool-slug>.css   … ツール専用スタイル（page-content から import）

apps/web/app/(ja)/tools/<tool-slug>/
└── page.tsx          … metadata と本文を locale='ja' で呼ぶだけの薄いラッパー

apps/web/app/(en)/en/tools/<tool-slug>/
└── page.tsx          … 同上（locale='en'）
```

- `buildXxxMetadata(locale)` で **`title` / `description` / `alternates.canonical` / OGP** を組み立てる（既存ツールの `content/webdice/page-content.tsx` に倣う。OGP は `site.ts` の `buildOpenGraph` を使う）。
- 内部リンク・canonical・JSON-LD の URL は必ず `localizePath(locale, path)` を通す。
- インタラクティブ部分は別ファイルの Client Component（先頭に `'use client'`）に切り出し、`locale` を props で渡す。
- ヘッダー・フッター・GA・フォントは言語別ルートレイアウト（実体 `app/content/root.tsx`）が全ページ共通で描画するため、各ページで書かない。

## 5. スタイルを整える
- 共通の見た目（カード・カラー・フォント）は [スタイルガイド](./style-guide.md) に従い、共通クラス（`.introduction-area` / `.howto-area` など）を再利用する。
- ツール固有のスタイルのみ `<tool-slug>.css` に書き、Client Component から `import './<tool-slug>.css'` する。

## 6. localStorage を使う場合
- キー名は他ツールと衝突しない一意な名前にする（例: `wordrouletteWords` / `diceHistory`）。
- 保存する値に個人を特定する情報を含めない（[プライバシーポリシー](./privacy-policy.md) 5項に整合させる）。

## 7. SEO 反映（`apps/web/app/sitemap.ts`）
- `sitemap.ts` はパスの手動リスト。新ツールのパスを追記する（1パス追記すれば日英2エントリ + hreflang が自動生成される。`lastmod` は言語別に実更新日を指定）。
- `robots.txt`（`app/robots.ts`）は全パス許可のため**更新不要**。

```ts
// apps/web/app/sitemap.ts の配列に追加
'tools/<tool-slug>/',
```

## 8. 設計書を追加する
- `docs/<tool-slug>.md` を作成し、既存ツールの設計書（[wordroulette-chan.md](./wordroulette-chan.md) 等）と同じ章立てで記述する。
- [README](../README.md) の「各ページ設計書」テーブルに1行追加する。

## 9. 動作確認
- `pnpm dev`（`http://localhost:3000`）で `/tools/<tool-slug>/` を開き確認する。
- 確認観点: 一覧への表示、ツールの主要動作、localStorage の保存/復元、スマホ表示、外部リンク。
- `pnpm build` が通り、`apps/web/out/tools/<tool-slug>/index.html` が生成されることを確認する。

## 10. 反映（デプロイ）
- 変更をコミット・プッシュし、[デプロイ手順](./migration/04-deploy.md) に従って公開する。

---

## チェックリスト
- [ ] `data/tools.json` にツールを1件追加（slug / name(`{ja,en}`) / description(`{ja,en}`) / href / icon）
- [ ] 純粋ロジックが必要なら `packages/core` に実装し `index.ts` で export（UI 文言は持たせない）
- [ ] `app/i18n/types.ts` の `Dictionary` 型と `app/i18n/ja.ts` / `en.ts` にツールの文言を追加
- [ ] `apps/web/app/content/<tool-slug>/` に page-content.tsx / Client Component / 専用CSS を作成
- [ ] `apps/web/app/(ja)/tools/<tool-slug>/page.tsx` と `apps/web/app/(en)/en/tools/<tool-slug>/page.tsx`（薄いラッパー）を作成
- [ ] `buildXxxMetadata(locale)` の `metadata`（title / description / canonical / OGP）を設定
- [ ] 概要・使い方ガイドを記載（利用規約へのリンク含む）
- [ ] localStorage キー名の一意性・個人情報を含めないことを確認
- [ ] `apps/web/app/sitemap.ts` にパスを追記
- [ ] `docs/<tool-slug>.md` を作成し README のテーブルに追記
- [ ] `pnpm dev` / `pnpm build` で動作確認
- [ ] コミット → デプロイ
