# 多言語対応（i18n）検討資料

> **ステータス: Phase 2（英語リソース・/en/ ルート）まで完了。Phase 3（hreflang 等の SEO 配線）待ち。**
> 実装済み部分のアーキテクチャは設計書 [i18n.md](./i18n.md) を参照（本資料は方針・経緯・残フェーズの計画）。
> なお `docs/` 配下は非公開資料のため、多言語対応後も **日本語のまま** でよい。

## 1. 目的とスコープ

- 現在すべて日本語のサイト（ゆるユーリ）を多言語に対応させる。**まず英語（en）から開始**し、基盤は将来の言語追加を前提に作る（決定済み）。
- 対象: 全ページの UI 文言・メタデータ（title / description / OGP）・構造化データ・ツールのインタラクティブ文言。
- 非対象（当面）: ブログ（外部サイト yl-yuriy.com）、Google Form（お問い合わせ）そのものの翻訳、`docs/` 配下の資料。

## 2. 現状整理（多言語化に関係する事実）

| 項目 | 現状 |
|---|---|
| フレームワーク | Next.js App Router、`output: 'export'`（完全静的エクスポート） |
| ホスティング | Xserver へ FTP アップロード（GitHub Actions）。Apache なので `.htaccess` は使える |
| 言語 | `<html lang="ja">` をルートレイアウトで固定。全文言が JSX / metadata にハードコード |
| ページ数 | 7ページ（トップ / ツール一覧 / ツール2種 / お問い合わせ / 法務2種）+ 404 |
| データ層 | `data/tools.json`（name / description が日本語のみ）を `packages/core` の `toolsRepository` 経由で参照 |
| SEO | canonical（トレイリングスラッシュ付き）、`sitemap.ts`（lastmod 手動）、JSON-LD（`inLanguage: 'ja'`）、OGP |
| OG 画像 | ビルド時生成。同梱フォントが latin のみのため日本語はロゴ画像に委ねている |
| フォント | M PLUS Rounded 1c（latin もカバーしており英語表示は問題なし） |
| クライアント文言 | `confirm()` / `alert()` / placeholder / aria-label / シェア文言・ハッシュタグが日本語ハードコード |
| ロジック | `sortWords()` が `localeCompare(…, 'ja')` 固定 |
| localStorage | `wordrouletteWords` / `wordrouletteDisplayMode` / `diceHistory`（言語に依存しないデータ） |

### 静的エクスポートによる制約（重要）

`output: 'export'` のため **middleware・サーバーサイドの言語ネゴシエーション（Accept-Language による振り分け）は使えない**。
Next.js 組み込みの i18n ルーティング（`next.config.js` の `i18n`）も静的エクスポートでは利用不可。
→ 言語ごとに **静的な URL を分ける** 構成が前提になる。

## 3. URL 設計（最重要の意思決定）

### A案（**採用決定**）: 日本語はルート維持、英語を `/en/` 配下に追加

```
/                → 日本語トップ（現行のまま）
/tools/          → 日本語ツール一覧（現行のまま）
/en/             → 英語トップ
/en/tools/       → 英語ツール一覧
```

- **実装方法**: App Router の **Route Groups による複数ルートレイアウト** を使う。
  - `app/(ja)/…` … 既存ページを移動（URL は変わらない）。ルートレイアウトは `lang="ja"`。
  - `app/(en)/en/…` … 英語ページ。ルートレイアウトは `lang="en"`。
  - `<html lang>` を言語ごとに正しく出し分けられるのがポイント（1つのルートレイアウトでは不可能）。
- **利点**: 既存 URL・SEO 資産（インデックス・被リンク）を完全維持。リダイレクト不要。段階的に追加できる。
- **欠点**: レイアウトファイルが言語分でき、共通部分はコンポーネント抽出が必要。ルートレイアウト間の遷移はフルページロードになる（現状 `<a>` タグ遷移なので実害なし）。

### B案: 全言語にプレフィックス（`/ja/…` + `/en/…`）

- `app/[lang]/…` に全ページを寄せ、`generateStaticParams` で `['ja','en']` を生成する教科書的構成。
- **欠点**: 既存 URL が全部変わる。`.htaccess` での 301 リダイレクトが必須になり、インデックス再評価のリスクとデプロイ構成（`out/` 外のファイル管理）が増える。
- 言語を今後どんどん増やす予定がなければ A案が安全。

