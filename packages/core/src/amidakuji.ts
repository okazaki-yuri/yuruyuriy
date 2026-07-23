/**
 * あみだくじちゃん のロジック（純粋関数）
 * DOM操作・localStorage・演出は含めない（それらはWeb側の責務）
 */

/** 横棒。row 段目で col 番目と col+1 番目の縦線を結ぶ（いずれも0始まり） */
export type Rung = {
  row: number;
  col: number;
};

export type AmidakujiLadder = {
  /** 縦線の本数（= 参加者数） */
  columns: number;
  /** 段数（横棒を置ける行帯の数） */
  rows: number;
  /** row 昇順 → col 昇順でソート済み */
  rungs: Rung[];
};

export const AMIDAKUJI_LIMITS = {
  participantsMin: 2,
  participantsMax: 12,
} as const;

// 検証エラーの種別。表示文言は web 側の辞書（i18n）で解決する（core は UI 文言を持たない）。
export type AmidakujiValidationError = 'PARTICIPANTS_OUT_OF_RANGE';

/**
 * 参加者数を検証し、エラーコードの配列を返す（空配列なら妥当）
 */
export function validateParticipantCount(count: number): AmidakujiValidationError[] {
  const errors: AmidakujiValidationError[] = [];
  if (count < AMIDAKUJI_LIMITS.participantsMin || count > AMIDAKUJI_LIMITS.participantsMax) {
    errors.push('PARTICIPANTS_OUT_OF_RANGE');
  }
  return errors;
}

/** 横棒の配置確率（各段・各境界ごと） */
const RUNG_PROBABILITY = 0.4;

/** 全境界に横棒が置けるまでの再生成の上限回数（1回あたりの失敗確率は1%未満） */
const GENERATE_ATTEMPTS = 10;

/**
 * あみだくじの横棒をランダム生成する
 * - 同じ段で隣接する境界には横棒を置かない（3叉の曖昧さ防止）
 * - 横棒が1本もない境界には補修として1本挿入する（見た目の破綻防止）。
 *   隣接禁止により補修先の段が全て塞がっている稀なケースは、盤面ごと再生成して回避する
 * @param rng 乱数生成器（テスト時に差し替え可能）
 */
export function generateLadder(
  columns: number,
  rng: () => number = Math.random
): AmidakujiLadder {
  // 少人数でも十分に交差し、大人数でも縦に伸びすぎない段数
  const rows = Math.min(12, Math.max(6, columns + 3));
  let grid: boolean[][] = [];

  for (let attempt = 0; attempt < GENERATE_ATTEMPTS; attempt++) {
    // grid[row][col] … 境界 col（縦線 col と col+1 の間）に横棒があるか
    grid = Array.from({ length: rows }, () =>
      Array.from({ length: Math.max(0, columns - 1) }, () => false)
    );

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns - 1; col++) {
        // 同じ段の左隣に横棒があれば置かない
        if (col > 0 && grid[row][col - 1]) continue;
        if (rng() < RUNG_PROBABILITY) {
          grid[row][col] = true;
        }
      }
    }

    // 補修パス: 横棒ゼロの境界へ、隣接禁止を守れる段に1本挿入する
    let repaired = true;
    for (let col = 0; col < columns - 1; col++) {
      if (grid.some((rowBars) => rowBars[col])) continue;
      const candidates: number[] = [];
      for (let row = 0; row < rows; row++) {
        const leftBlocked = col > 0 && grid[row][col - 1];
        const rightBlocked = col < columns - 2 && grid[row][col + 1];
        if (!leftBlocked && !rightBlocked) candidates.push(row);
      }
      if (candidates.length > 0) {
        const row = candidates[Math.floor(rng() * candidates.length)];
        grid[row][col] = true;
      } else {
        // 両隣の横棒で全段が塞がっている稀なケース。この盤面は破棄して作り直す
        repaired = false;
        break;
      }
    }
    if (repaired) break;
  }

  const rungs: Rung[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns - 1; col++) {
      if (grid[row][col]) rungs.push({ row, col });
    }
  }
  return { columns, rows, rungs };
}

/**
 * 経路の折れ線頂点（はしご論理座標）
 * col は縦線番号、y は 0（上端）〜 rows+1（下端）。横棒 row r は y = r + 1 の高さで交差する
 */
export type PathPoint = {
  col: number;
  y: number;
};

export type TraceResult = {
  /** 到達した縦線番号（0始まり） */
  goalIndex: number;
  /** 上端 → 下端の折れ線頂点列。SVG 座標へ線形変換して利用する */
  points: PathPoint[];
};

/**
 * startColumn 番目の縦線を上端から下端までたどる
 */
export function traceLadder(ladder: AmidakujiLadder, startColumn: number): TraceResult {
  const { columns, rows, rungs } = ladder;
  // O(1) 参照用に境界をキー化（row * columns + col）
  const rungSet = new Set(rungs.map(({ row, col }) => row * columns + col));

  let col = startColumn;
  const points: PathPoint[] = [{ col, y: 0 }];
  for (let row = 0; row < rows; row++) {
    const y = row + 1;
    if (col < columns - 1 && rungSet.has(row * columns + col)) {
      // 右へ移動
      points.push({ col, y }, { col: col + 1, y });
      col += 1;
    } else if (col > 0 && rungSet.has(row * columns + (col - 1))) {
      // 左へ移動
      points.push({ col, y }, { col: col - 1, y });
      col -= 1;
    }
  }
  points.push({ col, y: rows + 1 });
  return { goalIndex: col, points };
}

/**
 * 全縦線をたどり、出発列順の結果を返す（goalIndex 群は順列になる）
 */
export function traceAll(ladder: AmidakujiLadder): TraceResult[] {
  return Array.from({ length: ladder.columns }, (_, i) => traceLadder(ladder, i));
}

/**
 * ゴール一覧を参加者数に合わせて正規化する
 * 空文字・不足分は 1 始まりの連番文字列で補完し、超過分は切り捨てる
 */
export function normalizeGoals(goals: string[], count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const goal = goals[i]?.trim() ?? '';
    return goal !== '' ? goal : String(i + 1);
  });
}
