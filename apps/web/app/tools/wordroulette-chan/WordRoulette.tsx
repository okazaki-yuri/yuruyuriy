'use client';

import { useEffect, useRef, useState } from 'react';
import { pickRandom, sortWords } from '@yuruyuriy/core';

const STORAGE_KEY = 'wordrouletteWords';

export default function WordRoulette() {
  const [words, setWords] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single');
  const [singleInput, setSingleInput] = useState('');
  const [multiInput, setMultiInput] = useState('');
  const [result, setResult] = useState('');
  const [resultState, setResultState] = useState<'' | 'spin' | 'final'>('');
  const [spinning, setSpinning] = useState(false);
  const durationRef = useRef<HTMLSelectElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ページ読み込み時にローカルストレージから復元
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setWords(JSON.parse(saved));
      } catch {
        // ローカルストレージのデータが不正な場合は握りつぶす
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const updateWords = (next: string[]) => {
    setWords(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  /** ことば一覧にことばを追加する */
  const addWord = () => {
    if (activeTab === 'single') {
      const word = singleInput.trim();
      if (!word) return;
      if (words.includes(word)) {
        if (!confirm(`「${word}」はすでにあります。追加しますか？`)) return;
      }
      updateWords([...words, word]);
      setSingleInput('');
    } else {
      const newWords = multiInput
        .split('\n')
        .map((w) => w.trim())
        .filter((w) => w.length > 0);
      const next = [...words];
      newWords.forEach((word) => {
        if (!next.includes(word)) {
          next.push(word);
        } else {
          if (confirm(`「${word}」はすでにあります。追加しますか？`)) {
            next.push(word);
          }
        }
      });
      updateWords(next);
      setMultiInput('');
    }
  };

  /** ルーレットボタン押下時に抽選を行う */
  const spinRoulette = () => {
    const durationSec = Number(durationRef.current?.value ?? 0);

    setSpinning(true);

    if (words.length === 0 || durationSec === 0) {
      // 抽選時間「なし」または単語なしパターン：抽選結果を即時反映
      setResultState('');
      setResult(pickRandom(words) ?? '');
      setSpinning(false);
      return;
    }

    // 抽選時間の制御
    const totalMs = durationSec * 1000;
    const iterations = 30;
    let baseSpeed = 30; // 最速 30ms
    const denom = ((iterations - 1) * iterations) / 2;
    let speedStep = (totalMs - iterations * baseSpeed) / denom;
    if (speedStep < 0) {
      // 時間が短くてベースを下回る場合
      speedStep = 0;
      baseSpeed = totalMs / iterations;
    }

    let count = 0;

    // 切り替え中の演出
    setResultState('spin');

    const step = () => {
      // ランダム表示
      const word = pickRandom(words) ?? '';
      setResult(word);

      count++;
      if (count < iterations) {
        const delay = baseSpeed + count * speedStep;
        timerRef.current = setTimeout(step, delay);
      } else {
        // 抽選結果を反映
        setResultState('final');
        setSpinning(false);
      }
    };

    step();
  };

  /** ことば一覧の並べ替えを行う */
  const handleSort = (order: 'asc' | 'desc') => {
    updateWords(sortWords(words, order));
  };

  /** ことば一覧をすべて削除する */
  const resetWords = () => {
    if (confirm('ことばをすべて削除しますか？')) {
      setWords([]);
      localStorage.removeItem(STORAGE_KEY);
      // result-box 初期状態に戻す（空に）
      setResult('');
      setResultState('');
    }
  };

  const removeWord = (index: number) => {
    const next = [...words];
    next.splice(index, 1);
    updateWords(next);
  };

  return (
    <>
      {/* 抽選結果表示 */}
      <div className={`result-box${resultState ? ` ${resultState}` : ''}`}>{result}</div>

      {/* 入力モード切替用のタブ */}
      <div className="tab-container">
        <button
          className={`tab-button${activeTab === 'single' ? ' active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          ことば入力
        </button>
        <button
          className={`tab-button${activeTab === 'multi' ? ' active' : ''}`}
          onClick={() => setActiveTab('multi')}
        >
          まとめて入力
        </button>
      </div>

      {/* ことば入力エリア */}
      <div className="input-area">
        {/* ことば入力モード */}
        <div className={`tab-content${activeTab === 'single' ? '' : ' hidden'}`}>
          <input
            id="wordInput"
            maxLength={50}
            placeholder="ことばを入力してEnterまたは追加ボタン"
            value={singleInput}
            onChange={(e) => setSingleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addWord();
            }}
          />
        </div>
        {/* まとめて入力モード */}
        <div className={`tab-content${activeTab === 'multi' ? '' : ' hidden'}`}>
          <textarea
            id="multiInput"
            rows={5}
            placeholder="改行で区切って複数のことばを一括入力"
            value={multiInput}
            onChange={(e) => setMultiInput(e.target.value)}
          />
        </div>

        {/* 追加＆ルーレットボタン */}
        <div className="button-row">
          <button onClick={addWord}>追加</button>
          <button disabled={spinning} onClick={spinRoulette}>
            {spinning ? '抽選中…' : 'ルーレット'}
          </button>
        </div>
      </div>

      {/* 一覧にことばがある場合のみ表示される */}
      <div className={`sort-controls${words.length === 0 ? ' hidden' : ''}`}>
        {/* ソート */}
        並び順：
        <span className="sort-link" onClick={() => handleSort('asc')}>昇順</span> /
        <span className="sort-link" onClick={() => handleSort('desc')}>降順</span>

        {/* ルーレット時間セレクト */}
        <label htmlFor="durationSelect" className="duration-label">抽選時間：</label>
        <select id="durationSelect" className="duration-select" ref={durationRef} defaultValue="3">
          <option value="0">なし</option>
          <option value="1">1秒</option>
          <option value="3">3秒</option>
          <option value="5">5秒</option>
          <option value="10">10秒</option>
        </select>
      </div>

      {/* ことば一覧 */}
      <div className="word-list">
        {words.map((word, index) => (
          <div className="word-tag" key={`${word}-${index}`}>
            {word}
            <button onClick={() => removeWord(index)}>×</button>
          </div>
        ))}
      </div>

      {/* リセットボタン */}
      <div className="reset-area">
        <button className={words.length === 0 ? 'hidden' : ''} onClick={resetWords}>
          リセット
        </button>
      </div>
    </>
  );
}