### ルート `/` への言語振り分け

- サーバーでのネゴシエーションは不可。**振り分けはせず、`/` は日本語のまま**とする。
- 必要なら「Looks like your browser is set to English → [English page]」のような **JS による控えめな案内バナー** を後日検討（自動リダイレクトは SEO・UX 的に非推奨）。
- ヘッダー / フッターに **言語スイッチャー**（対応ページ同士の相互リンク）を設置する。

## 4. 翻訳リソース（文言）の管理方針

### 推奨: 自前の辞書方式（ライブラリなし）

- 2言語・7ページの規模なら、`next-intl` 等の導入より **型付き辞書オブジェクト** が見通しがよい。
- 例: `apps/web/app/i18n/ja.ts` / `en.ts` を用意し、`Dictionary` 型で **キーの過不足をコンパイル時に検出** する。

```ts
// app/i18n/types.ts
export type Locale = 'ja' | 'en';
export type Dictionary = {
  header: { top: string; tools: string; blog: string; menuLabel: string; … };
  roulette: { addButton: string; spinButton: string; spinning: string; … };
  …
};
// ja.ts / en.ts は satisfies Dictionary で定義 → キー漏れがビルドエラーになる
```

- ページ（Server Component）は自分の locale を知っているので辞書を import して使い、クライアントコンポーネント（`WordRoulette` / `WebDice` / `Header` / `ShareButtons` 等）へは **props で辞書（の該当セクション）を渡す**。Context より props の方が静的エクスポートと相性がよく、依存も明示的。
- **複数形・埋め込み**: 英語は複数形が必要（例: `1 second` / `3 seconds`）。テンプレート関数（`(n) => n === 1 ? … : …`）を辞書側に持たせれば十分で、ICU MessageFormat までは不要。
- 将来3言語以上・ICU が必要になったら `next-intl`（静的エクスポート対応）への移行を再検討する。

## 5. データ層（`packages/core`）の変更

- `Tool` 型の `name` / `description` を多言語化する。案:

```jsonc
// data/tools.json
{
  "slug": "wordroulette-chan",
  "name": { "ja": "ことばルーレットちゃん", "en": "Word Roulette" },
  "description": { "ja": "…", "en": "…" },
  "href": "/tools/wordroulette-chan/",  // href は locale なしで持ち、web 側で prefix を付与
  "icon": "🎡"
}
```

- `ToolsRepository` の I/F は `getTools(locale)` / `getTool(slug, locale)` に変更し、リポジトリ内で当該 locale に解決した `Tool`（現行と同じフラットな形）を返す。**呼び出し側の型は変えない**のが望ましい。
- `sortWords(words, order)` に `locale` 引数を追加（`localeCompare(…, locale)`）。デフォルトは `'ja'` にして後方互換を保つ。
- `validateDiceConfig` のエラーメッセージが日本語ハードコード → **core はエラーコード（例: `'MIN_OUT_OF_RANGE'`）を返し、表示文言は web 側の辞書で解決**する形に変更（core から UI 文言を追い出す）。

## 6. SEO・メタデータ方針

- **hreflang**: 全ページで `alternates.languages` を指定する（`site.ts` のヘルパーに集約）。

```ts
alternates: {
  canonical: '/tools/wordroulette-chan/',
  languages: {
    ja: '/tools/wordroulette-chan/',
    en: '/en/tools/wordroulette-chan/',
    'x-default': '/tools/wordroulette-chan/',  // x-default は日本語（主言語）に向ける
  },
},
```

- **canonical**: 各言語ページが **自分自身** を canonical に指定する（言語間で共有しない）。トレイリングスラッシュ付きルールは維持。
- **sitemap.ts**: 英語ページ分のエントリを追加し、各エントリに `alternates.languages`（hreflang）を含める。`lastmod` 手動運用は言語別に行う（日本語ページだけ更新した場合は日本語側のみ更新）。
- **JSON-LD**: `inLanguage` を locale に応じて出し分け。`WebSite` / `Organization` の `name` も英語表記を用意。FAQ（FAQPage）は表示文言と必ず一致させる原則を両言語で維持。
- **title テンプレート**: `%s | ゆるユーリ` の英語版（例: `%s | Yuruyuriy`）をルートレイアウト（言語別）で定義。
- **OGP 画像**: 生成スクリプトは latin 描画可能なので、**英語版 OG 画像（`og-image-en.png`）を追加生成**し、英語ページの `openGraph.images` に指定する。**当面はロゴ流用で決定**（海外向けロゴは後日用意の可能性あり。差し替え時は生成スクリプトの画像パスを変えるだけで済む構成にしておく）。

