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
 * ことば一覧を並べ替えた新しい配列を返す
 * @param order 並び順（asc: 昇順 / desc: 降順）
 */
export function sortWords(words: string[], order: 'asc' | 'desc'): string[] {
  return [...words].sort((a, b) =>
    order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  );
}
