'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_LOCALE, LOCALES, LOCALE_NAMES, getDictionary, localizePath, type Locale } from '../i18n';

/** トレイリングスラッシュを保証する（next.config.js の trailingSlash: true と揃える） */
function withSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}

/** 現在パスからロケール接頭辞を除いた共通パスを得る（例: '/en/tools/' → '/tools/'） */
function basePathOf(locale: Locale, pathname: string): string {
  if (locale === DEFAULT_LOCALE) return withSlash(pathname);
  const stripped = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), '') || '/';
  return withSlash(stripped);
}

/**
 * 言語スイッチャー。現在ページの各言語版へ相互リンクする。
 * 対応ページが無い場合（未翻訳ページ等）は 404 になるが、現状は全ページ対で存在する。
 * - variant='dropdown': PC ヘッダー用。🌐 + 現在言語名のボタンで言語リストを開閉する
 * - variant='menu': モバイルメニュー用。全言語を通常のメニュー項目として並べる（現在言語は強調表示）
 */
export default function LanguageSwitcher({
  locale,
  variant,
}: {
  locale: Locale;
  variant: 'dropdown' | 'menu';
}) {
  const d = getDictionary(locale);
  const pathname = usePathname() ?? '/';
  const base = basePathOf(locale, pathname);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // ドロップダウン外クリック・Escape で閉じる
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (variant === 'menu') {
    return (
      <>
        {LOCALES.map((l) => (
          <a
            key={l}
            href={withSlash(localizePath(l, base))}
            hrefLang={l}
            rel={l === locale ? undefined : 'alternate'}
            aria-current={l === locale ? 'page' : undefined}
            className={l === locale ? 'lang-current' : undefined}
          >
            <span aria-hidden="true">🌐</span> {LOCALE_NAMES[l]}
          </a>
        ))}
      </>
    );
  }

  return (
    <div className="lang-switcher" ref={rootRef}>
      <button
        type="button"
        className="lang-switcher-button"
        aria-label={d.header.langSwitcherLabel}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">🌐</span> {LOCALE_NAMES[locale]} <span className="lang-caret" aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul className="lang-switcher-menu">
          {LOCALES.map((l) => (
            <li key={l}>
              <a
                href={withSlash(localizePath(l, base))}
                hrefLang={l}
                rel={l === locale ? undefined : 'alternate'}
                aria-current={l === locale ? 'page' : undefined}
                className={l === locale ? 'lang-current' : undefined}
              >
                {LOCALE_NAMES[l]}
                {l === locale && <span aria-hidden="true"> ✓</span>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
