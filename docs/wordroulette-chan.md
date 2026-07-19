# 設計書 : ことばルーレットちゃん（単語抽選ツール）

入力した「ことば」の中からランダムに1つを選んで表示するルーレットツール。お題決め・チーム分け・抽選などに利用できる。

- URL: `https://tools.yl-yuriy.com/tools/wordroulette-chan/`
- ファイル: `tools/wordroulette-chan/index.html` / `style.css` / `script.js`
- 使用CSS: `css/style.css`, `tools/wordroulette-chan/style.css`, `components/header-footer.css`
- 上位ドキュメント: [README](../README.md)

---

## 1. 機能概要
- ことばを登録し、その中から**ランダムに1語を抽選**する。
- 演出（ルーレット的に切り替わりながら減速して止まる）を任意の秒数で設定可能。
- 登録内容は **localStorage に永続化**され、再訪時に復元される。

## 2. 画面構成
1. **抽選結果表示（`#resultBox`）** … 抽選結果を大きく表示。演出中は `spin`、確定時は `final` クラスが付く。
2. **入力モード切替タブ（`.tab-container`）**
   - 「ことば入力」（1語ずつ）
   - 「まとめて入力」（改行区切りで一括）
3. **入力エリア（`.input-area`）**
   - 単語入力 `#wordInput`（最大50文字、Enterで追加可）
   - 一括入力 `#multiInput`（textarea）
   - 「追加」ボタン / 「ルーレット」ボタン（`#spinBtn`）
4. **並び順・抽選時間コントロール（`#sortControls`）** … 登録が1件以上のとき表示
   - 昇順 / 降順ソート
   - 抽選時間セレクト（なし / 1 / 3 / 5 / 10秒）
5. **ことば一覧（`#wordList`）** … 登録単語をタグ表示。各タグに削除ボタン（×）。
6. **リセットボタン（`#resetBtn`）** … 登録が1件以上のとき表示。全削除。
7. **ツール概要（`.introduction-area`）/ 使い方ガイド（`.howto-area`）**

## 3. データ設計（localStorage）
| キー | 型 | 内容 |
| --- | --- | --- |
| `wordrouletteWords` | JSON文字列（string[]） | 登録された単語の配列 |

- 読み込み: `loadFromLocalStorage()`。パース失敗時は空配列にリセットしキーを削除（握りつぶし）。
- 保存: `saveToLocalStorage()`。追加・削除・並び替えのたびに保存。

## 4. 主なロジック（`script.js`）
| 関数 | 役割 |
| --- | --- |
| `loadFromLocalStorage()` | 起動時に localStorage から復元 |
| `saveToLocalStorage()` | 現在の単語配列を保存 |
| `updateWordList()` | 一覧の再描画、ソート/リセットUIの表示制御 |
| `addWord()` | 選択中モードに応じて単語を追加（重複時は確認ダイアログ） |
| `spinRoulette()` | 抽選演出と結果確定。抽選時間から減速アルゴリズムを算出 |
| `sortWords(order)` | `localeCompare` による昇順/降順ソート |
| `resetWords()` | 確認後に全削除・結果表示クリア |

### 抽選演出のアルゴリズム
- 反復回数 `iterations = 30` 固定。
- 総時間 `durationSec * 1000` から、各ステップの遅延を「基準速度 + 徐々に増える増分」で算出し、**後半ほど遅く**なる（減速）演出を実現。
- 時間が短く基準速度を下回る場合は増分を0にし、均等割りにフォールバック。
- 抽選時間「なし（0秒）」または未登録時は即時に結果を反映。

## 5. イベント
- タブボタン: クリックでモード切替（`active` クラスと `hidden` の付け替え）。
- `#wordInput`: Enter キーで `addWord()`。
- ボタン: `onclick` 属性で `addWord()` / `spinRoulette()` を直接呼び出し。

## 6. 依存・外部連携
- Google Analytics（gtag.js）/ Google Fonts / ヘッダー・フッター（[共通](./common-components.md)）
- 使い方ガイドから[利用規約](./terms-of-service.md)へリンク。

## 7. 特記事項
- 抽選ロジックは `Math.random()` を使用（暗号学的乱数ではない）。
- 単語データはブラウザ内のみで完結し、サーバーには送信されない。