## 7. 懸念点・リスク一覧

| # | 懸念 | 対応方針 |
|---|---|---|
| 1 | **翻訳の維持コスト**: 以後すべてのページ更新が「両言語の文言 + 両言語の lastmod + docs + CHANGELOG」とセットになり、更新負荷がほぼ倍になる | CLAUDE.md / docs の運用ルールに i18n 手順を明文化。辞書の型チェックで漏れを機械検出 |
| 2 | **法務ページ（利用規約・プライバシーポリシー）の翻訳品質** | **決定**: 英訳し、「日本語版が正文であり、相違がある場合は日本語版が優先する」旨の条項を入れる |
| 3 | **お問い合わせ**: Google Form が日本語のみ | 英語ページには「フォームは日本語ですが英語での記入も可」と注記、または英語版フォームを別途作成 |
| 4 | **ブランド名の英語表記**: 「ゆるユーリ」のローマ字表記が未確定。サイト名・title・manifest・JSON-LD すべてに影響 | **着手前に決定が必要**（§9 残課題参照）。ツール名は決定済み（§9） |
| 5 | **404 ページ**: 静的エクスポートでは `404.html` が1枚のみで、言語別に出し分けられない。また複数ルートレイアウト構成では通常の `not-found.tsx` がレイアウト外で描画される | **Phase 1 で対応済み**: experimental の `global-not-found.tsx` を採用（[i18n.md](./i18n.md) §5）。表示は当面 ja のみ。Phase 2 以降で日英併記化を検討 |
| 6 | **Web App Manifest**: `manifest.ts` は1ファイルで `lang: 'ja'` 固定。言語別 manifest は App Router 標準では持てない | 当面は日本語のまま許容（PWA 利用者の大半は日本語想定）。必要なら `public/` に英語版 manifest を置き英語レイアウトから参照 |
| 7 | **英語は文字列が長い**: ボタン・タブ・ヘッダーで レイアウト崩れの可能性 | 実装後に全ページ・スマホ幅で表示 QA。CSS の固定幅前提を洗い出す |
| 8 | **ネイティブダイアログ**: `confirm()` / `alert()` の文言も辞書化が必要（見落としやすい） | 文言抽出時にチェックリスト化（placeholder / aria-label / `<title>` / OGP / JSON-LD / confirm / alert / シェア文言） |
| 9 | **シェア文言・ハッシュタグ**: `#単語ルーレット` 等は英語圏で無意味 | 言語別ハッシュタグを辞書に持つ |
| 10 | **localStorage**: キーは言語間で共有される（ja で入れた単語が /en/ でも出る） | データ自体は言語非依存なので **共有を仕様とする**（むしろ望ましい）。設計書に明記 |
| 11 | **ソート順**: 英語ページで日本語 collation のままだと不自然 | `sortWords` の locale 引数化（§5） |
| 12 | **ブログリンク**: yl-yuriy.com は日本語のみ | 英語ページでは「(Japanese)」注記を付けてリンク維持、または英語トップからは非表示 |
| 13 | **既存 URL の維持**: B案を採ると 301 が必要になり事故リスク | A案採用で回避（§3） |
| 14 | **GA 計測**: 言語別の分析 | URL パスで判別可能なため追加実装不要。必要になったら `gtag` にカスタムディメンション追加 |

## 8. 実施手順（フェーズ分け）

各フェーズを独立したブランチ / PR とし、フェーズ単位でマージ可能な状態を保つ。

### Phase 0: 方針決定 — **完了（§9 参照）**
- 残: サイト名のローマ字表記の決定（Phase 2 着手前までで可）。

