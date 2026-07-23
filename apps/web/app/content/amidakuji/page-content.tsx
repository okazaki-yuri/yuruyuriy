// あみだくじちゃんページの実体（メタデータ生成 + 本文）。
import type { Metadata } from 'next';
import JsonLd from '../../components/JsonLd';
import MultilineText from '../../components/MultilineText';
import { getDictionary, localizePath, type Locale } from '../../i18n';
import { SITE_URL, buildAlternates, buildOpenGraph } from '../../site';
import Amidakuji from './Amidakuji';
import './amidakuji.css';

const PATH = '/tools/amidakuji-chan/';

export function buildAmidakujiMetadata(locale: Locale): Metadata {
  const d = getDictionary(locale);
  return {
    title: d.amidakuji.metaTitle,
    description: d.amidakuji.metaDescription,
    alternates: buildAlternates(locale, PATH),
    openGraph: buildOpenGraph({
      locale,
      title: d.amidakuji.ogTitle,
      description: d.amidakuji.ogDescription,
      path: localizePath(locale, PATH),
    }),
  };
}

export default function AmidakujiContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const url = `${SITE_URL}${localizePath(locale, PATH)}`;
  const appLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: d.amidakuji.name,
    url,
    description: d.amidakuji.ldDescription,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    inLanguage: locale,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
    publisher: { '@type': 'Organization', name: d.meta.siteName, url: SITE_URL },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: d.breadcrumb.home, item: `${SITE_URL}${localizePath(locale, '/')}` },
      { '@type': 'ListItem', position: 2, name: d.breadcrumb.tools, item: `${SITE_URL}${localizePath(locale, '/tools/')}` },
      { '@type': 'ListItem', position: 3, name: d.amidakuji.name, item: url },
    ],
  };

  // よくある質問（FAQ）。表示内容と構造化データ（FAQPage）は必ず一致させる。
  const faqs = d.amidakuji.faqs;
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <main>
      <JsonLd data={appLd} />
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={faqLd} />
      <h1>{d.amidakuji.heading}</h1>

      {/* 検索意図に合わせたリード文（「あみだくじ」をページ上部の本文に含める） */}
      <p className="tool-lead">
        {d.amidakuji.lead}
      </p>

      {/* 入力・くじ引き（インタラクティブ部分） */}
      <Amidakuji locale={locale} />

      {/* ツール概要 */}
      <div className="introduction-area">
        <h2>{d.amidakuji.aboutHeading}</h2>
        <p>
          <MultilineText lines={d.amidakuji.aboutLines} />
        </p>
      </div>

      {/* 利用シーン（関連する検索意図をカバー） */}
      <div className="introduction-area">
        <h2>{d.amidakuji.usecaseHeading}</h2>
        <ul className="usecase-list">
          {d.amidakuji.usecases.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {/* ツール説明 */}
      <div className="howto-area">
        <h2>{d.amidakuji.howtoHeading}</h2>
        <ul>
          {d.amidakuji.howtoItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li>
            {d.amidakuji.howtoTermsItem.pre}
            <a href={localizePath(locale, '/legal/terms-of-service/')}>{d.amidakuji.howtoTermsItem.linkText}</a>
            {d.amidakuji.howtoTermsItem.post}
          </li>
        </ul>
      </div>

      {/* よくある質問（FAQ） */}
      <div className="faq-area">
        <h2>{d.amidakuji.faqHeading}</h2>
        <dl>
          {faqs.map(({ q, a }) => (
            <div className="faq-item" key={q}>
              <dt>{q}</dt>
              <dd>{a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
