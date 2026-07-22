'use client';

import { useEffect, useRef, useState } from 'react';
import { getDictionary, type Locale } from '../i18n';

type Props = {
  /** 表示言語（ボタンラベル・aria-label の辞書解決に使う） */
  locale: Locale;
  /** シェア本文（URL・ハッシュタグは含めない） */
  text: string;
  /** ハッシュタグ（「#」なしで指定） */
  hashtags?: string[];
  /** 結果が未確定のときなどに全ボタンを無効化する */
  disabled?: boolean;
};

/**
 * SNSシェアボタン（各ツール共通）。
 * X・LINE・リンクコピーに対応し、Web Share API が使える環境（主にスマホ）では
 * OS のネイティブ共有ボタンも表示する。
 */
export default function ShareButtons({ locale, text, hashtags = [], disabled = false }: Props) {
  const d = getDictionary(locale);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // navigator.share の有無はクライアントでのみ判定できる（静的エクスポートのため）
  useEffect(() => {
    setCanNativeShare(typeof navigator.share === 'function');
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  /** ハッシュタグを本文へ連結した全文（LINE・ネイティブ共有用） */
  const fullText = () => {
    const tags = hashtags.map((t) => `#${t}`).join(' ');
    return tags ? `${text}\n${tags}` : text;
  };

  const shareToX = () => {
    const params = new URLSearchParams({ text, url: location.href });
    if (hashtags.length > 0) params.set('hashtags', hashtags.join(','));
    window.open(`https://x.com/intent/post?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  const shareToLine = () => {
    const params = new URLSearchParams({ url: location.href, text: fullText() });
    window.open(
      `https://social-plugins.line.me/lineit/share?${params.toString()}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボード非対応環境では何もしない
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ text: fullText(), url: location.href });
    } catch {
      // ユーザーによるキャンセル等は無視する
    }
  };

  return (
    <div className="share-area">
      <button
        type="button"
        className="share-button share-x"
        aria-label={d.share.xAria}
        disabled={disabled}
        onClick={shareToX}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        {d.share.xLabel}
      </button>

      {/* LINE は利用実態のある言語のみ表示（辞書の showLine フラグで制御） */}
      {d.share.showLine && (
        <button
          type="button"
          className="share-button share-line"
          aria-label={d.share.lineAria}
          disabled={disabled}
          onClick={shareToLine}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3C6.5 3 2 6.6 2 11c0 2.9 1.9 5.4 4.8 6.9-.2.7-.7 2.4-.8 2.8 0 0-.1.4.2.6.3.1.5 0 .5 0 .7-.1 3.1-2 4.2-2.8.4.1.7.1 1.1.1 5.5 0 10-3.6 10-8s-4.5-8-10-8z" />
          </svg>
          {d.share.lineLabel}
        </button>
      )}

      <button
        type="button"
        className="share-button"
        aria-label={d.share.copyAria}
        disabled={disabled}
        onClick={copyLink}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z" />
        </svg>
        <span aria-live="polite">{copied ? d.share.copyDone : d.share.copyLabel}</span>
      </button>

      {canNativeShare && (
        <button
          type="button"
          className="share-button"
          aria-label={d.share.nativeAria}
          disabled={disabled}
          onClick={nativeShare}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
          </svg>
          {d.share.nativeLabel}
        </button>
      )}
    </div>
  );
}
