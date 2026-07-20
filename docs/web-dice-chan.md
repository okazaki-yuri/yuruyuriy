# 設計書 : WEBサイコロちゃん（サイコロツール）

指定した数値範囲でサイコロを振れるツール。複数個の同時抽選、統計表示、履歴保存、Xシェアに対応する。

- URL: `https://tools.yl-yuriy.com/tools/web-dice-chan/`
- ファイル: `tools/web-dice-chan/index.html` / `style.css` / `script.js`
- 使用CSS: `css/style.css`, `tools/web-dice-chan/style.css`, `components/header-footer.css`
- 上位ドキュメント: [README](../README.md)

---

## 1. 機能概要
- 最小値〜最大値（0〜100）の範囲で、指定した個数（1〜30）のサイコロを振る。
- 演出時間（0.5〜3秒）の間、目が高速に切り替わる演出の後、結果を確定。
- 2個以上のときは**合計・平均・最大・最小**を表示。
- 抽選結果は**履歴として localStorage に保存**され、再訪時に復元される。
- 結果をXへシェアできる。

## 2. 画面構成
1. **入力エリア（`.controls`）**
   - 出目の最小値 `#minValue` / 最大値 `#maxValue`（0〜100）
   - サイコロの個数 `#diceCount`（1〜30）
   - 演出時間 `#duration`（0.5 / 1 / 2 / 3秒）
   - 「サイコロを振る」ボタン `#rollBtn`
2. **サイコロ表示エリア（`#dice-area`）** … 出目カードを並べて表示。直後に統計表示 `#dice-stats` を動的挿入。
3. **履歴エリア（`#history-area`）** … 過去の抽選結果一覧 `#history` と「履歴をリセット」ボタン `#resetHistory`
4. **シェア（`#options`）** … Xアイコン `#share-x`（クリックで投稿画面を開く）
5. **ツール概要（`.introduction-area`）/ 使い方ガイド（`.howto-area`）**

## 3. データ設計（localStorage）
| キー | 型 | 内容 |
| --- | --- | --- |
| `diceHistory` | JSON文字列（number[][]） | 抽選ごとの出目配列を新しい順に格納 |

- 起動時に読み込み、`unshift` で最新を先頭に追加して保存。

## 4. 主なロジック（`script.js`）
| 関数 / 処理 | 役割 |
| --- | --- |
| `renderHistory()` | 履歴の再描画。1件のときは結果のみ、複数のときは統計付きで表示。空なら履歴リセットボタンを無効化 |
| `renderDiceStats(results)` | 合計・平均・最大・最小の算出と表示（1個のときは非表示） |
| `createDiceCards(values)` | 出目カードの生成・描画 |
| `#rollBtn` クリック | 入力値のバリデーション → 演出（`setInterval`）→ 確定（`setTimeout`）→ 履歴保存 |
| `#resetHistory` クリック | 確認後に履歴を全削除し表示をクリア |
| `#share-x` クリック | 現在の結果・統計からシェア文面を組み立て、Xの投稿画面を別タブで開く |

### 抽選ロジック
- 出目は `Math.floor(Math.random() * (max - min + 1)) + min`。
- 演出中は100msごとに仮の出目を描画し、`duration` 経過後に最終結果を確定。
- バリデーション: 最小/最大が0〜100か、最小 ≤ 最大か、個数が1〜30か。違反時はアラートで通知し中断。

## 5. 依存・外部連携
- Google Analytics（gtag.js）/ Google Fonts / ヘッダー・フッター（[共通](./legacy/common-components.md)）
- Xシェア: `https://twitter.com/intent/tweet` を利用（外部遷移）。
- Xアイコン画像 `/assets/x_icon.png`（`width`/`height` 指定済み）。
- 使い方ガイドから[利用規約](./terms-of-service.md)へリンク。

## 6. 特記事項
- 乱数は `Math.random()` を使用（暗号学的乱数ではない）。
- 履歴データはブラウザ内のみで完結し、サーバーには送信されない。
- `soundOn` 変数が定義されているが、現状の実装では効果音は未使用。
