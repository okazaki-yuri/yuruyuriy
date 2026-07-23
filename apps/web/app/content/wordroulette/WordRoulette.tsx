'use client';

import { useEffect, useRef, useState } from 'react';
import { pickRandom, pickRandomIndex, sortWords } from '@yuruyuriy/core';
import ShareButtons from '../../components/ShareButtons';
import { getDictionary, type Locale } from '../../i18n';
import RouletteWheel from './RouletteWheel';

const STORAGE_KEY = 'wordrouletteWords';
const MODE_STORAGE_KEY = 'wordrouletteDisplayMode';
const HISTORY_STORAGE_KEY = 'wordrouletteHistory';
const REMOVE_WINNER_STORAGE_KEY = 'wordrouletteRemoveWinner';
const DURATION_STORAGE_KEY = 'wordrouletteDuration';
// 1語あたりの最大文字数（1語入力の maxLength と、まとめて入力の行ごとの切り詰めで共用）
const MAX_WORD_LENGTH = 50;
// 履歴の保持上限（WEBサイコロちゃんと同方針。localStorage の無制限肥大を防ぐ）
const HISTORY_LIMIT = 50;
// 抽選時間セレクトの選択肢（秒）。localStorage 復元時の検証にも使う
const DURATION_OPTIONS = ['0', '1', '3', '5', '10'] as const;

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
  const [history, setHistory] = useState<string[]>([]);
  // 当選したことばを一覧から自動で除外するオプション
  const [removeWinner, setRemoveWinner] = useState(false);
  const [duration, setDuration] = useState<string>('3');
  // ホイールの累積回転角度（deg）。連続で回しても常に前方向へ回るように累積する
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelDuration, setWheelDuration] = useState(0);
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
    // 抽選履歴の復元
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (isStringArray(parsed)) {
          setHistory(parsed);
        } else {
          localStorage.removeItem(HISTORY_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      }
    }
    // 当選除外オプションの復元
    setRemoveWinner(localStorage.getItem(REMOVE_WINNER_STORAGE_KEY) === 'true');
    // 抽選時間の復元
    const savedDuration = localStorage.getItem(DURATION_STORAGE_KEY);
    if (savedDuration && (DURATION_OPTIONS as readonly string[]).includes(savedDuration)) {
      setDuration(savedDuration);
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
        // 1語入力の maxLength と同じ上限を適用（超過分は入力欄と同様に切り詰める）
        .map((w) => w.trim().slice(0, MAX_WORD_LENGTH))
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

  /** 抽選の当選を確定する（結果表示・履歴保存・当選除外オプションの適用） */
  const finalizeWin = (word: string) => {
    setResult(word);
    setResultState('final');
    setSpinning(false);
    // 履歴へ追加（新しい順・上限あり）
    setHistory((prev) => {
      const next = [word, ...prev].slice(0, HISTORY_LIMIT);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    // オプション：当選したことばを一覧から除外（同名重複があっても1件だけ）
    if (removeWinner) {
      setWords((prev) => {
        const index = prev.indexOf(word);
        if (index === -1) return prev;
        const next = prev.filter((_, i) => i !== index);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
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

    if (effectiveSec === 0) {
      finalizeWin(word);
    } else {
      // 回転中は前回の結果を消す
      setResult('');
      setResultState('spin');
      timerRef.current = setTimeout(() => finalizeWin(word), effectiveSec * 1000 + 100);
    }
  };

  /** ルーレットボタン押下時に抽選を行う */
  const spinRoulette = () => {
    const durationSec = Number(duration);

    setSpinning(true);

    if (displayMode === 'wheel') {
      spinWheel(durationSec);
      return;
    }

    if (words.length === 0 || durationSec === 0) {
      const word = pickRandom(words);
      if (word === null) {
        // ことば未登録：結果表示を初期状態に戻すのみ
        setResult('');
        setResultState('');
        setSpinning(false);
        return;
      }
      // 抽選時間「なし」：演出せず即時確定
      finalizeWin(word);
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
      count++;
      if (count < iterations) {
        // ランダム表示（演出中の仮のことば）
        setResult(pickRandom(words) ?? '');
        const delay = baseSpeed + count * speedStep;
        timerRef.current = setTimeout(step, delay);
      } else {
        // 最後の1回で当選を確定する
        const word = pickRandom(words);
        if (word !== null) {
          finalizeWin(word);
        } else {
          setSpinning(false);
        }
      }
    };

    step();
  };

  /** 抽選履歴をすべて削除する */
  const resetHistory = () => {
    if (history.length === 0) return;
    if (confirm(t.confirmHistoryReset)) {
      setHistory([]);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  };

  /** 当選除外オプションの切替と localStorage 保存 */
  const changeRemoveWinner = (checked: boolean) => {
    setRemoveWinner(checked);
    localStorage.setItem(REMOVE_WINNER_STORAGE_KEY, String(checked));
  };

  /** 抽選時間の変更と localStorage 保存 */
  const changeDuration = (value: string) => {
    setDuration(value);
    localStorage.setItem(DURATION_STORAGE_KEY, value);
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

      {/* 抽選結果表示（視覚表示）。テキスト式の演出中は高頻度で仮のことばに更新されるため、
          live region にはせず、確定結果のみ下の視覚非表示領域から通知する。
          空のとき・抽選中の案内文は CSS の ::before が data 属性から表示する（辞書由来） */}
      <div
        className={`result-box${resultState ? ` ${resultState}` : ''}`}
        data-placeholder={t.resultPlaceholder}
        data-spinning={t.resultSpinning}
      >
        {result}
      </div>

      {/* スクリーンリーダー向け通知：確定した結果だけを1回読み上げる（演出中は空のまま） */}
      <div role="status" aria-live="polite" aria-atomic="true" className="visually-hidden">
        {spinning || result === '' ? '' : t.shareText(result)}
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
            maxLength={MAX_WORD_LENGTH}
            placeholder={t.singlePlaceholder}
            value={singleInput}
            onChange={(e) => setSingleInput(e.target.value)}
            onKeyDown={(e) => {
              // IME の変換確定 Enter では追加しない。
              // isComposing … Chrome/Firefox（macOS）は変換確定も key==='Enter' で発火するため除外
              // keyCode 229 … Safari は compositionend 後に isComposing=false で発火するため併用
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addWord();
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

        {/* ルーレット時間セレクト（選択は localStorage に保存され次回も復元される） */}
        <label htmlFor="durationSelect" className="duration-label">{t.durationLabel}</label>
        <select
          id="durationSelect"
          className="duration-select"
          value={duration}
          onChange={(e) => changeDuration(e.target.value)}
        >
          {DURATION_OPTIONS.map((sec) => (
            <option key={sec} value={sec}>
              {sec === '0' ? t.durationNone : t.durationSeconds(Number(sec))}
            </option>
          ))}
        </select>
      </div>

      {/* 当選除外オプション（登録が1件以上のとき表示。抽選中は変更不可） */}
      <div className={`spin-options${words.length === 0 ? ' hidden' : ''}`}>
        <label className="remove-winner-label">
          <input
            type="checkbox"
            checked={removeWinner}
            disabled={spinning}
            onChange={(e) => changeRemoveWinner(e.target.checked)}
          />
          {t.removeWinnerLabel}
        </label>
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

      {/* 抽選履歴（新しい順・最大50件。ブラウザ内にのみ保存） */}
      <section className="history-area">
        <h2>{t.historyHeading}</h2>
        <div className="history-list">
          {history.map((word, index) => (
            <div className="history-item" key={`${word}-${index}`}>{word}</div>
          ))}
        </div>
        <button disabled={history.length === 0} onClick={resetHistory}>{t.historyResetButton}</button>
      </section>

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