### Phase 1: 国際化基盤の整備（**表示は変えない**リファクタ）— **完了（2026-07-23）**
1. ✅ `app/i18n/` を作成し、`Locale` / `Dictionary` 型と `ja.ts` 辞書を定義。
2. ✅ 全ページ・全コンポーネントの日本語文言（UI / metadata / JSON-LD / placeholder / aria-label / confirm / alert / シェア文言）を辞書へ抽出し、参照に置き換え（法務ページ本文はロケール別ファイルとして維持）。
3. ✅ `packages/core`: `validateDiceConfig` のエラーコード化、`sortWords` の locale 引数化、`ToolsRepository` の locale 対応（`tools.json` 構造変更）。
4. ✅ Route Groups へ再編: 既存ページを `app/(ja)/` へ移動し、ページ実体は `app/content/` へ分離（URL 不変）。グローバル404 は `global-not-found.tsx`（experimental）で対応。
5. ✅ GA（gtag）・フォント読み込みをコンポーネント化（`GoogleAnalytics.tsx` / `FontLinks.tsx`）し、言語別レイアウトから共用（将来の Consent Mode 対応の下準備。§10 参照）。
6. ✅ `next build` で out/ の全 HTML・sitemap・robots・manifest がベースラインと同一であることを確認（差分はビルドID と React 内部マーカーのみ）。
- 詳細な実装アーキテクチャは [i18n.md](./i18n.md) を参照。

### Phase 2: 英語リソース作成と `/en/` ルート追加 — **完了（2026-07-23）**
1. ✅ `en.ts` 辞書を作成（型チェックで漏れ検出）。英文は運営者レビュー済み。
2. ✅ `app/(en)/en/…` に英語ページを追加（ページ本体は `content/` の共通コンポーネント + 辞書。法務ページは独立した英訳 + Language 条項）。
3. ✅ 言語スイッチャーを Header（PC ナビ + モバイルメニュー）に追加。
4. ✅ OG 画像は本体がロゴ + ドメイン表記（latin のみ）のため両言語で共用とし、alt のみ英語化（`og.ts` の `OG_IMAGE_EN`）。別画像の生成は海外向けロゴを用意する際に再検討。

### Phase 3: SEO 配線
1. `site.ts` のヘルパーを hreflang 対応に拡張し、全ページの `alternates.languages` を設定。
2. `sitemap.ts` に英語エントリ + hreflang alternates を追加（lastmod は追加日）。
3. JSON-LD の `inLanguage` / 英語版文言を設定。
4. 404 の日英併記化。

### Phase 4: QA・リリース
1. 全ページ × 両言語 × PC/スマホ幅で表示確認（文字あふれ・折返し）。
2. OGP デバッガ（X / LINE）、リッチリザルトテスト（FAQ / パンくず）、hreflang の検証。
3. デプロイ後、Google Search Console で /en/ のインデックス状況を監視。

### Phase 5: 運用ルールの更新
- `CLAUDE.md`: 「文言変更は両言語の辞書を更新する」「lastmod は言語別に更新する」等のルール追記。
- `docs/` 各設計書: i18n 構成（辞書・Route Groups・hreflang）を反映。`docs/add-new-tool.md` にツール追加時の翻訳手順を追記。
- `CHANGELOG.md`: 英語対応リリースを記載。

## 9. 決定事項と残課題

### 決定事項（2026-07 決定）

| 項目 | 決定内容 |
|---|---|
| URL 設計 | **A案**（日本語ルート維持 + `/en/` 追加） |
| 対象言語 | まず **en** のみ。ただし他言語追加を想定し、基盤（辞書型・Route Groups・hreflang ヘルパー）は多言語前提で設計する |
| ツールの英語名 | 「〜ちゃん」は日本語特有の表現とし、**英語はシンプルな命名**にする（例: ことばルーレットちゃん → *Word Roulette* / WEBサイコロちゃん → *Web Dice*）。`tools.json` の `name.en`・英語ページの h1・JSON-LD `name` に適用 |
| 法務ページ | 英訳する。英語版に「日本語版が正文・優先」条項を必ず入れる |
| 翻訳の担い手 | **手動翻訳**（運営者が英文を作成する）。辞書ファイル（`en.ts`）を直接編集するワークフロー |
| 英語版 OG 画像 | 当面ロゴ流用。海外向けロゴは後日差し替え可能な構成にしておく |
| docs/ | 非公開資料のため日本語のまま |

### 残課題

1. ~~サイト名「ゆるユーリ」のローマ字表記~~ → **「Ylyuriy」に決定**（2026-07-23。© 表記・ドメイン・SNS ID との一貫性を採用）。
2. ツール英語名は英語辞書ドラフト（`app/i18n/en.ts`）で **Word Roulette / Web Dice** として作成済み。SEO 上の補完として metaTitle には「Random Word Picker」「Online Dice Roller」を併記。**英文全体が運営者レビュー待ち**。

