import type { Metadata } from 'next';
import { SITE_URL, buildOpenGraph } from '../../../site';
import JsonLd from '../../../components/JsonLd';
import '../legal.css';

export const metadata: Metadata = {
  title: '利用規約',
  description:
    'ゆるユーリの利用規約です。ツールの利用条件（動画・ブログでの利用や収益化もOK）、禁止事項、著作権について説明しています。',
  alternates: { canonical: '/legal/terms-of-service/' },
  openGraph: buildOpenGraph({
    locale: 'ja',
    title: '利用規約 | ゆるユーリ',
    description:
      'ゆるユーリの利用規約です。ツールの利用条件（動画・ブログでの利用や収益化もOK）、禁止事項、著作権について説明しています。',
    path: '/legal/terms-of-service/',
  }),
};

export default function TermsOfServicePage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '利用規約', item: `${SITE_URL}/legal/terms-of-service/` },
    ],
  };

  return (
    <main className="legal-container">
      <JsonLd data={breadcrumbLd} />
      <h1>利用規約</h1>

      <section>
        <h2>当サイトについて</h2>
        <p>
          このサイトは、個人の趣味で制作・公開しているものです。<br />
          提供しているツールやコンテンツは、どなたでも自由にご利用いただけます。
        </p>
      </section>

      <section>
        <h2>ご利用にあたって</h2>
        <ul>
          <li>当サイトのツールや画面は、YouTubeやブログなどに自由に使っていただいて構いません。</li>
          <li>収益化を目的とした利用もOKです。</li>
          <li>連絡や許可も不要です。出典としてサイト名を紹介いただけると嬉しいです（任意）。</li>
        </ul>
      </section>

      <section>
        <h2>教育機関でのご利用について</h2>
        <p>
          学校や塾などの教育機関でも、当サイトのツールをご自由にご活用いただいて構いません。<br />
          授業の中での利用、教材への組み込み、指導の補助など、さまざまな場面でご利用ください。<br />
          特別な申請や許可は不要です。
        </p>
      </section>

      <section>
        <h2>禁止事項</h2>
        <p>
          サイトの健全な運営のため、以下のような行為はご遠慮ください。
        </p>
        <ul>
          <li>不正アクセスや過度な負荷をかける行為</li>
          <li>コンテンツやソースコードの無断転載・再配布</li>
          <li>他の利用者や第三者に迷惑をかける行為</li>
        </ul>
      </section>

      <section>
        <h2>ツールやコンテンツについて</h2>
        <ul>
          <li>できるだけ正確に動作するように心がけていますが、内容や結果を保証するものではありません。</li>
          <li>不具合については<a href="/contact/">こちら</a>で報告いただけると助かります。</li>
          <li>万が一の不具合やデータの消失、利用によって生じた損害などについては、責任を負いかねますのでご了承ください。</li>
          <li>ツールの動作や仕様は予告なく変更・停止する場合があります。</li>
        </ul>
      </section>

      <section>
        <h2>著作権など</h2>
        <p>
          サイト内の文章・画像・ツールなどのコンテンツは、運営者または正当な権利者に帰属します。<br />
          無断での転載や再配布はお控えください。<br />
          ※ツールやコンテンツを利用した動画・ブログでの収益化は自由ですが、サイト名やロゴなどを使用しての商用展開（商品販売、アプリ名への使用など）はご遠慮ください。
        </p>
      </section>

      <section>
        <h2>外部サービスについて</h2>
        <p>
          一部の機能（例：<a href="/contact/">お問い合わせページ</a>など）では、GoogleフォームやX（旧Twitter）などの外部サービスを利用しています。<br />
          それらのサービスのプライバシーや利用条件については、各サービス提供元の方針をご確認ください。
        </p>
      </section>

      <section>
        <h2>その他</h2>
        <p>
          本利用規約は、必要に応じて内容を見直す場合があります。<br />
          最新の内容はこのページにてご確認ください。
        </p>
      </section>

      <p style={{ marginTop: '2em', fontSize: '0.9em', color: '#666' }}>
        （2026年7月22日更新）
      </p>
    </main>
  );
}
