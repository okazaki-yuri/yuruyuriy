import type { Metadata } from 'next';
import { OG_IMAGE } from '../og';
import JsonLd from '../components/JsonLd';
import './contact.css';

const SITE_URL = 'https://tools.yl-yuriy.com';

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: 'お問い合わせページです。',
  alternates: { canonical: '/contact/' },
  openGraph: {
    title: 'ゆるユーリ | お問い合わせ',
    description: 'お問い合わせはこちらから',
    url: 'https://tools.yl-yuriy.com/contact/',
    siteName: 'ゆるユーリ',
    images: [OG_IMAGE],
    type: 'website',
  },
};

export default function ContactPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'お問い合わせ', item: `${SITE_URL}/contact/` },
    ],
  };

  return (
    <main className="contact-main">
      <JsonLd data={breadcrumbLd} />
      <section className="contact-section">
        <h1 className="contact-title">お問い合わせ</h1>
        <p className="contact-intro">
          当サイトへのご連絡は、下記のGoogleフォームよりお願いいたします。
        </p>

        {/* Googleフォーム */}
        <div className="contact-button-area">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdWn52hSQqIBgHuh97WNb-mB5UVEX43cqagjLSARZoLRhEAOw/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-button"
          >
            Googleフォームへ
          </a>
        </div>

        {/* お問い合わせ先一覧 */}
        <p className="contact-sub">
          メール、またはXのDMでも受け付けています。
        </p>
        <ul className="contact-list">
          <li><a href="mailto:info@tools.yl-yuriy.com">info@tools.yl-yuriy.com</a></li>
          <li><a href="https://x.com/ylyuriy_1st" target="_blank" rel="noopener noreferrer">X（旧Twitter）</a></li>
        </ul>
      </section>
    </main>
  );
}
