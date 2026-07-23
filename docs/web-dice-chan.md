# 設計書 : WEBサイコロちゃん（オンラインサイコロ）

指定した数値範囲でサイコロを振れるオンラインサイコロ。複数個の同時抽選、統計表示、履歴保存、SNSシェアに対応する。

- URL: `https://tools.yl-yuriy.com/tools/web-dice-chan/`
- ファイル:
  - `apps/web/app/(ja)/tools/web-dice-chan/page.tsx` … ルート（`locale='ja'` を渡す薄いラッパー）
  - `apps/web/app/content/webdice/page-content.tsx` … ページ本体（メタデータ・JSON-LD・静的コンテンツ。文言は辞書 `app/i18n/ja.ts` から取得。[i18n.md](./i18n.md) 参照）
  - `apps/web/app/content/webdice/WebDice.tsx` … 抽選UI（クライアントコンポーネント。`locale` を受け取り辞書を参照）
  - `apps/web/app/content/webdice/dice.css` … 専用CSS
  - `packages/core/src/dice.ts` … 抽選・検証・統計の純粋ロジック（`@yuruyuriy/core`）
- 使用CSS: `apps/web/app/styles/style.css`, `dice.css`, `apps/web/app/styles/header-footer.css`
- 上位ドキュメント: [README](../README.md)

---

## 1. 機能概要
- 最小値〜最大値（0〜100）の範囲で、指定した個数（1〜30）のサイコロを振る。
- 演出時間（0.5〜3秒）の間、目が高速に切り替わる演出の後、結果を確定。
- 2個以上のときは**合計・平均・最大・最小**を表示。
- 抽選結果は**履歴として localStorage に保存**（最大50件）され、再訪時に復元される。
- 結果を **SNSシェア**できる（[共通コンポーネント ShareButtons](#5-依存外部連携)）。

## 2. 画面構成（`page.tsx` + `WebDice.tsx`）
1. **リード文（`.tool-lead`）** … 検索意図に合わせた説明文（「オンラインサイコロ」を含む）。
2. **入力エリア（`.controls`）**
   - 出目の最小値／最大値（0〜100）
   - サイコロの個数（1〜30）
   - 演出時間（0.5 / 1 / 2 / 3秒）
   - 「サイコロを振る」ボタン（演出中は無効化）
3. **サイコロ表示エリア（`#dice-area`）** … 出目カード（`.dice-card`）を並べて表示。直後に統計表示 `#dice-stats`。演出中は100msごとに仮の出目で更新されるため live region にはせず、**確定結果のみ**を視覚非表示の通知領域（`role="status"` / `aria-live="polite"`、`.visually-hidden`）からスクリーンリーダーへ1回通知する。
4. **履歴エリア（`#history-area`）** … 過去の抽選結果一覧 `#history` と「履歴をリセット」ボタン（履歴が空のときは無効化）。
5. **SNSシェア（`ShareButtons`）** … 結果確定後に有効化。ハッシュタグ「オンラインサイコロ」「ゆるユーリ」。シェア本文には結果と統計（2個以上のとき）を含む。
6. **ツール概要／利用シーン（`.introduction-area`）／使い方ガイド（`.howto-area`）／FAQ（`.faq-area`）**

## 3. データ設計（localStorage）
| キー | 型 | 内容 |
| --- | --- | --- |
| `diceHistory` | JSON文字列（number[][]） | 抽選ごとの出目配列を新しい順に格納 |

- 復元時は `isValidHistory()` で型検証し、不正データはキーごと削除（握りつぶし）。
- 保存: 抽選確定時に先頭へ追加し、**上限 `HISTORY_LIMIT = 50` 件**でスライス（localStorage の無制限肥大を防ぐ）。

## 4. 主なロジック
### 純粋ロジック（`@yuruyuriy/core` の `dice.ts`）
| 関数 / 定数 | 役割 |
| --- | --- |
| `DICE_LIMITS` | 出目 0〜100・個数 1〜30 の制限値定義 |
| `validateDiceConfig(config)` | 設定の検証。エラーコード（`DiceValidationError`）配列を返す（空なら妥当）。表示文言は web 側辞書で解決 |
| `rollDice(config, rng?)` | 出目配列の生成（`Math.floor(rng() * (max - min + 1)) + min`） |
| `calcDiceStats(results)` | 合計・平均・最大・最小の算出（空なら `null`） |

※乱数生成器 `rng` は引数で差し替え可能（テスト用）。DOM・localStorage・演出は web 側の責務。

### UI ロジック（`WebDice.tsx`）
| 関数 / 処理 | 役割 |
| --- | --- |
| `roll()` | 入力値の検証（違反時はアラートで中断）→ 演出（`setInterval` で100msごとに仮の出目を描画）→ `setTimeout` で確定 → 履歴保存 |
| `resetHistory()` | 確認後に履歴を全削除し表示をクリア |
| `statsText(results)` | 統計の表示文字列を生成（1個のときは非表示） |
| `shareText()` | シェア本文の組み立て（結果未確定なら空 → シェアボタン無効化） |

## 5. SEO・メタデータ（`page.tsx`）
- `metadata` … title「オンラインサイコロ（WEBサイコロちゃん）」/ description / canonical `/tools/web-dice-chan/` / OGP（`buildOpenGraph()`）。
- 構造化データ（JSON-LD） … `WebApplication` / `BreadcrumbList` / `FAQPage` を `JsonLd` コンポーネントで埋め込む。**FAQ の表示内容と FAQPage は必ず一致させる**（同一の `faqs` 配列から生成）。

## 6. 依存・外部連携
- `@yuruyuriy/core`（`rollDice` / `validateDiceConfig` / `calcDiceStats`）
- SNSシェア: 共通コンポーネント `apps/web/app/components/ShareButtons.tsx`（X / LINE / リンクコピー / ネイティブ共有）
- Google Analytics（gtag.js）/ Google Fonts / ヘッダー・フッターは言語別ルートレイアウト（`apps/web/app/(ja)/layout.tsx`、実体は `apps/web/app/content/root.tsx`）で共通提供される。
- 使い方ガイドから[利用規約](./terms-of-service.md)へリンク。

## 7. 特記事項
- 乱数は `Math.random()` を使用（暗号学的乱数ではない）。
- 履歴データはブラウザ内のみで完結し、サーバーには送信されない。
