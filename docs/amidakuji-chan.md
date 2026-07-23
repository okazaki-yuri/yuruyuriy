# 設計書 : あみだくじちゃん（WEBあみだくじ）

参加者の名前を入力するとあみだくじを自動生成し、線をたどって結果を発表するWEBあみだくじ。当番決め・席決め・景品の抽選などに利用できる。

- URL: `https://tools.yl-yuriy.com/tools/amidakuji-chan/`
- ファイル:
  - `apps/web/app/(ja)/tools/amidakuji-chan/page.tsx` … ルート（`locale='ja'` を渡す薄いラッパー）
  - `apps/web/app/content/amidakuji/page-content.tsx` … ページ本体（メタデータ・JSON-LD・静的コンテンツ。文言は辞書 `app/i18n/ja.ts` から取得。[i18n.md](./i18n.md) 参照）
  - `apps/web/app/content/amidakuji/Amidakuji.tsx` … くじ引きUI（クライアントコンポーネント。`locale` を受け取り辞書を参照）
  - `apps/web/app/content/amidakuji/AmidakujiLadder.tsx` … はしご（SVG）描画（表示専用コンポーネント）
  - `apps/web/app/content/amidakuji/amidakuji.css` … 専用CSS
  - `packages/core/src/amidakuji.ts` … はしご生成・経路トレースの純粋ロジック（`@yuruyuriy/core`）
- 使用CSS: `apps/web/app/styles/style.css`, `amidakuji.css`, `apps/web/app/styles/header-footer.css`
- 上位ドキュメント: [README](../README.md)

---

## 1. 機能概要
- 参加者の名前（**2〜12人**）を登録すると、横線（横棒）を**毎回ランダムに自動生成**したあみだくじを作成する。
- 下段のゴール（結果のことば）は**参加者の数だけ個別の入力欄**が並び、**既定で「アタリ」×1・残り「ハズレ」**が入る。自由に書き換えでき、**空欄にした欄は「1, 2, 3…」を自動採番**で補完する。参加者の増減に欄数が追随する（増えた分はハズレで埋める）。
- 結果は伏せた状態（`?`）から公開する。公開方式は2つ（**表示方式切替タブ**で切替・localStorage に保存）。
  - **一括表示（既定）** … 全員の経路を色分けして一斉になぞり、全結果をまとめて発表する。
  - **1人ずつ** … 参加者ボタンをタップした人の経路だけをなぞって発表する（全員めくると完了）。
