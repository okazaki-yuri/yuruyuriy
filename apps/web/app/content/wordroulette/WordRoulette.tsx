'use client';

import { useEffect, useRef, useState } from 'react';
import { pickRandom, pickRandomIndex, sortWords } from '@yuruyuriy/core';
import ShareButtons from '../../components/ShareButtons';
import { getDictionary, type Locale } from '../../i18n';
import RouletteWheel from './RouletteWheel';

const STORAGE_KEY = 'wordrouletteWords';
const MODE_STORAGE_KEY = 'wordrouletteDisplayMode';

type DisplayMode = 'text' | 'wheel';

/** localStorage から復元した値が「文字列配列」であることを検証する */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((w) => typeof w === 'string');
}

export default function WordRoulette({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.roulette.widget;
  const [words, setWords] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single');
  const [singleInput, setSingleInput] = useState('');
  const [multiInput, setMultiInput] = useState('');
  const [result, setResult] = useState('');
  const [resultState, setResultState] = useState<'' | 'spin' | 'final'>('');
  const [spinning, setSpinning] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('text');
  // ホイールの累積回転角度（deg）。連続で回しても常に前方向へ回るように累積する
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelDuration, setWheelDuration] = useState(0);
  const durationRef = useRef<HTMLSelectElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ページ読み込み時にローカルストレージから復元
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isStringArray(parsed)) {
          setWords(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // ローカルストレージのデータが不正な場合は握りつぶす
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    // 表示方式（テキスト式／ホイール式）の復元
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (savedMode === 'text' || savedMode === 'wheel') {
      setDisplayMode(savedMode);
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
        if (!confirm(t.confirmDuplicate(word))) return;
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
          if (confirm(t.confirmDuplicate(word))) {
            next.push(word);
          }
        }
      });
      updateWords(next);
      setMultiInput('');
    }
  };

  /** 表示方式（テキスト式／ホイール式）を切り替える */
  const changeDisplayMode = (mode: DisplayMode) => {
    setDisplayMode(mode);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  };

  /** ホイール式の抽選：当選区画が上部ポインターで止まるよう回転させる */
  const spinWheel = (durationSec: number) => {
    const index = pickRandomIndex(words.length);
    if (index === null) {
      setResult('');
      setResultState('');
      setSpinning(false);
      return;
    }
    const word = words[index];

    // OS の「視差効果を減らす」設定時はアニメーションを行わない
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const effectiveSec = reduceMotion ? 0 : durationSec;

    // 当選区画の中心角（上部 0deg・時計回り）。区画内で少しずらして単調さを避ける
    const segAngle = 360 / words.length;
    const center = index * segAngle + segAngle / 2;
    const jitter = (Math.random() - 0.5) * segAngle * 0.7;
    const targetPointerAngle = center + jitter;

    // 現在角度から「必ず前方向に」目標角度まで回す
    const currentMod = ((wheelRotation % 360) + 360) % 360;
    const targetMod = (((360 - targetPointerAngle) % 360) + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta <= 0) delta += 360;
    // 抽選時間に応じた空回転（最低2周）
    const extraSpins = effectiveSec > 0 ? Math.max(2, Math.round(effectiveSec * 1.2)) * 360 : 0;

    setWheelDuration(effectiveSec);
    setWheelRotation(wheelRotation + extraSpins + delta);

    const finalize = () => {
      setResult(word);
      setResultState('final');
      setSpinning(false);
    };

    if (effectiveSec === 0) {
      finalize();
    } else {
      // 回転中は前回の結果を消す
      setResult('');
      setResultState('spin');
      timerRef.current = setTimeout(finalize, effectiveSec * 1000 + 100);
    }
  };

  /** ルーレットボタン押下時に抽選を行う */
  const spinRoulette = () => {
    const durationSec = Number(durationRef.current?.value ?? 0);

    setSpinning(true);

    if (displayMode === 'wheel') {
      spinWheel(durationSec);
      return;
    }

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
    updateWords(sortWords(words, order, locale));
  };

  /** ことば一覧をすべて削除する */
  const resetWords = () => {
    if (confirm(t.confirmReset)) {
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
      {/* 表示方式（テキスト式／ホイール式）切替タブ */}
      <div className="mode-tabs" role="group" aria-label={t.modeTabsLabel}>
        <button
          className={`mode-tab${displayMode === 'text' ? ' active' : ''}`}
          disabled={spinning}
          onClick={() => changeDisplayMode('text')}
        >
          {t.modeText}
        </button>
        <button
          className={`mode-tab${displayMode === 'wheel' ? ' active' : ''}`}
          disabled={spinning}
          onClick={() => changeDisplayMode('wheel')}
        >
          {t.modeWheel}
        </button>
      </div>

      {/* ホイール式：円形ルーレット */}
      {displayMode === 'wheel' && (
        <RouletteWheel words={words} rotation={wheelRotation} durationSec={wheelDuration} emptyText={t.wheelEmptyText} />
      )}

      {/* 抽選結果表示（確定値をスクリーンリーダーへ通知）。
          空のとき・抽選中の案内文は CSS の ::before が data 属性から表示する（辞書由来） */}
      <div
        className={`result-box${resultState ? ` ${resultState}` : ''}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-placeholder={t.resultPlaceholder}
        data-spinning={t.resultSpinning}
      >
        {result}
      </div>

      {/* 入力モード切替用のタブ */}
      <div className="tab-container">
        <button
          className={`tab-button${activeTab === 'single' ? ' active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          {t.tabSingle}
        </button>
        <button
          className={`tab-button${activeTab === 'multi' ? ' active' : ''}`}
          onClick={() => setActiveTab('multi')}
        >
          {t.tabMulti}
        </button>
      </div>

      {/* ことば入力エリア */}
      <div className="input-area">
        {/* ことば入力モード */}
        <div className={`tab-content${activeTab === 'single' ? '' : ' hidden'}`}>
          <input
            id="wordInput"
            maxLength={50}
            placeholder={t.singlePlaceholder}
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
            placeholder={t.multiPlaceholder}
            value={multiInput}
            onChange={(e) => setMultiInput(e.target.value)}
          />
        </div>

        {/* 追加＆ルーレットボタン */}
        <div className="button-row">
          <button onClick={addWord}>{t.addButton}</button>
          <button disabled={spinning} onClick={spinRoulette}>
            {spinning ? t.spinningButton : t.spinButton}
          </button>
        </div>
      </div>

      {/* 一覧にことばがある場合のみ表示される */}
      <div className={`sort-controls${words.length === 0 ? ' hidden' : ''}`}>
        {/* ソート */}
        {t.sortLabel}
        <button type="button" className="sort-link" onClick={() => handleSort('asc')}>{t.sortAsc}</button> /
        <button type="button" className="sort-link" onClick={() => handleSort('desc')}>{t.sortDesc}</button>

        {/* ルーレット時間セレクト */}
        <label htmlFor="durationSelect" className="duration-label">{t.durationLabel}</label>
        <select id="durationSelect" className="duration-select" ref={durationRef} defaultValue="3">
          <option value="0">{t.durationNone}</option>
          <option value="1">{t.durationSeconds(1)}</option>
          <option value="3">{t.durationSeconds(3)}</option>
          <option value="5">{t.durationSeconds(5)}</option>
          <option value="10">{t.durationSeconds(10)}</option>
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
          {t.resetButton}
        </button>
      </div>

      {/* SNSシェア（抽選結果の確定後に有効化） */}
      <section aria-label={dict.share.resultSectionLabel}>
        <ShareButtons
          locale={locale}
          text={result ? t.shareText(result) : ''}
          hashtags={t.hashtags}
          disabled={spinning || result === ''}
        />
      </section>
    </>
  );
}
