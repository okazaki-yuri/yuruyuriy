// ことばルーレットちゃんページの実体（メタデータ生成 + 本文）。
import type { Metadata } from 'next';
import JsonLd from '../../components/JsonLd';
import MultilineText from '../../components/MultilineText';
import { getDictionary, localizePath, type Locale } from '../../i18n';
import { SITE_URL, buildOpenGraph } from '../../site';
import WordRoulette from './WordRoulette';
import './roulette.css';

const PATH = '/tools/wordroulette-chan/';

export function buildWordRouletteMetadata(locale: Locale): Metadata {
  const d = getDictionary(locale);
  return {
    title: d.roulette.metaTitle,
    description: d.roulette.metaDescription,
    alternates: { canonical: localizePath(locale, PATH) },
    openGraph: buildOpenGraph({
      locale,
      title: d.roulette.ogTitle,
      description: d.roulette.ogDescription,
      path: localizePath(locale, PATH),
    }),
  };
}

export default function WordRouletteContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const url = `${SITE_URL}${localizePath(locale, PATH)}`;
  const appLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: d.roulette.name,
    url,
    description: d.roulette.ldDescription,
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
      { '@type': 'ListItem', position: 3, name: d.roulette.name, item: url },
    ],
  };

  // よくある質問（FAQ）。表示内容と構造化データ（FAQPage）は必ず一致させる。
  const faqs = d.roulette.faqs;
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
      <h1>{d.roulette.heading}</h1>

      {/* 検索意図に合わせたリード文（「単語ルーレット」をページ上部の本文に含める） */}
      <p className="tool-lead">
        {d.roulette.lead}
      </p>

      {/* 入力・抽選（インタラクティブ部分） */}
      <WordRoulette locale={locale} />

      {/* ツール概要 */}
      <div className="introduction-area">
        <h2>{d.roulette.aboutHeading}</h2>
        <p>
          <MultilineText lines={d.roulette.aboutLines} />
        </p>
      </div>

      {/* 利用シーン（関連する検索意図をカバー） */}
      <div className="introduction-area">
        <h2>{d.roulette.usecaseHeading}</h2>
        <ul className="usecase-list">
          {d.roulette.usecases.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {/* ツール説明 */}
      <div className="howto-area">
        <h2>{d.roulette.howtoHeading}</h2>
        <ul>
          {d.roulette.howtoItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li>
            {d.roulette.howtoTermsItem.pre}
            <a href={localizePath(locale, '/legal/terms-of-service/')}>{d.roulette.howtoTermsItem.linkText}</a>
            {d.roulette.howtoTermsItem.post}
          </li>
        </ul>
      </div>

      {/* よくある質問（FAQ） */}
      <div className="faq-area">
        <h2>{d.roulette.faqHeading}</h2>
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
