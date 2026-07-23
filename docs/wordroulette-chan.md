# 設計書 : ことばルーレットちゃん（単語ルーレット）

入力した「ことば」の中からランダムに1つを選んで表示する単語ルーレット。お題決め・チーム分け・順番決め・抽選などに利用できる。

- URL: `https://tools.yl-yuriy.com/tools/wordroulette-chan/`
- ファイル:
  - `apps/web/app/(ja)/tools/wordroulette-chan/page.tsx` … ルート（`locale='ja'` を渡す薄いラッパー）
  - `apps/web/app/content/wordroulette/page-content.tsx` … ページ本体（メタデータ・JSON-LD・静的コンテンツ。文言は辞書 `app/i18n/ja.ts` から取得。[i18n.md](./i18n.md) 参照）
  - `apps/web/app/content/wordroulette/WordRoulette.tsx` … 抽選UI（クライアントコンポーネント。`locale` を受け取り辞書を参照）
  - `apps/web/app/content/wordroulette/RouletteWheel.tsx` … 円形ルーレット描画（表示専用コンポーネント）
  - `apps/web/app/content/wordroulette/roulette.css` … 専用CSS
  - `packages/core/src/roulette.ts` … 抽選・並べ替えの純粋ロジック（`@yuruyuriy/core`）
- 使用CSS: `apps/web/app/styles/style.css`, `roulette.css`, `apps/web/app/styles/header-footer.css`
- 上位ドキュメント: [README](../README.md)

---

## 1. 機能概要
- ことばを登録し、その中から**ランダムに1語を抽選**する。
- 演出は2方式から選べる（**表示方式切替タブ**で切替・localStorage に保存）。
  - **テキスト式** … ことばが高速に切り替わりながら減速して止まる。
  - **ホイール式** … SVG の円形ルーレットが回転し、上部ポインターの位置で当選が決まる。
