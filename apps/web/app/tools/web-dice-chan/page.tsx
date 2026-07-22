import type { Metadata } from 'next';
import { SITE_URL, buildOpenGraph } from '../../site';
import WebDice from './WebDice';
import JsonLd from '../../components/JsonLd';
import './dice.css';

export const metadata: Metadata = {
  title: 'オンラインサイコロ（WEBサイコロちゃん）',
  description:
    'ブラウザでサイコロを振れる無料のオンラインサイコロ。出目の範囲を0〜100で指定でき、最大30個を同時に振って合計・平均も表示。すごろく・TRPGのダイス・順番決めなどに。登録不要・スマホ対応。',
  alternates: { canonical: '/tools/web-dice-chan/' },
  openGraph: buildOpenGraph({
    title: 'オンラインサイコロ（WEBサイコロちゃん） | ゆるユーリ',
    description:
      'ブラウザでサイコロを振れる無料のオンラインサイコロ。出目の範囲指定・複数個の同時ロールに対応し、合計・平均も表示します。',
    path: '/tools/web-dice-chan/',
  }),
};

export default function WebDicePage() {
  const url = `${SITE_URL}/tools/web-dice-chan/`;
  const appLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'WEBサイコロちゃん',
    url,
    description:
      'ブラウザでサイコロを振れる無料のオンラインサイコロ。出目の範囲を0〜100で指定でき、最大30個を同時に振って合計・平均も表示します。',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    inLanguage: 'ja',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
    publisher: { '@type': 'Organization', name: 'ゆるユーリ', url: SITE_URL },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'ツール一覧', item: `${SITE_URL}/tools/` },
      { '@type': 'ListItem', position: 3, name: 'WEBサイコロちゃん', item: url },
    ],
  };

  // よくある質問（FAQ）。表示内容と構造化データ（FAQPage）は必ず一致させる。
  const faqs = [
    {
      q: 'オンラインサイコロは無料で使えますか？',
      a: 'はい。登録不要・完全無料で、ブラウザだけでサイコロを振ることができます。アプリのインストールも不要です。',
    },
    {
      q: '出目の範囲や個数は変えられますか？',
      a: '出目は0〜100の範囲で自由に指定でき、サイコロは最大30個まで同時に振れます。6面ダイスはもちろん、D10・D100のような使い方もできます。',
    },
    {
      q: '振った結果は保存されますか？',
      a: '履歴はお使いのブラウザ内に最大50件まで保存され、次回アクセス時も残ります。サーバーには送信されないため安心してご利用いただけます。',
    },
    {
      q: 'スマホでも使えますか？',
      a: 'はい。スマートフォン・タブレット・パソコンのブラウザで動作します。手元にサイコロがないときにその場ですぐ使えます。',
    },
  ];
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
      <h1>WEBサイコロちゃん</h1>

      {/* 検索意図に合わせたリード文（「オンラインサイコロ」をページ上部の本文に含める） */}
      <p className="tool-lead">
        「WEBサイコロちゃん」は、ブラウザでサイコロを振れる無料のオンラインサイコロです。出目の範囲や個数を指定して、すごろく・ボードゲーム・TRPGのダイスロール・順番決めなどにお使いいただけます。
      </p>

      {/* 入力・抽選・履歴（インタラクティブ部分） */}
      <WebDice />

      {/* ツール概要 */}
      <div className="introduction-area">
        <h2>オンラインサイコロ「WEBサイコロちゃん」とは？</h2>
        <p>
          このツールでは、好きな範囲の数字でサイコロを振ることができます。<br />
          サイコロの個数や演出時間を設定することもできます。<br />
          平均値・最大値・最小値なども表示されるので、ゲームや抽選に活用できます！
        </p>
      </div>

      {/* 利用シーン（関連する検索意図をカバー） */}
      <div className="introduction-area">
        <h2>こんな場面で使えるオンラインサイコロ</h2>
        <ul className="usecase-list">
          <li>🎲 すごろく・ボードゲームのサイコロ代わりに</li>
          <li>🐉 TRPGのダイスロールに（範囲指定でD10・D100などにも対応）</li>
          <li>🔢 順番決め・席決め・くじ引きに</li>
          <li>😝 罰ゲームやペナルティ決めに</li>
          <li>📚 確率の授業・実験や、乱数が欲しいときに</li>
          <li>✈️ 旅行やゲーム会でサイコロを忘れたときに</li>
        </ul>
      </div>

      {/* ツール説明 */}
      <div className="howto-area">
        <h2>📖 使い方ガイド</h2>
        <ul>
          <li>「サイコロの出目（最小値〜最大値）」に0〜100の数字を入力します。</li>
          <li>最小値が最大値より大きい場合は抽選できません。</li>
          <li>「サイコロの個数」は30まで指定できます。</li>
          <li>「演出時間」切替で演出の時間を調整できます。</li>
          <li>「サイコロを振る」ボタン押下で抽選開始です。</li>
          <li>2個以上のサイコロを振った場合は「合計」「平均」「最大」「最小」がそれぞれ表示されます。</li>
          <li>その他詳細なご利用については<a href="/legal/terms-of-service/">利用規約</a>をご確認ください。</li>
        </ul>
      </div>

      {/* よくある質問（FAQ） */}
      <div className="faq-area">
        <h2>❓ よくある質問</h2>
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
