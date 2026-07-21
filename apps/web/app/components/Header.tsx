'use client';

import { useEffect, useRef, useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLDivElement>(null);
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
          <a href="/">
            <img src="/assets/logo.png" alt="ゆるユーリ ロゴ" className="logo-img" width={480} height={320} />
          </a>
        </div>

        {/* PC表示用ヘッダーボタン */}
        <nav className="nav-desktop">
          <a href="/" className="nav-link">TOP</a>
          <a href="/tools/" className="nav-link">ツール一覧</a>
          <a href="https://yl-yuriy.com/" className="nav-link">ブログ</a>
        </nav>

        {/* スマホ表示用ハンバーガーボタン */}
        <div
          ref={hamburgerRef}
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </div>
      </div>

      {/* ハンバーガー内メニュー */}
      <nav ref={mobileNavRef} className={`nav-mobile${menuOpen ? ' show' : ''}`}>
        <button className="close-btn" onClick={() => setMenuOpen(false)}>&times;</button>
        <a href="/">TOP</a>
        <a href="/tools/">ツール一覧</a>
        <a href="https://yl-yuriy.com/">ブログ</a>
        <a href="/legal/privacy-policy/">プライバシーポリシー</a>
        <a href="/legal/terms-of-service/">利用規約</a>
        <a href="/contact/">お問い合わせ</a>
      </nav>
    </header>
  );
}
