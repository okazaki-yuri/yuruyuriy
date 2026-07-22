import type { Metadata } from 'next';
import { SITE_URL, buildOpenGraph } from '../../site';
import JsonLd from '../../components/JsonLd';
import '../legal.css';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description:
    'ゆるユーリのプライバシーポリシーです。個人情報の取り扱い、アクセス解析やローカルストレージの利用について説明しています。',
  alternates: { canonical: '/legal/privacy-policy/' },
  openGraph: buildOpenGraph({
    title: 'ゆるユーリ | プライバシーポリシー',
    description:
      'ゆるユーリのプライバシーポリシーです。個人情報の取り扱い、アクセス解析やローカルストレージの利用について説明しています。',
    path: '/legal/privacy-policy/',
  }),
};

export default function PrivacyPolicyPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'プライバシーポリシー', item: `${SITE_URL}/legal/privacy-policy/` },
    ],
  };

  return (
    <main className="legal-container">
      <JsonLd data={breadcrumbLd} />
      <h1>プライバシーポリシー</h1>

      <section>
        <h2>1. 個人情報の収集について</h2>
        <p>
          当サイト「ゆるユーリ」では、お問い合わせフォームを通じて、メールアドレス等の個人情報を収集する場合があります。
          これらの情報は、お問い合わせへの対応および必要なご連絡のためにのみ使用します。
        </p>
      </section>

      <section>
        <h2>2. 個人情報の利用目的</h2>
        <p>
          収集した個人情報は、以下の目的で利用いたします。
        </p>
        <ul>
          <li>お問い合わせへの対応</li>
          <li>ご本人からの依頼に基づくご連絡</li>
          <li>サイト運営上の重要なお知らせ</li>
        </ul>
      </section>

      <section>
        <h2>3. 個人情報の第三者提供について</h2>
        <p>
          取得した個人情報は、法令に基づく場合を除き、第三者に開示・提供することはありません。
        </p>
      </section>

      <section>
        <h2>4. アクセス解析・外部サービスの利用</h2>
        <p>
          当サイトでは、サイトの利用状況を把握するために Google Analytics 等のアクセス解析ツールを使用する場合があります。これにより Cookie を使用して匿名の情報を収集することがあります。
          ユーザーはブラウザの設定により Cookie を無効にすることが可能です。
        </p>
        <p>
          また、お問い合わせには Google フォームを利用しています。Google フォームに入力された情報は Google が定める
          <a href="https://policies.google.com/privacy?hl=ja" target="_blank" rel="noopener">プライバシーポリシー</a> に従って管理されます。
        </p>
      </section>

      <section>
        <h2>5. ローカルストレージの利用について</h2>
        <p>
          当サイトで提供している一部のツールでは、ユーザーの利便性向上のため、ブラウザのローカルストレージを使用する場合があります。
          保存されるデータはユーザーの設定や入力内容などであり、個人を特定する情報は含まれていません。
        </p>
      </section>

      <section>
        <h2>6. 外部リンクについて</h2>
        <p>
          当サイトには外部サイトへのリンクが含まれることがあります。リンク先サイトにおける個人情報の取り扱いについては、当サイトでは責任を負いかねますのでご了承ください。
        </p>
      </section>

      <section>
        <h2>7. プライバシーポリシーの変更</h2>
        <p>
          本プライバシーポリシーは、必要に応じて内容を変更することがあります。最新の内容は当ページにて常にご確認いただけます。
        </p>
      </section>

      <section>
        <h2>8. お問い合わせ先</h2>
        <p>
          本ポリシーに関するお問い合わせは、<a href="/contact/">お問い合わせページ</a>からご連絡ください。
        </p>
      </section>
    </main>
  );
}
