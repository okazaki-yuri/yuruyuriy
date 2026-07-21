'use client';

import { useEffect, useRef, useState } from 'react';
import { calcDiceStats, rollDice, validateDiceConfig } from '@yuruyuriy/core';

const STORAGE_KEY = 'diceHistory';
const HISTORY_LIMIT = 50; // 履歴の保持上限（localStorage の無制限肥大を防ぐ）

/** localStorage から復元した履歴が「数値配列の配列」であることを検証する */
function isValidHistory(value: unknown): value is number[][] {
  return (
    Array.isArray(value) &&
    value.every((row) => Array.isArray(row) && row.every((n) => typeof n === 'number'))
  );
}

/** 「合計」「平均」「最大」「最小」の表示文字列を作る（1個の場合は表示しない） */
function statsText(results: number[]): string {
  const stats = calcDiceStats(results);
  if (!stats || results.length === 1) return '';
  return `合計: ${stats.sum} / 平均: ${stats.average.toFixed(2)} / 最大: ${stats.max} / 最小: ${stats.min}`;
}

export default function WebDice() {
  const [minValue, setMinValue] = useState('1');
  const [maxValue, setMaxValue] = useState('6');
  const [diceCount, setDiceCount] = useState('1');
  const [duration, setDuration] = useState('1000');
  const [currentDice, setCurrentDice] = useState<number[]>([]);
  const [history, setHistory] = useState<number[][]>([]);
  const [rolling, setRolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ページ読み込み時にローカルストレージから履歴を復元
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isValidHistory(parsed)) {
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
      alert(errors.join('\n') + '\n');
      return;
    }

    setRolling(true);

    // 演出：確定までランダムな出目を切り替え表示する
    intervalRef.current = setInterval(() => {
      setCurrentDice(rollDice({ min, max, count }));
    }, 100);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const results = rollDice({ min, max, count });
      setCurrentDice(results);

      // 履歴保存
      setHistory((prev) => {
        const next = [results, ...prev].slice(0, HISTORY_LIMIT);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setRolling(false);
    }, durationMs);
  };

  /** 履歴リセット */
  const resetHistory = () => {
    if (history.length === 0) return;
    if (confirm('履歴をすべて削除しますか？')) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
      setCurrentDice([]);
    }
  };

  /** SNSシェア（X） */
  const shareToX = () => {
    const diceText = currentDice.join(', ');
    const text = `結果: ${diceText} \n${statsText(currentDice)} \n\n#サイコロツール\n`;
    const url = encodeURIComponent(location.href);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <>
      {/* 入力エリア */}
      <section className="controls">
        {/* 最小値 ~ 最大値 */}
        <div className="control-group">
          <label>サイコロの出目（最小値 ~ 最大値）</label>
          <div className="inputs">
            <input type="number" min={0} max={100} value={minValue} onChange={(e) => setMinValue(e.target.value)} />
            <span className="tilde">~</span>
            <input type="number" min={0} max={100} value={maxValue} onChange={(e) => setMaxValue(e.target.value)} />
          </div>
          <small>サイコロの出目を0~100で入力してください。</small>
        </div>

        {/* 個数 */}
        <div className="control-group">
          <label>サイコロの個数</label>
          <input type="number" min={1} max={30} value={diceCount} onChange={(e) => setDiceCount(e.target.value)} />
          <small>サイコロの個数を1~30で入力してください。</small>
        </div>

        {/* 演出時間 */}
        <div className="control-group">
          <label>演出時間</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="500">0.5秒</option>
            <option value="1000">1秒</option>
            <option value="2000">2秒</option>
            <option value="3000">3秒</option>
          </select>
          <small>演出時間を指定できます。</small>
        </div>

        <button disabled={rolling} onClick={roll}>サイコロを振る</button>
      </section>

      <section id="dice-area" role="status" aria-live="polite" aria-atomic="true">
        {currentDice.map((val, i) => (
          <div className="dice-card" key={i}>{val}</div>
        ))}
      </section>
      <div id="dice-stats">{statsText(currentDice)}</div>

      <section id="history-area">
        <h2>履歴</h2>
        <div id="history">
          {history.map((h, i) => (
            <div className="history-item" key={i}>
              <b>結果：</b>{h.join(', ')}
              {h.length > 1 && (
                <>
                  <br />
                  {statsText(h)}
                </>
              )}
            </div>
          ))}
        </div>
        <button disabled={history.length === 0} onClick={resetHistory}>履歴をリセット</button>
      </section>

      <section id="options">
        <button type="button" className="share-button" aria-label="結果をXでシェア" onClick={shareToX}>
          <img src="/assets/x_icon.png" alt="" width={128} height={128} />
        </button>
        {/* TODO 他のSNSシェア */}
        {/* CSSで横並びに設定済み */}
      </section>
    </>
  );
}
