// お問い合わせページの実体（メタデータ生成 + 本文）。
import type { Metadata } from 'next';
import JsonLd from '../components/JsonLd';
import { getDictionary, localizePath, type Locale } from '../i18n';
import { SITE_URL, buildAlternates, buildOpenGraph } from '../site';
import './contact.css';

export function buildContactMetadata(locale: Locale): Metadata {
  const d = getDictionary(locale);
  return {
    title: d.contact.metaTitle,
    description: d.contact.metaDescription,
    alternates: buildAlternates(locale, '/contact/'),
    openGraph: buildOpenGraph({
      locale,
      title: d.contact.ogTitle,
      description: d.contact.metaDescription,
      path: localizePath(locale, '/contact/'),
    }),
  };
}

export default function ContactContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: d.breadcrumb.home, item: `${SITE_URL}${localizePath(locale, '/')}` },
      { '@type': 'ListItem', position: 2, name: d.contact.name, item: `${SITE_URL}${localizePath(locale, '/contact/')}` },
    ],
  };

  return (
    <main className="contact-main">
      <JsonLd data={breadcrumbLd} />
      <section className="contact-section">
        <h1 className="contact-title">{d.contact.heading}</h1>
        <p className="contact-intro">
          {d.contact.intro}
        </p>

        {/* Googleフォーム */}
        <div className="contact-button-area">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdWn52hSQqIBgHuh97WNb-mB5UVEX43cqagjLSARZoLRhEAOw/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-button"
          >
            {d.contact.formButton}
          </a>
        </div>

        {/* お問い合わせ先一覧 */}
        <p className="contact-sub">
          {d.contact.sub}
        </p>
        <ul className="contact-list">
          <li><a href="mailto:info@tools.yl-yuriy.com">info@tools.yl-yuriy.com</a></li>
          <li><a href="https://x.com/ylyuriy_1st" target="_blank" rel="noopener noreferrer">{d.contact.xLinkLabel}</a></li>
        </ul>
      </section>
    </main>
  );
}
