'use client';

import { useEffect, useRef, useState } from 'react';
import { calcDiceStats, rollDice, validateDiceConfig, type DiceStats } from '@yuruyuriy/core';
import ShareButtons from '../../components/ShareButtons';
import { getDictionary, type Locale } from '../../i18n';

const STORAGE_KEY = 'diceHistory';
const HISTORY_LIMIT = 50; // 履歴の保持上限（localStorage の無制限肥大を防ぐ）

// よく使う出目範囲のプリセット（最小値・最大値をワンタップで設定する）
const PRESETS = [
  { min: 1, max: 6 },
  { min: 1, max: 10 },
  { min: 1, max: 20 },
  { min: 1, max: 100 },
] as const;

/** 履歴1件。min / max は旧形式（出目配列のみ）から引き継いだ場合は無い */
type HistoryEntry = { results: number[]; min?: number; max?: number };

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((n) => typeof n === 'number');
}

/**
 * localStorage から復元した履歴を検証して HistoryEntry[] に変換する。
 * 旧形式（number[][]）は結果のみの履歴として引き継ぐ。不正データなら null。
 */
function parseHistory(value: unknown): HistoryEntry[] | null {
  if (!Array.isArray(value)) return null;
  const entries: HistoryEntry[] = [];
  for (const row of value) {
    if (isNumberArray(row)) {
      // 旧形式：出目配列のみ（抽選条件は不明のまま表示する）
      entries.push({ results: row });
      continue;
    }
    if (row !== null && typeof row === 'object') {
      const { results, min, max } = row as Record<string, unknown>;
      if (
        isNumberArray(results) &&
        (min === undefined || typeof min === 'number') &&
        (max === undefined || typeof max === 'number')
      ) {
        entries.push({ results, min: min as number | undefined, max: max as number | undefined });
        continue;
      }
    }
    return null; // 不正データはキーごと破棄（従来方針）
  }
  return entries;
}

/** 「合計」「平均」「最大」「最小」の表示文字列を作る（1個の場合は表示しない） */
function statsText(results: number[], format: (stats: DiceStats) => string): string {
  const stats = calcDiceStats(results);
  if (!stats || results.length === 1) return '';
  return format(stats);
}

