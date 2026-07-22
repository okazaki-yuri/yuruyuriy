// トップページの実体（メタデータ生成 + 本文）。
// ルート（app/(ja)/page.tsx、将来の app/(en)/en/page.tsx）はこれを locale 指定で呼ぶ薄いラッパー。
import type { Metadata } from 'next';
import JsonLd from '../components/JsonLd';
import MultilineText from '../components/MultilineText';
import { getDictionary, localizePath, type Locale } from '../i18n';
import { SITE_URL, buildOpenGraph } from '../site';

export function buildHomeMetadata(locale: Locale): Metadata {
  const d = getDictionary(locale);
  return {
    // title はレイアウトの default を使用
    description: d.home.description,
    alternates: { canonical: localizePath(locale, '/') },
    openGraph: buildOpenGraph({
      locale,
      title: d.home.ogTitle,
      description: d.home.ogDescription,
      path: localizePath(locale, '/'),
    }),
  };
}

export default function HomeContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: d.meta.siteName,
    url: SITE_URL,
    description: d.home.description,
    inLanguage: locale,
    publisher: {
      '@type': 'Organization',
      name: d.meta.siteName,
      url: SITE_URL,
      logo: `${SITE_URL}/assets/logo.png`,
      sameAs: [
        'https://x.com/ylyuriy_1st',
        'https://www.instagram.com/ylyuriy_1st',
        'https://www.youtube.com/@ylyuriy',
      ],
    },
  };

  return (
    <main className="top-page">
      <JsonLd data={websiteLd} />
      <h1>{d.home.heading}</h1>

      {/* サイト説明 */}
      <section className="top-description">
        <img src="/assets/logo.png" alt={d.home.logoAlt} className="top-logo" width={480} height={320} />
        <p>
          <MultilineText lines={d.home.introLines} />
        </p>
      </section>

      {/* 各ページリンク */}
      <section className="top-section-links">
        {/* ツール一覧 */}
        <div className="top-link-box top-tool-box">
          <h2>{d.home.toolsBox.heading}</h2>
          <a href={localizePath(locale, '/tools/')} className="top-tool-link-button">{d.home.toolsBox.button}</a>
          <p>{d.home.toolsBox.text}</p>
        </div>
        <div className="top-link-box top-blog-box">
          <h2>{d.home.blogBox.heading}</h2>
          <a href="https://yl-yuriy.com/" target="_blank" className="top-blog-link-button">{d.home.blogBox.button}</a>
          <p>
            <MultilineText lines={d.home.blogBox.textLines} />
          </p>
        </div>
      </section>

      {/* 外部リンク */}
      <section className="external-links">
        <h2>{d.home.external.heading}</h2>
        <p>{d.home.external.text}</p>
        <div className="external-links-grid">
          <a href="https://x.com/ylyuriy_1st" target="_blank" rel="noopener" className="link-card">
            <div className="icon-area">
              <img src="/assets/x_icon.png" alt={d.home.external.xAlt} width={128} height={128} loading="lazy" />
            </div>
            <div className="text-area">
              <h3>{d.home.external.xName}</h3>
            </div>
          </a>
          <a href="https://www.instagram.com/ylyuriy_1st" target="_blank" rel="noopener" className="link-card">
            <div className="icon-area">
              <img src="/assets/instagram_icon.png" alt={d.home.external.instagramAlt} width={128} height={128} loading="lazy" />
            </div>
            <div className="text-area">
              <h3>{d.home.external.instagramName}</h3>
            </div>
          </a>
          <a href="https://www.youtube.com/@ylyuriy" target="_blank" rel="noopener" className="link-card">
            <div className="icon-area">
              <img src="/assets/youtube_icon.png" alt={d.home.external.youtubeAlt} width={128} height={128} loading="lazy" />
            </div>
            <div className="text-area">
              <h3>{d.home.external.youtubeName}</h3>
            </div>
          </a>
        </div>
      </section>
    </main>
  );
}
