'use client';

import { useEffect, useRef, useState } from 'react';
import { getDictionary, localizePath, type Locale } from '../i18n';

export default function Header({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        hamburgerRef.current && !hamburgerRef.current.contains(target) &&
        mobileNavRef.current && !mobileNavRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="logo-area">
          {/* ヘッダーに表示するロゴ */}
          <a href={localizePath(locale, '/')}>
            <img src="/assets/logo.png" alt={d.header.logoAlt} className="logo-img" width={480} height={320} />
          </a>
        </div>

        {/* PC表示用ヘッダーボタン */}
        <nav className="nav-desktop">
          <a href={localizePath(locale, '/')} className="nav-link">{d.nav.top}</a>
          <a href={localizePath(locale, '/tools/')} className="nav-link">{d.nav.tools}</a>
          <a href="https://yl-yuriy.com/" className="nav-link">{d.nav.blog}</a>
        </nav>

        {/* スマホ表示用ハンバーガーボタン（スマホのスクリーンリーダー向けに button で公開する） */}
        <button
          type="button"
          ref={hamburgerRef}
          className={`hamburger${menuOpen ? ' open' : ''}`}
          aria-label={d.header.menuLabel}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      {/* ハンバーガー内メニュー */}
      <nav id="mobile-nav" ref={mobileNavRef} className={`nav-mobile${menuOpen ? ' show' : ''}`}>
        <button type="button" className="close-btn" aria-label={d.header.menuCloseLabel} onClick={() => setMenuOpen(false)}>&times;</button>
        <a href={localizePath(locale, '/')}>{d.nav.top}</a>
        <a href={localizePath(locale, '/tools/')}>{d.nav.tools}</a>
        <a href="https://yl-yuriy.com/">{d.nav.blog}</a>
        <a href={localizePath(locale, '/legal/privacy-policy/')}>{d.nav.privacy}</a>
        <a href={localizePath(locale, '/legal/terms-of-service/')}>{d.nav.terms}</a>
        <a href={localizePath(locale, '/contact/')}>{d.nav.contact}</a>
      </nav>
    </header>
  );
}
