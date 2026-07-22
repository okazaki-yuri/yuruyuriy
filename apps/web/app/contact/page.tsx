import type { Metadata } from 'next';
import { SITE_URL, buildOpenGraph } from '../site';
import JsonLd from '../components/JsonLd';
import './contact.css';

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description:
    'ゆるユーリへのお問い合わせ方法のご案内です。Googleフォーム・メール・X（旧Twitter）のDMで受け付けています。',
  alternates: { canonical: '/contact/' },
  openGraph: buildOpenGraph({
    title: 'ゆるユーリ | お問い合わせ',
    description:
      'ゆるユーリへのお問い合わせ方法のご案内です。Googleフォーム・メール・X（旧Twitter）のDMで受け付けています。',
    path: '/contact/',
  }),
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
