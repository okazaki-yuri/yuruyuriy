'use client';

import { useEffect, useRef, useState } from 'react';
import {
  generateLadder,
  normalizeGoals,
  traceAll,
  validateParticipantCount,
  type AmidakujiLadder,
  type TraceResult,
} from '@yuruyuriy/core';
import ShareButtons from '../../components/ShareButtons';
import { getDictionary, type Locale } from '../../i18n';
import AmidakujiLadderView from './AmidakujiLadder';

const PARTICIPANTS_STORAGE_KEY = 'amidakujiParticipants';
const GOALS_STORAGE_KEY = 'amidakujiGoals';
const MODE_STORAGE_KEY = 'amidakujiRevealMode';
const DURATION_STORAGE_KEY = 'amidakujiDuration';
// 1名あたりの最大文字数（1名入力の maxLength と、まとめて入力・ゴールの行ごとの切り詰めで共用）
const MAX_NAME_LENGTH = 50;
// 演出時間セレクトの選択肢（秒）。localStorage 復元時の検証にも使う
const DURATION_OPTIONS = ['0', '1', '3', '5'] as const;

/** 結果の表示方式（一括表示／1人ずつ） */
type RevealMode = 'batch' | 'one';

/**
 * 進行状態。
 * idle … はしご未生成（入力編集中） / ready … はしご生成済み・公開待ち
 * revealing … 経路をなぞる演出中 / revealed … 全員の結果が確定
 */
type Phase = 'idle' | 'ready' | 'revealing' | 'revealed';

/** localStorage から復元した値が「文字列配列」であることを検証する */
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((w) => typeof w === 'string');
}

