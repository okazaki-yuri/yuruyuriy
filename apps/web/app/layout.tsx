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
        {/* Googleフォント（React 19 が <head> へ巻き上げる） */}
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
