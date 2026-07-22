// WEBサイコロちゃんページの実体（メタデータ生成 + 本文）。
import type { Metadata } from 'next';
import JsonLd from '../../components/JsonLd';
import MultilineText from '../../components/MultilineText';
import { getDictionary, localizePath, type Locale } from '../../i18n';
import { SITE_URL, buildAlternates, buildOpenGraph } from '../../site';
import WebDice from './WebDice';
import './dice.css';

const PATH = '/tools/web-dice-chan/';

export function buildWebDiceMetadata(locale: Locale): Metadata {
  const d = getDictionary(locale);
  return {
    title: d.dice.metaTitle,
    description: d.dice.metaDescription,
    alternates: buildAlternates(locale, PATH),
    openGraph: buildOpenGraph({
      locale,
      title: d.dice.ogTitle,
      description: d.dice.ogDescription,
      path: localizePath(locale, PATH),
    }),
  };
}

export default function WebDiceContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const url = `${SITE_URL}${localizePath(locale, PATH)}`;
  const appLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: d.dice.name,
    url,
    description: d.dice.ldDescription,
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
      { '@type': 'ListItem', position: 3, name: d.dice.name, item: url },
    ],
  };

  // よくある質問（FAQ）。表示内容と構造化データ（FAQPage）は必ず一致させる。
  const faqs = d.dice.faqs;
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
      <h1>{d.dice.heading}</h1>

      {/* 検索意図に合わせたリード文（「オンラインサイコロ」をページ上部の本文に含める） */}
      <p className="tool-lead">
        {d.dice.lead}
      </p>

      {/* 入力・抽選・履歴（インタラクティブ部分） */}
      <WebDice locale={locale} />

      {/* ツール概要 */}
      <div className="introduction-area">
        <h2>{d.dice.aboutHeading}</h2>
        <p>
          <MultilineText lines={d.dice.aboutLines} />
        </p>
      </div>

      {/* 利用シーン（関連する検索意図をカバー） */}
      <div className="introduction-area">
        <h2>{d.dice.usecaseHeading}</h2>
        <ul className="usecase-list">
          {d.dice.usecases.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {/* ツール説明 */}
      <div className="howto-area">
        <h2>{d.dice.howtoHeading}</h2>
        {/* 手順（番号付き）と補足事項（箇条書き）を分けて記載する */}
        <ol>
          {d.dice.howtoSteps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <ul>
          {d.dice.howtoNotes.map((item) => (
            <li key={item}>{item}</li>
          ))}
          <li>
            {d.dice.howtoTermsItem.pre}
            <a href={localizePath(locale, '/legal/terms-of-service/')}>{d.dice.howtoTermsItem.linkText}</a>
            {d.dice.howtoTermsItem.post}
          </li>
        </ul>
      </div>

      {/* よくある質問（FAQ） */}
      <div className="faq-area">
        <h2>{d.dice.faqHeading}</h2>
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