- 演出時間（なし / 1 / 3 / 5 / 10秒）を設定可能。
- 登録内容は **localStorage に永続化**され、再訪時に復元される。
- 抽選結果を **SNSシェア**できる（[共通コンポーネント ShareButtons](#6-依存外部連携)）。

## 2. 画面構成（`page.tsx` + `WordRoulette.tsx`）
1. **リード文（`.tool-lead`）** … 検索意図に合わせた説明文（「単語ルーレット」を含む）。
2. **表示方式切替タブ（`.mode-tabs`）** … テキスト式／ホイール式。抽選中は無効化。
3. **円形ルーレット（`.wheel-wrap`）** … ホイール式のときのみ表示（`RouletteWheel`）。
4. **抽選結果表示（`.result-box`）** … 演出中は `spin`、確定時は `final` クラスが付く。テキスト式の演出中は高頻度で仮のことばに更新されるため live region にはせず、**確定結果のみ**を視覚非表示の通知領域（`role="status"` / `aria-live="polite"`、`.visually-hidden`）からスクリーンリーダーへ1回通知する。
5. **入力モード切替タブ（`.tab-container`）** … 「ことば入力」（1語ずつ）／「まとめて入力」（改行区切りで一括）。
6. **入力エリア（`.input-area`）** … 単語入力 `#wordInput`（最大50文字＝`MAX_WORD_LENGTH`、Enterで追加可。**IME 変換確定の Enter では追加しない**＝`isComposing` と `keyCode 229` で判定）／一括入力 `#multiInput`（textarea。**行ごとに同じ50文字上限へ切り詰めて登録**）／「追加」「ルーレット」ボタン（抽選中は「抽選中…」表示で無効化）。
7. **並び順・抽選時間コントロール（`.sort-controls`）** … 登録が1件以上のとき表示。昇順／降順ソート、抽選時間セレクト。
8. **ことば一覧（`.word-list`）** … 登録単語をタグ表示。各タグに削除ボタン（×）。
9. **リセットボタン（`.reset-area`）** … 登録が1件以上のとき表示。確認後に全削除。
10. **SNSシェア（`ShareButtons`）** … 結果確定後に有効化。ハッシュタグ「単語ルーレット」「ゆるユーリ」。
11. **ツール概要／利用シーン（`.introduction-area`）／使い方ガイド（`.howto-area`）／FAQ（`.faq-area`）**

## 3. データ設計（localStorage）
| キー | 型 | 内容 |
| --- | --- | --- |
| `wordrouletteWords` | JSON文字列（string[]） | 登録された単語の配列 |
| `wordrouletteDisplayMode` | 文字列（`text` \| `wheel`） | 表示方式の選択状態 |

- 復元時は `isStringArray()` で型検証し、不正データはキーごと削除（握りつぶし）。
- 保存: 追加・削除・並び替え・表示方式切替のたびに保存。

## 4. 主なロジック
### 純粋ロジック（`@yuruyuriy/core` の `roulette.ts`）
| 関数 | 役割 |
| --- | --- |
| `pickRandom(items, rng?)` | 配列からランダムに1件選ぶ（空なら `null`） |
| `pickRandomIndex(length, rng?)` | 当選「位置」が必要な抽選（ホイール式）用にインデックスを選ぶ |
| `sortWords(words, order, locale)` | `localeCompare` による昇順/降順ソート（比較ロケールは引数指定。既定 `ja`） |

※乱数生成器 `rng` は引数で差し替え可能（テスト用）。DOM・localStorage・演出は web 側の責務。

### UI ロジック（`WordRoulette.tsx`）
| 関数 | 役割 |
| --- | --- |
| `addWord()` | 選択中モードに応じて単語を追加（重複時は確認ダイアログ） |
| `changeDisplayMode(mode)` | 表示方式の切替と localStorage 保存 |
| `spinRoulette()` | 抽選のエントリポイント。表示方式に応じてテキスト演出／`spinWheel()` へ分岐 |
| `spinWheel(durationSec)` | ホイール式の抽選。当選区画が上部ポインターで止まる回転角を算出 |
| `handleSort(order)` / `resetWords()` / `removeWord(index)` | 並べ替え／全削除（確認あり）／1件削除 |

### テキスト式の演出アルゴリズム
- 反復回数 `iterations = 30` 固定。
- 総時間 `durationSec * 1000` から、各ステップの遅延を「基準速度（30ms）+ 徐々に増える増分」で算出し、**後半ほど遅く**なる（減速）演出を実現。
- 時間が短く基準速度を下回る場合は増分を0にし、均等割りにフォールバック。
- 抽選時間「なし（0秒）」または未登録時は即時に結果を反映。

### ホイール式の演出アルゴリズム
- `pickRandomIndex()` で当選インデックスを先に決め、当選区画の中心角 ± ジッター（区画角の0.7倍以内）を目標角として算出。
- 現在角度から**必ず前方向へ**回るよう差分を計算し、抽選時間に応じた空回転（最低2周）を加算して累積回転角を更新。
- 回転は CSS transition（`cubic-bezier` による減速カーブ）で行い、`setTimeout` で終了後に結果を確定。
- **`prefers-reduced-motion: reduce` 設定時はアニメーションせず即時確定**する。

### `RouletteWheel.tsx`（表示専用）
- SVG で区画（扇形パス）・ラベル・外周リング・中心ハブ・上部ポインターを描画。回転角・時間は親が制御。
- 区画は4色パレット（`roulette.css` の `--wheel-*`）で塗り分け。最後と最初の区画が同色にならないよう補正。
- ラベルは区画数に応じて文字サイズを縮小し、7文字以上は省略（`…`）。31区画以上はラベル非描画。
- 0件時はプレースホルダー（「ことばを追加してね」）、1件時は全周1区画として描画。
- `aria-hidden="true"`（結果は視覚非表示の通知領域側でスクリーンリーダーへ通知するため装飾扱い）。

## 5. SEO・メタデータ（`page.tsx`）
- `metadata` … title「単語ルーレット（ことばルーレットちゃん）」/ description / canonical `/tools/wordroulette-chan/` / OGP（`buildOpenGraph()`）。
- 構造化データ（JSON-LD） … `WebApplication` / `BreadcrumbList` / `FAQPage` を `JsonLd` コンポーネントで埋め込む。**FAQ の表示内容と FAQPage は必ず一致させる**（同一の `faqs` 配列から生成）。

## 6. 依存・外部連携
- `@yuruyuriy/core`（`pickRandom` / `pickRandomIndex` / `sortWords`）
- SNSシェア: 共通コンポーネント `apps/web/app/components/ShareButtons.tsx`（X / LINE / リンクコピー / ネイティブ共有）
- Google Analytics（gtag.js）/ Google Fonts / ヘッダー・フッターは言語別ルートレイアウト（`apps/web/app/(ja)/layout.tsx`、実体は `apps/web/app/content/root.tsx`）で共通提供される。
- 使い方ガイドから[利用規約](./terms-of-service.md)へリンク。

## 7. 特記事項
- 抽選ロジックは `Math.random()` を使用（暗号学的乱数ではない）。
- 単語データはブラウザ内のみで完結し、サーバーには送信されない。
