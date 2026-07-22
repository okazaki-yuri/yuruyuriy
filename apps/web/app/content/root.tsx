// ルートレイアウトの共通実体。
// Route Groups による言語別ルートレイアウト（app/(ja)/layout.tsx、将来の app/(en)/layout.tsx）は
// この RootDocument / buildRootMetadata / viewport を利用する薄いラッパーとして実装する。
import type { Metadata, Viewport } from 'next';
import type React from 'react';
import Footer from '../components/Footer';
import FontLinks from '../components/FontLinks';
import GoogleAnalytics from '../components/GoogleAnalytics';
import Header from '../components/Header';
import { getDictionary, type Locale } from '../i18n';
import { SITE_URL } from '../site';
import '../styles/style.css';
import '../styles/header-footer.css';

export function buildRootMetadata(locale: Locale): Metadata {
  const d = getDictionary(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      // 各ページは title に「ページ名」のみ設定すれば「ページ名 | ゆるユーリ」になる。
      // title 未設定のページ（トップなど）は default が使われる。
      default: d.meta.titleDefault,
      template: d.meta.titleTemplate,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ylyuriy_1st',
      creator: '@ylyuriy_1st',
    },
    icons: {
      icon: '/assets/favicon.ico',
      apple: '/assets/apple-touch-icon.png',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#f5f2ec',
};

export default function RootDocument({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <html lang={locale}>
      <body>
        <FontLinks />
        <Header locale={locale} />
        {children}
        <Footer locale={locale} />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
