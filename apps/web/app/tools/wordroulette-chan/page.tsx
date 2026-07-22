import type { Metadata } from 'next';
import { SITE_URL, buildOpenGraph } from '../../site';
import WordRoulette from './WordRoulette';
import JsonLd from '../../components/JsonLd';
import './roulette.css';

export const metadata: Metadata = {
  title: '単語ルーレット｜ことばルーレットちゃん',
  description:
    'ランダムに単語を1つ選ぶ無料の単語ルーレット。入力したことばの中から抽選します。お題決め・チーム分け・順番決め・罰ゲーム・英単語の学習などに。登録不要・スマホ対応。',
  alternates: { canonical: '/tools/wordroulette-chan/' },
  openGraph: buildOpenGraph({
    title: 'ゆるユーリ | 単語ルーレット（ことばルーレットちゃん）',
    description:
      'ランダムに単語を1つ選ぶ無料の単語ルーレット。入力したことばの中から抽選します。お題決め・チーム分け・順番決め・罰ゲームなどに。',
    path: '/tools/wordroulette-chan/',
  }),
};

export default function WordRoulettePage() {
  const url = `${SITE_URL}/tools/wordroulette-chan/`;
  const appLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ことばルーレットちゃん',
    url,
    description:
      '入力された単語の中からランダムに1つを表示する抽選ツールです。お題決めや、チーム分けなどで活用できます。',
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
      { '@type': 'ListItem', position: 3, name: 'ことばルーレットちゃん', item: url },
    ],
  };

  // よくある質問（FAQ）。表示内容と構造化データ（FAQPage）は必ず一致させる。
  const faqs = [
    {
      q: '単語ルーレットは無料で使えますか？',
      a: 'はい。登録不要・完全無料で、単語やことばを入力するだけでランダムに1つを抽選できます。',
    },
    {
      q: '入力した単語（ことば）は保存されますか？',
      a: '入力内容はお使いのブラウザ内に保存され、次回アクセス時も残ります。サーバーには送信されないため安心してご利用いただけます。',
    },
    {
      q: 'スマホでも使えますか？',
      a: 'はい。スマートフォン・タブレット・パソコンのブラウザで動作します。アプリのインストールは不要です。',
    },
    {
      q: 'どんな場面で使えますか？',
      a: 'ゲームのお題決め、チーム分け・グループ分け、順番決めや名前の抽選、罰ゲーム決め、英単語の学習など、さまざまなランダム抽選に使えます。',
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
      <h1>ことばルーレットちゃん</h1>

      {/* 検索意図に合わせたリード文（「単語ルーレット」をページ上部の本文に含める） */}
      <p className="tool-lead">
        「単語ルーレット」は、入力した単語やことばの中からランダムに1つを選ぶ無料の抽選ツールです。お題決め・チーム分け・順番決め・罰ゲームなどにお使いいただけます。
      </p>

      {/* 入力・抽選（インタラクティブ部分） */}
      <WordRoulette />

      {/* ツール概要 */}
      <div className="introduction-area">
        <h2>単語ルーレット「ことばルーレットちゃん」とは？</h2>
        <p>
          このツールは、入力した「単語（ことば）」の中からランダムに1つを選んで表示するシンプルな単語ルーレットです。<br />
          ゲームのお題決めや、チーム分け、順番決め、罰ゲーム決め、ちょっとした抽選など、さまざまなシーンで活用できます。
        </p>
      </div>

      {/* 利用シーン（関連する検索意図をカバー） */}
      <div className="introduction-area">
        <h2>こんな場面で使える単語ルーレット</h2>
        <ul className="usecase-list">
          <li>🎲 ゲームやトークの「お題決め」に</li>
          <li>👥 チーム分け・グループ分けに</li>
          <li>🔢 発表や順番決め・名前の抽選に</li>
          <li>😝 罰ゲームやペナルティ決めに</li>
          <li>📚 英単語や漢字など学習のランダム出題に</li>
          <li>🧊 会議・授業のアイスブレイクに</li>
        </ul>
      </div>

      {/* ツール説明 */}
      <div className="howto-area">
        <h2>📖 使い方ガイド</h2>
        <ul>
          <li>📝 「ことば入力モード」は1語ずつ登録できます（Enter または「追加」ボタン）。</li>
          <li>📋 「まとめて入力モード」は改行区切りで一括登録が可能です。</li>
          <li>⚠️ 同じ「ことば」があると確認ダイアログが表示されます。</li>
          <li>🎯 「ルーレット」でランダムに1語を選出します。</li>
          <li>🧹 「リセット」で登録された「ことば」をすべて削除します。</li>
          <li>🔀 「昇順／降順」切替で「ことば」の並び替えができます。</li>
          <li>🕒 「抽選時間」切替で演出の時間を調整できます。</li>
          <li>📄  その他詳細なご利用については<a href="/legal/terms-of-service/">利用規約</a>をご確認ください。</li>
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
