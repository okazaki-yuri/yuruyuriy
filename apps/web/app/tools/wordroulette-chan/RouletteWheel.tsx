'use client';

/**
 * 円形ルーレットホイール（表示専用コンポーネント）
 * 回転角度・アニメーション時間は親（WordRoulette）が制御する。
 */

type Props = {
  /** 抽選対象のことば一覧 */
  words: string[];
  /** ホイールの累積回転角度（deg） */
  rotation: number;
  /** 回転アニメーションの時間（秒）。0 なら即時反映 */
  durationSec: number;
};

/** 区画の塗り分けパレット（roulette.css の --wheel-* を参照） */
const COLORS = ['var(--wheel-1)', 'var(--wheel-2)', 'var(--wheel-3)', 'var(--wheel-4)'];

/** 隣接区画（最後と最初）が同色にならないように色を選ぶ */
function segmentColor(index: number, total: number): string {
  if (total > 1 && index === total - 1 && index % COLORS.length === 0) {
    return COLORS[2];
  }
  return COLORS[index % COLORS.length];
}

/** 上（12時方向）を 0deg・時計回りとした極座標 → SVG 座標変換 */
function polar(deg: number, radius: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [100 + radius * Math.cos(rad), 100 + radius * Math.sin(rad)];
}

/** 区画数に応じたラベルの文字サイズ */
function labelFontSize(total: number): number {
  if (total <= 8) return 11;
  if (total <= 14) return 9;
  return 7;
}

/** 区画に収まるようにラベルを省略する */
function truncateLabel(word: string): string {
  return word.length > 6 ? `${word.slice(0, 6)}…` : word;
}

export default function RouletteWheel({ words, rotation, durationSec }: Props) {
  const total = words.length;
  const segAngle = total > 0 ? 360 / total : 360;
  const fontSize = labelFontSize(total);
  // 区画が細すぎる場合はラベルを描画しない（潰れて読めないため）
  const showLabels = total <= 30;

  return (
    <div className="wheel-wrap" aria-hidden="true">
      <svg
        className="wheel"
        viewBox="0 0 200 200"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: durationSec > 0 ? `transform ${durationSec}s cubic-bezier(0.15, 0.7, 0.2, 1)` : 'none',
        }}
      >
        {total === 0 ? (
          // ことば未登録：プレースホルダーの円（リング・ハブは描かず案内文を見せる）
          <>
            <circle cx="100" cy="100" r="95" className="wheel-empty" />
            <text x="100" y="104" textAnchor="middle" className="wheel-empty-text">
              ことばを追加してね
            </text>
          </>
        ) : total === 1 ? (
          // 1件のみ：全周を1区画として描画（ラベルは中心ハブと重ならない上寄り位置）
          <>
            <circle cx="100" cy="100" r="95" fill={COLORS[0]} />
            <text x="100" y="60" textAnchor="middle" className="wheel-label" fontSize={fontSize}>
              {truncateLabel(words[0])}
            </text>
          </>
        ) : (
          words.map((word, i) => {
            const start = i * segAngle;
            const end = start + segAngle;
            const mid = start + segAngle / 2;
            const [x0, y0] = polar(start, 95);
            const [x1, y1] = polar(end, 95);
            const largeArc = segAngle > 180 ? 1 : 0;
            return (
              <g key={`${word}-${i}`}>
                <path
                  d={`M 100 100 L ${x0} ${y0} A 95 95 0 ${largeArc} 1 ${x1} ${y1} Z`}
                  fill={segmentColor(i, total)}
                  className="wheel-segment"
                />
                {showLabels && (
                  // 中心から外周へ向かう放射方向にラベルを配置（外周側 x=188 で終端揃え）
                  <text
                    x="188"
                    y={100 + fontSize / 3}
                    textAnchor="end"
                    className="wheel-label"
                    fontSize={fontSize}
                    transform={`rotate(${mid - 90} 100 100)`}
                  >
                    {truncateLabel(word)}
                  </text>
                )}
              </g>
            );
          })
        )}
        {/* 外周リングと中心ハブ（ことば登録時のみ） */}
        {total > 0 && (
          <>
            <circle cx="100" cy="100" r="95" className="wheel-ring" />
            <circle cx="100" cy="100" r="10" className="wheel-hub" />
          </>
        )}
      </svg>
      {/* 上部の当選ポインター（回転しない） */}
      <div className="wheel-pointer" />
    </div>
  );
}