## 10. プライバシー・広告コンプライアンス（将来の海外展開に向けて）

多言語化により海外ユーザーの流入が増えるため、地域ごとの規制対応を段階的に整理しておく。
**現時点（日本 + 英語ページ公開まで）では CMP は必須ではない**が、将来 EU（EEA）圏へ本格展開・AdSense 掲載する際に必要になる。

### 現状の外部送信とデータ収集

- サーバーへのユーザーデータ送信は無し（ツールの入力値はすべて localStorage 内で完結）。
- 外部送信は **Google Analytics（gtag.js）** と **Google Fonts** のみ。GA は現在、同意なしで無条件ロードしている。

### 地域別の規制と必要な対応

| 地域 | 規制 | 同意モデル | 必要になる対応 |
|---|---|---|---|
| 日本 | 改正個人情報保護法 / 電気通信事業法の外部送信規律 | 通知・公表（同意不要） | プライバシーポリシーに GA 等の**外部送信先・送信情報・利用目的を明記**していれば適法。個人データの第三者提供・越境移転に当たる収集をしない現構成を維持する |
| EEA / UK | GDPR / ePrivacy | **オプトイン**（同意取得まで Cookie・GA 発火不可） | CMP 導入 + Google Consent Mode v2（デフォルト denied）。AdSense を出すなら **Google 認定 CMP（IAB TCF v2.2 対応）が必須**（2024年〜の Google 要件） |
| 米国（CA 等の州法） | CCPA/CPRA 等 | **オプトアウト**（「Do Not Sell/Share」リンク提供） | CMP のオプトアウト UI + Google の Restricted Data Processing 設定 |

- ユーザーの認識どおり「**EU はオプトイン / 米国はオプトアウト**」が基本モデルで正しい。
- **静的サイトでも地域別の出し分けは可能**: CMP（Google の Privacy & messaging、Cookiebot、Osano 等）はクライアントサイドのスクリプトが自前で地域判定を行い、EEA では同意バナー・米国ではオプトアウトリンク・日本では非表示、のように出し分けられる。サーバーサイドの geo 判定は不要なので、`output: 'export'` + Xserver 構成のまま導入できる。

### 実装への影響（今フェーズで仕込んでおくこと）

- GA の `gtag` 初期化を将来 **Consent Mode v2 の `gtag('consent', 'default', { …, region: [...] })`** で包めるよう、レイアウトの Script 部分を共通コンポーネント化しておく（i18n の Route Groups 分離でレイアウトが言語別になるため、GA 部分は必ず共通化する）。
- プライバシーポリシー（日英）に GA の外部送信について記載があるか確認し、なければ追記する（日本の外部送信規律対応も兼ねる）。
- CMP 自体の導入は **EU 展開または AdSense 導入のタイミング**で別プロジェクトとして実施する。

## 11. 補足 Q&A

### Q. 英語圏のユーザーが検索したとき、英語のサイトが表示されるか？

**表示される（それが hreflang の役割）。** `/en/` 配下の各ページは独立した URL としてインデックスされ、hreflang の相互リンクにより Google は「同一内容の言語違い」と認識する。英語設定のユーザーの検索結果には `/en/` の URL・英語の title/description が表示され、ユーザーは最初から英語ページに着地する。サイト側での自動リダイレクトは不要（むしろ有害）。

留意点:
- 新規 URL のため、`/en/` のインデックス・評価には時間がかかる（Search Console で監視）。
- 英語クエリで上位表示されるかは、英語コンテンツの品質（title・description・本文・FAQ）次第。hreflang は「言語の振り分け」をするだけで、ランキングを上げる機能ではない。

### Q. AdSense は利用ユーザーに最適な言語の広告が自動で選ばれるか？

**自動で選ばれる。** AdSense はページのコンテンツ言語とユーザーの言語設定・地域の両方に基づいて配信するため、`/en/` ページ + 英語圏ユーザーには英語広告が出る。追加実装は不要。
ただし EEA/UK 向けにパーソナライズ広告を配信するには認定 CMP が必須（§10 参照）。AdSense 導入時は CMP とセットで計画する。