- 演出時間（なし / 1 / 3 / 5秒）を設定可能（選択は保存される）。
- 「作り直す」で同じメンバーのまま、はしごを再生成して引き直せる。
- **参加者・ゴールを編集するとはしごは破棄され idle に戻る**（結果を覗いてからの編集によるイカサマ防止・古い経路データの残留防止）。
- はしご・経路・確定ゴールは**セッション内のみ**（localStorage には保存しない）。
- 登録した名前・ゴール・表示方式・演出時間は **localStorage に永続化**され、再訪時に復元される。
- 結果を **SNSシェア**できる（全員の結果確定後に有効化。[共通コンポーネント ShareButtons](#6-依存外部連携)）。

## 2. 画面構成（`page-content.tsx` + `Amidakuji.tsx`）
1. **リード文（`.tool-lead`）** … 検索意図に合わせた説明文（「あみだくじ」を含む）。
2. **表示方式切替タブ（`.mode-tabs`）** … 一括表示／1人ずつ。演出中は無効化。切替してもはしごは維持される（1人ずつで途中まで公開→一括表示に切替時は「結果を見る」で残りだけ公開）。
3. **参加者ピッカー（`.amida-pickers`）** … 1人ずつモード・はしご生成後のみ表示。参加者ごとのボタンを SVG の縦線と同じ等分 grid（`--cols`）で整列。公開済み・演出中は無効化。フルネームは `title` 属性で補完。
4. **はしご SVG（`.amida-wrap`）** … `AmidakujiLadder` が描画。未生成時はプレースホルダー枠に案内文。少人数時に縦長になりすぎないよう `max-width` を列数 × 90px に制限（ピッカーと同じ値で整列を維持）。
5. **通知領域** … 視覚非表示（`role="status"` / `aria-live="polite"`、`.visually-hidden`）。確定した結果のみを1回スクリーンリーダーへ通知（演出中は更新しない）。
6. **結果一覧（`.amida-results`）** … 確定順に「名前 → ゴール」を省略なしで表示。空のときの案内文は `data-placeholder` + CSS `:empty::before` で表示（辞書由来）。
7. **入力モード切替タブ（`.tab-container`）** … 「なまえ入力」（1人ずつ）／「まとめて入力」（改行区切りで一括）。
8. **入力エリア（`.input-area`）** … 名前入力 `#nameInput`（最大50文字＝`MAX_NAME_LENGTH`、Enterで追加可。**IME 変換確定の Enter では追加しない**）／一括入力 `#multiInput`（行ごとに同じ50文字上限へ切り詰めて登録）／「追加」「スタート／作り直す」ボタン、一括表示モードでは「結果を見る」ボタン（演出中は「発表中…」表示で無効化）。
9. **参加者数エラー（`.amida-error`）** … 2〜12人の範囲外でスタートしたときにインライン表示（alert 不使用）。
10. **ゴール入力（`.goals-area`）** … 登録が1件以上のとき表示。参加者の数だけ並ぶ個別入力欄（`.goal-inputs`、各欄50文字上限・`aria-label` は `goalFieldLabel(n)`）+ 自動採番のヒント文。
11. **演出時間セレクト（`.duration-controls`）** … 登録が1件以上のとき表示。選択は localStorage に保存。
12. **参加者一覧（`.word-list`）** … 登録名をタグ表示。各タグに削除ボタン（×）。
13. **リセットボタン（`.reset-area`）** … 登録が1件以上のとき表示。確認後に名前・ゴールを全削除。
14. **SNSシェア（`ShareButtons`）** … 全員の結果確定後に有効化。ハッシュタグ「あみだくじ」「ゆるユーリ」。
15. **ツール概要／利用シーン（`.introduction-area`）／使い方ガイド（`.howto-area`）／FAQ（`.faq-area`）**

## 3. データ設計（localStorage）
| キー | 型 | 内容 |
| --- | --- | --- |
| `amidakujiParticipants` | JSON文字列（string[]） | 登録された参加者名の配列 |
| `amidakujiGoals` | JSON文字列（string[]） | ゴール（結果のことば）の配列（参加者数と同じ長さに同期。既定はアタリ×1 + ハズレ） |
| `amidakujiRevealMode` | 文字列（`batch` \| `one`） | 結果の表示方式（既定 `batch`） |
| `amidakujiDuration` | 文字列（`0` \| `1` \| `3` \| `5`） | 演出時間の選択状態（`DURATION_OPTIONS` で検証。既定 `3`） |

- 復元時は `isStringArray()` 等で型検証し、不正データはキーごと削除（握りつぶし）。
- はしご・経路・確定ゴール・公開状態は保存しない（リロードで idle に戻る）。

## 4. 主なロジック
### 純粋ロジック（`@yuruyuriy/core` の `amidakuji.ts`）
| 関数 / 定数 | 役割 |
| --- | --- |
| `AMIDAKUJI_LIMITS` | 参加者数の上下限（2〜12） |
| `validateParticipantCount(count)` | 参加者数の検証（エラーコード `PARTICIPANTS_OUT_OF_RANGE`。表示文言は web 側の辞書で解決） |
| `generateLadder(columns, rng?)` | はしご（`AmidakujiLadder = { columns, rows, rungs }`）のランダム生成 |
| `traceLadder(ladder, startColumn)` | 1本の縦線を上から下までたどり `{ goalIndex, points }` を返す |
| `traceAll(ladder)` | 全縦線の経路（goalIndex 群は必ず順列になる） |
| `normalizeGoals(goals, count)` | ゴールを参加者数に正規化（空文字・不足は連番補完、超過は切り捨て） |

※乱数生成器 `rng` は引数で差し替え可能（テスト用）。DOM・localStorage・演出は web 側の責務。

### はしご生成アルゴリズム
- 段数 `rows = min(12, max(6, columns + 3))`（少人数でも交差が十分、大人数でも縦に伸びすぎない）。
- 各段を左→右に走査し、確率 0.4（`RUNG_PROBABILITY`）で横棒を配置。**同じ段で隣接する境界には置かない**（3叉の曖昧さ防止）。
- 補修パス: 横棒が1本もない縦線間には、隣接禁止を守れる段へ1本挿入（見た目の破綻防止）。両隣の横棒で全段が塞がる稀なケースは盤面ごと再生成（最大 `GENERATE_ATTEMPTS = 10` 回）。
- 結果の対応（順列）は生成された盤面から `traceAll` で導出する（結果を強制しない）。

### UI ロジック（`Amidakuji.tsx`）
進行状態 `Phase`: `idle`（はしご未生成）→ `ready`（生成済み・公開待ち）→ `revealing`（演出中）→ `revealed`（全員確定）。

| 関数 | 役割 |
| --- | --- |
| `addParticipant()` / `removeParticipant()` | 参加者の追加（重複時は確認ダイアログ）・削除。ゴール欄数を `fitGoals()` で追随させ、編集すると `resetRound()` |
| `defaultGoals(count)` / `fitGoals(base, count)` | ゴールの既定値（アタリ×1 + ハズレ）生成／参加者数への長さ合わせ（増えた分はハズレ） |
| `changeGoal(index, value)` | ゴール1欄の変更と保存。はしご生成後の編集は `resetRound()` |
| `startLadder()` | スタート／作り直す。人数検証 → `normalizeGoals` → `generateLadder` → `traceAll` → `ready` |
| `revealAll()` | 一括表示。全員の経路を一斉になぞり、タイマー後に全結果を確定・サマリを通知 |
| `revealOne(index)` | 1人ずつ。タップした参加者の経路をなぞり、確定結果を `statusOne` で通知。全員確定で `revealed` |
| `resetRound()` | はしご・経路・公開状態を破棄して `idle` へ（イカサマ防止の要） |
| `changeRevealMode(mode)` / `changeDuration(value)` | 表示方式／演出時間の変更と localStorage 保存 |
| `resetAll()` | 確認後に参加者・ゴールを全削除 |

### 経路をなぞる演出（`AmidakujiLadder.tsx`・表示専用）
- 経路は参加者ごとのオーバーレイ `<polyline>`。経路は軸平行のため全長は座標差の和で算出（`getTotalLength()` 不要 = SSR 安全）。
- `stroke-dasharray` = 全長、`stroke-dashoffset` を全長 → 0 へ CSS transition（inline style）させて「線をなぞる」演出を実現。マウント直後に offset=全長 を一度描画してから遷移させる（二重 `requestAnimationFrame`）。JSアニメーションライブラリ不使用・静的エクスポート互換。
- 色は `--amida-path-1..6`（amidakuji.css）を参加者 index で循環。`stroke-opacity: 0.85` で交差を見やすく。
- viewBox は列数 × `COL_UNIT(60)` で横幅等分（サイドマージンなし）。このため HTML 側のピッカーを同列数の `repeat(var(--cols), 1fr)` grid にすると縦線の真上に揃う。**SVG に固定サイドマージンを足すとこの整列が崩れる**ので注意。
- 上ラベル=参加者名、下ラベル=ゴール（未確定の列は `?`）。列数に応じて文字サイズ縮小・5〜3文字で省略（フルネームは結果一覧とピッカー `title` で補完）。
- **`prefers-reduced-motion: reduce` 設定時は演出せず即時確定**（親が `durationSec=0` を渡す）。
- SVG ラッパーは `aria-hidden="true"`（結果は結果一覧と通知領域で読み上げる装飾扱い）。

## 5. SEO・メタデータ（`page-content.tsx`）
- `metadata` … title「あみだくじ（あみだくじちゃん）」/ description / canonical `/tools/amidakuji-chan/` / OGP（`buildOpenGraph()`）。
- 構造化データ（JSON-LD） … `WebApplication` / `BreadcrumbList` / `FAQPage` を `JsonLd` コンポーネントで埋め込む。**FAQ の表示内容と FAQPage は必ず一致させる**（同一の `faqs` 配列から生成）。

## 6. 依存・外部連携
- `@yuruyuriy/core`（`generateLadder` / `traceLadder` / `traceAll` / `normalizeGoals` / `validateParticipantCount` / `AMIDAKUJI_LIMITS`）
- SNSシェア: 共通コンポーネント `apps/web/app/components/ShareButtons.tsx`（X / LINE / リンクコピー / ネイティブ共有）
- Google Analytics（gtag.js）/ Google Fonts / ヘッダー・フッターは言語別ルートレイアウト（`apps/web/app/(ja)/layout.tsx`、実体は `apps/web/app/content/root.tsx`）で共通提供される。
- 使い方ガイドから[利用規約](./terms-of-service.md)へリンク。

## 7. 特記事項
- はしご生成は `Math.random()` を使用（暗号学的乱数ではない）。あみだくじの性質上、出発点→ゴールは必ず1対1対応（順列）になる。
- 参加者名・ゴールはブラウザ内のみで完結し、サーバーには送信されない。
- 参加者上限12人はモバイル幅（375px）でのラベル視認性・タップ性から決定（描画・トレースは O(rows×columns) で性能上の制約ではない）。
- リポジトリにテストフレームワークは未導入のため、生成の不変条件（同段の隣接横棒なし・全境界に横棒≥1・順列性）は手動スクリプトで検証済み。将来テストを導入する場合の第一候補。
- 将来拡張の候補: 横線の手動追加（紙のあみだくじの文化）、結果履歴。
