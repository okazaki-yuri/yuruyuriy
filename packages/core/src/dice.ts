/**
 * web-dice のロジック（純粋関数）
 * DOM操作・localStorage・演出は含めない（それらはWeb側の責務）
 */

export type DiceConfig = {
  min: number;
  max: number;
  count: number;
};

export const DICE_LIMITS = {
  valueMin: 0,
  valueMax: 100,
  countMin: 1,
  countMax: 30,
} as const;

// 検証エラーの種別。表示文言は web 側の辞書（i18n）で解決する（core は UI 文言を持たない）。
export type DiceValidationError =
  | 'MIN_OUT_OF_RANGE'
  | 'MAX_OUT_OF_RANGE'
  | 'MIN_GREATER_THAN_MAX'
  | 'COUNT_OUT_OF_RANGE';

/**
 * サイコロ設定を検証し、エラーコードの配列を返す（空配列なら妥当）
 */
export function validateDiceConfig({ min, max, count }: DiceConfig): DiceValidationError[] {
  const errors: DiceValidationError[] = [];
  if (min < DICE_LIMITS.valueMin || min > DICE_LIMITS.valueMax) {
    errors.push('MIN_OUT_OF_RANGE');
  }
  if (max < DICE_LIMITS.valueMin || max > DICE_LIMITS.valueMax) {
    errors.push('MAX_OUT_OF_RANGE');
  }
  if (min > max) {
    errors.push('MIN_GREATER_THAN_MAX');
  }
  if (count < DICE_LIMITS.countMin || count > DICE_LIMITS.countMax) {
    errors.push('COUNT_OUT_OF_RANGE');
  }
  return errors;
}

/**
 * サイコロを振って出目の配列を返す
 * @param rng 乱数生成器（テスト時に差し替え可能）
 */
export function rollDice(
  { min, max, count }: DiceConfig,
  rng: () => number = Math.random
): number[] {
  return Array.from({ length: count }, () => Math.floor(rng() * (max - min + 1)) + min);
}

export type DiceStats = {
  sum: number;
  average: number;
  max: number;
  min: number;
};

/**
 * 出目の「合計」「平均」「最大」「最小」を求める
 */
export function calcDiceStats(results: number[]): DiceStats | null {
  if (results.length === 0) return null;
  const sum = results.reduce((a, b) => a + b, 0);
  return {
    sum,
    average: sum / results.length,
    max: Math.max(...results),
    min: Math.min(...results),
  };
}