export default function WebDice({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.dice.widget;
  const [minValue, setMinValue] = useState('1');
  const [maxValue, setMaxValue] = useState('6');
  const [diceCount, setDiceCount] = useState('1');
  const [duration, setDuration] = useState('1000');
  const [currentDice, setCurrentDice] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [rolling, setRolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ページ読み込み時にローカルストレージから履歴を復元
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = parseHistory(JSON.parse(saved));
        if (parsed) {
          setHistory(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  /** サイコロを振る */
  const roll = () => {
    const minRaw = parseInt(minValue);
    const maxRaw = parseInt(maxValue);
    const min = Number.isNaN(minRaw) ? 1 : minRaw;
    const max = Number.isNaN(maxRaw) ? 6 : maxRaw;
    const count = parseInt(diceCount) || 1;
    const durationMs = parseInt(duration) || 1000;

    const errors = validateDiceConfig({ min, max, count });
    if (errors.length > 0) {
      // core はエラーコードを返すので、表示文言は辞書で解決する
      alert(errors.map((e) => t.errors[e]).join('\n') + '\n');
      return;
    }

    // 結果の確定と履歴保存（履歴には抽選条件 min / max も付記する）
    const finalize = () => {
      const results = rollDice({ min, max, count });
      setCurrentDice(results);
      setHistory((prev) => {
        const next = [{ results, min, max }, ...prev].slice(0, HISTORY_LIMIT);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setRolling(false);
    };

    // OS の「視差効果を減らす」設定時は演出を行わず即時確定する（ホイール式ルーレットと同じ方針）
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finalize();
      return;
    }

    setRolling(true);

    // 演出：確定までランダムな出目を切り替え表示する
    intervalRef.current = setInterval(() => {
      setCurrentDice(rollDice({ min, max, count }));
    }, 100);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      finalize();
    }, durationMs);
  };

  /** 履歴リセット */
  const resetHistory = () => {
    if (history.length === 0) return;
    if (confirm(t.confirmReset)) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
      setCurrentDice([]);
    }
  };

  /** SNSシェア用の本文（結果未確定なら空） */
  const shareText = () => {
    if (currentDice.length === 0) return '';
    const lines = [t.shareText(currentDice)];
    const stats = statsText(currentDice, t.statsText);
    if (stats) lines.push(stats);
    return lines.join('\n');
  };

  return (
    <>
      {/* 入力エリア */}
      <section className="controls">
        {/* 最小値 ~ 最大値 */}
        <div className="control-group">
          <label>{t.rangeLabel}</label>
          <div className="inputs">
            <input type="number" min={0} max={100} value={minValue} onChange={(e) => setMinValue(e.target.value)} />
            <span className="tilde">{t.tilde}</span>
            <input type="number" min={0} max={100} value={maxValue} onChange={(e) => setMaxValue(e.target.value)} />
          </div>
          {/* よく使う範囲のプリセット（1〜6・D20 など。min/max をワンタップで設定） */}
          <div className="preset-buttons">
            <span className="preset-label">{t.presetsLabel}</span>
            {PRESETS.map((p) => (
              <button
                key={`${p.min}-${p.max}`}
                type="button"
                className="preset-button"
                disabled={rolling}
                onClick={() => {
                  setMinValue(String(p.min));
                  setMaxValue(String(p.max));
                }}
              >
                {p.min}{t.tilde}{p.max}
              </button>
            ))}
          </div>
          <small>{t.rangeHint}</small>
        </div>

        {/* 個数 */}
        <div className="control-group">
          <label>{t.countLabel}</label>
          <input type="number" min={1} max={30} value={diceCount} onChange={(e) => setDiceCount(e.target.value)} />
          <small>{t.countHint}</small>
        </div>

        {/* 演出時間 */}
        <div className="control-group">
          <label>{t.durationLabel}</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="500">{t.durationSeconds(0.5)}</option>
            <option value="1000">{t.durationSeconds(1)}</option>
            <option value="2000">{t.durationSeconds(2)}</option>
            <option value="3000">{t.durationSeconds(3)}</option>
          </select>
          <small>{t.durationHint}</small>
        </div>

        <button disabled={rolling} onClick={roll}>{t.rollButton}</button>
      </section>

      {/* 出目カード（視覚表示）。演出中は100msごとに仮の出目で更新されるため、
          live region にはせず、確定結果のみ下の視覚非表示領域から通知する */}
      <section id="dice-area">
        {currentDice.map((val, i) => (
          <div className="dice-card" key={i}>{val}</div>
        ))}
      </section>
      <div id="dice-stats">{statsText(currentDice, t.statsText)}</div>

      {/* スクリーンリーダー向け通知：確定した結果だけを1回読み上げる（演出中は空のまま） */}
      <div role="status" aria-live="polite" aria-atomic="true" className="visually-hidden">
        {rolling ? '' : shareText()}
      </div>

      <section id="history-area">
        <h2>{t.historyHeading}</h2>
        <div id="history">
          {history.map((h, i) => (
            <div className="history-item" key={i}>
              <b>{t.historyResultLabel}</b>{h.results.join(', ')}
              {/* 抽選条件（旧形式から引き継いだ履歴には無い） */}
              {h.min !== undefined && h.max !== undefined && (
                <span className="history-config">{t.historyConfig(h.min, h.max, h.results.length)}</span>
              )}
              {h.results.length > 1 && (
                <>
                  <br />
                  {statsText(h.results, t.statsText)}
                </>
              )}
            </div>
          ))}
        </div>
        <button disabled={history.length === 0} onClick={resetHistory}>{t.resetButton}</button>
      </section>

      {/* SNSシェア（結果確定後に有効化） */}
      <section aria-label={dict.share.resultSectionLabel}>
        <ShareButtons
          locale={locale}
          text={shareText()}
          hashtags={t.hashtags}
          disabled={rolling || currentDice.length === 0}
        />
      </section>
    </>
  );
}
