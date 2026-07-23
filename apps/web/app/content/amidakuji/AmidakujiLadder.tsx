'use client';

/**
 * あみだくじのはしご（表示専用コンポーネント）
 * はしごの生成・公開状態・演出時間は親（Amidakuji）が制御する。
 */

import { useEffect, useState } from 'react';
import type { AmidakujiLadder, TraceResult } from '@yuruyuriy/core';

type Props = {
  /** はしご（未生成時は null でプレースホルダーを表示） */
  ladder: AmidakujiLadder | null;
  /** 全参加者の経路（出発列順）。スタート前のプレビュー表示では null */
  traces: TraceResult[] | null;
  /** 経路を表示する参加者 index の一覧 */
  revealed: number[];
  /** 経路をなぞる時間（秒）。0 なら即時表示 */
  durationSec: number;
  /** 上ラベル（参加者名） */
  participants: string[];
  /** 下ラベル（ゴール）。未公開の列は親が「?」を渡す */
  goalLabels: string[] | null;
  /** はしご未生成時に表示する案内文（辞書から渡す） */
  emptyText: string;
};

/** 経路の塗り分けパレット（amidakuji.css の --amida-path-* を参照） */
const PATH_COLORS = [
  'var(--amida-path-1)',
  'var(--amida-path-2)',
  'var(--amida-path-3)',
  'var(--amida-path-4)',
  'var(--amida-path-5)',
  'var(--amida-path-6)',
];

/** 1列あたりの横幅（viewBox 単位）。サイドマージンを持たせず等分し、HTML 側の grid と揃える */
const COL_UNIT = 60;
/** 1段あたりの高さ（viewBox 単位） */
const ROW_UNIT = 26;
/** 上下のラベル帯の高さ（viewBox 単位） */
const LABEL_BAND = 30;

/** 列数に応じたラベルの文字サイズ */
function labelFontSize(columns: number): number {
  if (columns <= 4) return 12;
  if (columns <= 6) return 11;
  if (columns <= 9) return 10;
  return 9;
}

/** 列幅に収まるようにラベルを省略する */
function truncateLabel(label: string, columns: number): string {
  const max = columns <= 6 ? 5 : columns <= 9 ? 4 : 3;
  return label.length > max ? `${label.slice(0, max)}…` : label;
}

export default function AmidakujiLadderView({
  ladder,
  traces,
  revealed,
  durationSec,
  participants,
  goalLabels,
  emptyText,
}: Props) {
  // strokeDashoffset を 0 にした（＝経路を描画し終えた／描画中の）参加者 index 群。
  // マウント直後は offset = 全長 の状態を一度描画し、その後 0 へ遷移させることで
  // 「線をなぞる」CSS transition を発火させる（二重 rAF でスタイル反映を待つ）
  const [drawn, setDrawn] = useState<number[]>([]);

  useEffect(() => {
    if (revealed.length === 0) {
      setDrawn([]);
      return;
    }
    if (durationSec === 0) {
      setDrawn(revealed);
      return;
    }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setDrawn(revealed));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [revealed, durationSec]);

  if (!ladder) {
    // はしご未生成（参加者0人）：プレースホルダー枠に案内文を表示する
    return (
      <div className="amida-wrap" aria-hidden="true">
        <svg className="amida-svg" viewBox="0 0 300 150">
          <rect x="4" y="4" width="292" height="142" rx="10" className="amida-empty" />
          <text x="150" y="79" textAnchor="middle" className="amida-empty-text">
            {emptyText}
          </text>
        </svg>
      </div>
    );
  }

  const { columns, rows, rungs } = ladder;
  const width = columns * COL_UNIT;
  const height = LABEL_BAND * 2 + (rows + 1) * ROW_UNIT;
  const fontSize = labelFontSize(columns);
  /** 縦線 col の X 座標 */
  const colX = (col: number) => COL_UNIT * (col + 0.5);
  /** はしご論理座標 y（0〜rows+1）の Y 座標 */
  const rowY = (y: number) => LABEL_BAND + y * ROW_UNIT;

  return (
    // 少人数のとき、はしごが横幅いっぱいに拡大されて縦長になりすぎないよう、列数に応じて上限幅を絞る
    <div className="amida-wrap" aria-hidden="true" style={{ maxWidth: `min(var(--panel), ${columns * 90}px)` }}>
      <svg className="amida-svg" viewBox={`0 0 ${width} ${height}`}>
        {/* 上ラベル（参加者名） */}
        {participants.map((name, i) => (
          <text
            key={`p-${i}`}
            x={colX(i)}
            y={LABEL_BAND - 10}
            textAnchor="middle"
            className="amida-label"
            fontSize={fontSize}
          >
            {truncateLabel(name, columns)}
          </text>
        ))}

        {/* 縦線 */}
        {Array.from({ length: columns }, (_, i) => (
          <line
            key={`rail-${i}`}
            x1={colX(i)}
            y1={rowY(0)}
            x2={colX(i)}
            y2={rowY(rows + 1)}
            className="amida-rail"
          />
        ))}

        {/* 横棒 */}
        {rungs.map(({ row, col }) => (
          <line
            key={`rung-${row}-${col}`}
            x1={colX(col)}
            y1={rowY(row + 1)}
            x2={colX(col + 1)}
            y2={rowY(row + 1)}
            className="amida-rung"
          />
        ))}

        {/* 公開された参加者の経路（stroke-dashoffset の遷移で線をなぞる演出） */}
        {revealed.map((i) => {
          const trace = traces?.[i];
          if (!trace) return null;
          const px = trace.points.map((p) => ({ x: colX(p.col), y: rowY(p.y) }));
          // 経路は軸平行なので全長は座標差の和で求まる（getTotalLength 不要 = SSR 安全）
          let length = 0;
          for (let k = 1; k < px.length; k++) {
            length += Math.abs(px[k].x - px[k - 1].x) + Math.abs(px[k].y - px[k - 1].y);
          }
          const isDrawn = drawn.includes(i);
          return (
            <polyline
              key={`trace-${i}`}
              className="amida-trace"
              points={px.map((p) => `${p.x},${p.y}`).join(' ')}
              stroke={PATH_COLORS[i % PATH_COLORS.length]}
              style={{
                strokeDasharray: length,
                strokeDashoffset: isDrawn ? 0 : length,
                transition:
                  durationSec > 0 ? `stroke-dashoffset ${durationSec}s ease-in-out` : 'none',
              }}
            />
          );
        })}

        {/* 下ラベル（ゴール。未公開の列は「?」） */}
        {goalLabels?.map((goal, i) => (
          <text
            key={`g-${i}`}
            x={colX(i)}
            y={height - LABEL_BAND + 18}
            textAnchor="middle"
            className={`amida-label${goal === '?' ? ' amida-goal-hidden' : ''}`}
            fontSize={fontSize}
          >
            {truncateLabel(goal, columns)}
          </text>
        ))}
      </svg>
    </div>
  );
}
