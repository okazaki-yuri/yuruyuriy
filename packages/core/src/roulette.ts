/**
 * wordroulette の抽選ロジック（純粋関数）
 * DOM操作・localStorage・演出は含めない（それらはWeb側の責務）
 */

/**
 * 配列からランダムに1件選ぶ
 * @param items 抽選対象
 * @param rng 乱数生成器（テスト時に差し替え可能）
 */
export function pickRandom<T>(items: T[], rng: () => number = Math.random): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(rng() * items.length)];
}

/**
 * 0 以上 length 未満のインデックスをランダムに1つ選ぶ
 * （ホイール表示など、当選「位置」が必要な抽選で使う）
 * @param length 抽選対象の件数
 * @param rng 乱数生成器（テスト時に差し替え可能）
 */
export function pickRandomIndex(length: number, rng: () => number = Math.random): number | null {
  if (length <= 0) return null;
  return Math.floor(rng() * length);
}

/**
 * ことば一覧を並べ替えた新しい配列を返す
 * @param order 並び順（asc: 昇順 / desc: 降順）
 * @param locale 比較に使うロケール。日本語（かな/漢字混在）でも直感的な並びになるよう
 *               既定は 'ja'。英語ページなど他ロケールでは呼び出し側が指定する。
 */
export function sortWords(words: string[], order: 'asc' | 'desc', locale: string = 'ja'): string[] {
  return [...words].sort((a, b) =>
    order === 'asc' ? a.localeCompare(b, locale) : b.localeCompare(a, locale)
  );
}