export default function Amidakuji({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.amidakuji.widget;
  const [participants, setParticipants] = useState<string[]>([]);
  // ゴール（結果のことば）。常に参加者数と同じ長さを保つ（1人につき1欄）
  const [goals, setGoals] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single');
  const [singleInput, setSingleInput] = useState('');
  const [multiInput, setMultiInput] = useState('');
  const [revealMode, setRevealMode] = useState<RevealMode>('batch');
  const [duration, setDuration] = useState<string>('3');
  const [phase, setPhase] = useState<Phase>('idle');
  // スタート時のスナップショット（はしご・全経路・確定ゴール）。セッション内のみで永続化しない
  const [ladder, setLadder] = useState<AmidakujiLadder | null>(null);
  const [traces, setTraces] = useState<TraceResult[] | null>(null);
  const [assignedGoals, setAssignedGoals] = useState<string[] | null>(null);
  // 経路を表示中（演出中含む）の参加者 index 群
  const [revealed, setRevealed] = useState<number[]>([]);
  // 結果が確定した参加者 index 群（確定順。結果一覧とゴールラベルの公開に使う）
  const [confirmed, setConfirmed] = useState<number[]>([]);
  // 現在の公開演出に使う秒数（reduced-motion 適用後）。はしご側の transition に渡す
  const [traceDuration, setTraceDuration] = useState(0);
  const [countError, setCountError] = useState(false);
  // スクリーンリーダー向け通知文（確定時のみ更新して1回読み上げる）
  const [announced, setAnnounced] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 参加者数に合わせたゴールの既定値（アタリ×1 + 残りハズレ） */
  const defaultGoals = (count: number) =>
    Array.from({ length: count }, (_, i) => (i === 0 ? t.goalDefaultWin : t.goalDefaultLose));

  /**
   * ゴールを参加者数と同じ長さにそろえる。
   * 既存の入力は保持し、増えた分はハズレで埋める（全欄が未保存なら既定値を使う）
   */
  const fitGoals = (base: string[], count: number) => {
    if (count === 0) return [];
    if (base.length === 0) return defaultGoals(count);
    return Array.from({ length: count }, (_, i) => base[i] ?? t.goalDefaultLose);
  };

  // ページ読み込み時にローカルストレージから復元
  useEffect(() => {
    let loadedParticipants: string[] = [];
    const saved = localStorage.getItem(PARTICIPANTS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isStringArray(parsed)) {
          loadedParticipants = parsed;
          setParticipants(parsed);
        } else {
          localStorage.removeItem(PARTICIPANTS_STORAGE_KEY);
        }
      } catch {
        // ローカルストレージのデータが不正な場合は握りつぶす
        localStorage.removeItem(PARTICIPANTS_STORAGE_KEY);
      }
    }
    // ゴール（結果のことば）の復元。参加者数と長さをそろえる
    let loadedGoals: string[] = [];
    const savedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
    if (savedGoals) {
      try {
        const parsed = JSON.parse(savedGoals);
        if (isStringArray(parsed)) {
          loadedGoals = parsed;
        } else {
          localStorage.removeItem(GOALS_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(GOALS_STORAGE_KEY);
      }
    }
    setGoals(fitGoals(loadedGoals, loadedParticipants.length));
    // 表示方式（一括表示／1人ずつ）の復元
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (savedMode === 'batch' || savedMode === 'one') {
      setRevealMode(savedMode);
    }
    // 演出時間の復元
    const savedDuration = localStorage.getItem(DURATION_STORAGE_KEY);
    if (savedDuration && (DURATION_OPTIONS as readonly string[]).includes(savedDuration)) {
      setDuration(savedDuration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /** はしごを破棄して入力編集中の状態へ戻す（覗き見後の編集によるイカサマ防止） */
  const resetRound = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('idle');
    setLadder(null);
    setTraces(null);
    setAssignedGoals(null);
    setRevealed([]);
    setConfirmed([]);
    setAnnounced('');
  };

  const updateParticipants = (next: string[]) => {
    setParticipants(next);
    localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(next));
    // ゴール欄も参加者数に追随させる（増えた分はハズレで埋める）
    const nextGoals = fitGoals(goals, next.length);
    setGoals(nextGoals);
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(nextGoals));
    setCountError(false);
    resetRound();
  };

  /** 参加者一覧になまえを追加する */
  const addParticipant = () => {
    if (activeTab === 'single') {
      const name = singleInput.trim();
      if (!name) return;
      if (participants.includes(name)) {
        if (!confirm(t.confirmDuplicate(name))) return;
      }
      updateParticipants([...participants, name]);
      setSingleInput('');
    } else {
      const newNames = multiInput
        .split('\n')
        // 1名入力の maxLength と同じ上限を適用（超過分は入力欄と同様に切り詰める）
        .map((w) => w.trim().slice(0, MAX_NAME_LENGTH))
        .filter((w) => w.length > 0);
      const next = [...participants];
      newNames.forEach((name) => {
        if (!next.includes(name)) {
          next.push(name);
        } else {
          if (confirm(t.confirmDuplicate(name))) {
            next.push(name);
          }
        }
      });
      updateParticipants(next);
      setMultiInput('');
    }
  };

  const removeParticipant = (index: number) => {
    const next = [...participants];
    next.splice(index, 1);
    updateParticipants(next);
  };

  /** ゴール（結果のことば）1欄の変更と localStorage 保存。編集したらはしごは作り直し */
  const changeGoal = (index: number, value: string) => {
    const next = [...goals];
    next[index] = value;
    setGoals(next);
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(next));
    if (phase !== 'idle') resetRound();
  };

  /** 表示方式（一括表示／1人ずつ）を切り替える（はしごは維持される） */
  const changeRevealMode = (mode: RevealMode) => {
    setRevealMode(mode);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  };

  /** 演出時間の変更と localStorage 保存 */
  const changeDuration = (value: string) => {
    setDuration(value);
    localStorage.setItem(DURATION_STORAGE_KEY, value);
  };

  /** あみだくじを作成する（スタート／作り直す） */
  const startLadder = () => {
    if (validateParticipantCount(participants.length).length > 0) {
      setCountError(true);
      return;
    }
    setCountError(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    // 空欄は「1, 2, 3…」の連番で補完する
    const nextGoals = normalizeGoals(goals, participants.length);
    const nextLadder = generateLadder(participants.length);
    setLadder(nextLadder);
    setTraces(traceAll(nextLadder));
    setAssignedGoals(nextGoals);
    setRevealed([]);
    setConfirmed([]);
    setAnnounced('');
    setPhase('ready');
  };

  /** 演出時間（秒）。OS の「視差効果を減らす」設定時はアニメーションを行わない */
  const effectiveDuration = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reduceMotion ? 0 : Number(duration);
  };

  /** 参加者 index の結果ペア文字列を返す */
  const pairText = (index: number) => {
    if (!traces || !assignedGoals) return '';
    return t.resultPair(participants[index], assignedGoals[traces[index].goalIndex]);
  };

  /** 全員分の結果サマリ（参加者順） */
  const summaryText = () => participants.map((_, i) => pairText(i)).join(t.pairSeparator);

  /** 一括表示：未確定の全員の経路を一斉になぞって結果を確定する */
  const revealAll = () => {
    if (phase !== 'ready' || !traces) return;
    const all = participants.map((_, i) => i);
    const sec = effectiveDuration();
    setTraceDuration(sec);
    setRevealed(all);
    const finalize = () => {
      setConfirmed(all);
      setPhase('revealed');
      setAnnounced(t.shareText(summaryText()));
    };
    if (sec === 0) {
      finalize();
    } else {
      setPhase('revealing');
      timerRef.current = setTimeout(finalize, sec * 1000 + 100);
    }
  };

  /** 1人ずつ：選んだ参加者の経路をなぞって結果を確定する */
  const revealOne = (index: number) => {
    if (phase !== 'ready' || !traces || revealed.includes(index)) return;
    const sec = effectiveDuration();
    setTraceDuration(sec);
    setRevealed((prev) => [...prev, index]);
    const finalize = () => {
      setConfirmed((prev) => {
        const next = [...prev, index];
        setPhase(next.length === participants.length ? 'revealed' : 'ready');
        return next;
      });
      setAnnounced(
        t.statusOne(participants[index], assignedGoals?.[traces[index].goalIndex] ?? '')
      );
    };
    if (sec === 0) {
      finalize();
    } else {
      setPhase('revealing');
      timerRef.current = setTimeout(finalize, sec * 1000 + 100);
    }
  };

  /** 参加者とゴールをすべて削除する */
  const resetAll = () => {
    if (confirm(t.confirmReset)) {
      setParticipants([]);
      setGoals([]);
      localStorage.removeItem(PARTICIPANTS_STORAGE_KEY);
      localStorage.removeItem(GOALS_STORAGE_KEY);
      setCountError(false);
      resetRound();
    }
  };

  const revealing = phase === 'revealing';
  // 下ラベル：結果が確定した参加者の到達列だけゴールを公開し、それ以外は「?」で伏せる
  const goalLabels =
    assignedGoals && traces
      ? assignedGoals.map((goal, col) =>
          confirmed.some((i) => traces[i].goalIndex === col) ? goal : '?'
        )
      : null;

  return (
    <>
      {/* 結果の表示方式（一括表示／1人ずつ）切替タブ */}
      <div className="mode-tabs" role="group" aria-label={t.modeTabsLabel}>
        <button
          className={`mode-tab${revealMode === 'batch' ? ' active' : ''}`}
          disabled={revealing}
          onClick={() => changeRevealMode('batch')}
        >
          {t.modeBatch}
        </button>
        <button
          className={`mode-tab${revealMode === 'one' ? ' active' : ''}`}
          disabled={revealing}
          onClick={() => changeRevealMode('one')}
        >
          {t.modeOne}
        </button>
      </div>

      {/* 参加者ピッカー（1人ずつモード・はしご生成後のみ）。SVG の縦線位置と grid で整列させる */}
      {revealMode === 'one' && phase !== 'idle' && (
        <>
          <p className="amida-pick-hint">{t.pickHint}</p>
          <div
            className="amida-pickers"
            // はしご（.amida-wrap）と同じ上限幅・列数にして、各ボタンを縦線の真上に揃える
            style={{
              '--cols': participants.length,
              maxWidth: `min(var(--panel), ${participants.length * 90}px)`,
            } as React.CSSProperties}
          >
            {participants.map((name, i) => (
              <button
                key={`${name}-${i}`}
                title={name}
                disabled={revealing || revealed.includes(i)}
                onClick={() => revealOne(i)}
              >
                {name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* はしご（SVG）。結果はこの下の結果一覧と通知領域で読み上げるため装飾扱い */}
      <AmidakujiLadderView
        ladder={ladder}
        traces={traces}
        revealed={revealed}
        durationSec={traceDuration}
        participants={participants}
        goalLabels={goalLabels}
        emptyText={t.ladderEmptyText}
      />

      {/* スクリーンリーダー向け通知：確定した結果だけを1回読み上げる（演出中は更新しない） */}
      <div role="status" aria-live="polite" aria-atomic="true" className="visually-hidden">
        {announced}
      </div>

      {/* 結果一覧（確定順。省略なしのフルネームで表示） */}
      <div className="amida-results" data-placeholder={t.resultsPlaceholder}>
        {confirmed.length > 0 && (
          <ul>
            {confirmed.map((i) => (
              <li key={i}>{pairText(i)}</li>
            ))}
          </ul>
        )}
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

      {/* なまえ入力エリア */}
      <div className="input-area">
        {/* なまえ入力モード */}
        <div className={`tab-content${activeTab === 'single' ? '' : ' hidden'}`}>
          <input
            id="nameInput"
            maxLength={MAX_NAME_LENGTH}
            placeholder={t.singlePlaceholder}
            value={singleInput}
            onChange={(e) => setSingleInput(e.target.value)}
            onKeyDown={(e) => {
              // IME の変換確定 Enter では追加しない。
              // isComposing … Chrome/Firefox（macOS）は変換確定も key==='Enter' で発火するため除外
              // keyCode 229 … Safari は compositionend 後に isComposing=false で発火するため併用
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addParticipant();
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

        {/* 追加＆スタート系ボタン */}
        <div className="button-row">
          <button onClick={addParticipant}>{t.addButton}</button>
          <button disabled={revealing} onClick={startLadder}>
            {phase === 'idle' ? t.startButton : t.restartButton}
          </button>
          {revealMode === 'batch' && phase !== 'idle' && phase !== 'revealed' && (
            <button disabled={revealing} onClick={revealAll}>
              {revealing ? t.revealingButton : t.revealButton}
            </button>
          )}
        </div>
      </div>

      {/* 参加者数エラー */}
      {countError && <p className="amida-error">{t.countError}</p>}

      {/* ゴール（結果のことば）入力。参加者の数だけ欄が並び、既定はアタリ×1 + 残りハズレ */}
      {participants.length > 0 && (
        <div className="goals-area">
          <span className="goals-label" id="goalsLabel">{t.goalsLabel}</span>
          <div className="goal-inputs" role="group" aria-labelledby="goalsLabel">
            {goals.map((goal, i) => (
              <input
                key={i}
                maxLength={MAX_NAME_LENGTH}
                aria-label={t.goalFieldLabel(i + 1)}
                value={goal}
                onChange={(e) => changeGoal(i, e.target.value)}
              />
            ))}
          </div>
          <p className="goals-hint">{t.goalsHint}</p>
        </div>
      )}

      {/* 演出時間セレクト（選択は localStorage に保存され次回も復元される） */}
      <div className={`duration-controls${participants.length === 0 ? ' hidden' : ''}`}>
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

      {/* 参加者一覧 */}
      <div className="word-list">
        {participants.map((name, index) => (
          <div className="word-tag" key={`${name}-${index}`}>
            {name}
            <button onClick={() => removeParticipant(index)}>×</button>
          </div>
        ))}
      </div>

      {/* リセットボタン */}
      <div className="reset-area">
        <button className={participants.length === 0 ? 'hidden' : ''} onClick={resetAll}>
          {t.resetButton}
        </button>
      </div>

      {/* SNSシェア（全員の結果確定後に有効化） */}
      <section aria-label={dict.share.resultSectionLabel}>
        <ShareButtons
          locale={locale}
          text={phase === 'revealed' ? t.shareText(summaryText()) : ''}
          hashtags={t.hashtags}
          disabled={phase !== 'revealed'}
        />
      </section>
    </>
  );
}
