import type { Metadata } from 'next';
import Script from 'next/script';
import Header from './components/Header';
import Footer from './components/Footer';
import './styles/style.css';
import './styles/header-footer.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://tools.yl-yuriy.com'),
  title: {
    // 各ページは title に「ページ名」のみ設定すれば「ページ名 | ゆるユーリ」になる。
    // title 未設定のページ（トップなど）は default が使われる。
    default: 'ゆるユーリ | かわいいWebツールを集めたサイト',
    template: '%s | ゆるユーリ',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ylyuriy_1st',
    creator: '@ylyuriy_1st',
  },
  icons: { icon: '/assets/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/*
          Googleフォント（React 19 が <head> へ巻き上げる）。
          M PLUS Rounded 1c は日本語対応フォントのため next/font での自ホスト化は
          巨大ファイルを丸ごと抱えることになり不利。Google CDN の unicode-range
          分割配信をそのまま活かしつつ、preconnect で接続確立を前倒しして高速化する。
          display=swap で FOIT（テキスト不可視）も回避済み。
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c&display=swap"
          rel="stylesheet"
        />
        <Header />
        {children}
        <Footer />
        {/* Google tag (gtag.js) */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-WP93BYLBD9" strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-WP93BYLBD9');
        `}</Script>
      </body>
    </html>
  );
}
