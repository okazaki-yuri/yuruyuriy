// プライバシーポリシー（英語版）。法務ページは本文をロケール別ファイルとして保持する（辞書化しない）。
// 日本語版（app/(ja)/legal/privacy-policy/page.tsx）が正文。相違がある場合は日本語版が優先する
// 旨を Language セクションで明記している。日本語版を改定したら本ページも追随させること。
import type { Metadata } from 'next';
import { SITE_URL, buildAlternates, buildOpenGraph } from '../../../../site';
import JsonLd from '../../../../components/JsonLd';
import '../../../../content/legal.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for Ylyuriy. Explains how we handle personal information, analytics, and local storage.',
  alternates: buildAlternates('en', '/legal/privacy-policy/'),
  openGraph: buildOpenGraph({
    locale: 'en',
    title: 'Privacy Policy | Ylyuriy',
    description:
      'Privacy Policy for Ylyuriy. Explains how we handle personal information, analytics, and local storage.',
    path: '/en/legal/privacy-policy/',
  }),
};

export default function PrivacyPolicyPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en/` },
      { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${SITE_URL}/en/legal/privacy-policy/` },
    ],
  };

  return (
    <main className="legal-container">
      <JsonLd data={breadcrumbLd} />
      <h1>Privacy Policy</h1>

      <section>
        <h2>1. Collection of Personal Information</h2>
        <p>
          On this site (&quot;Ylyuriy&quot;), we may collect personal information such as your email address through
          our contact form. This information is used only to respond to inquiries and to contact you when necessary.
        </p>
      </section>

      <section>
        <h2>2. How We Use Personal Information</h2>
        <p>
          Collected personal information is used for the following purposes:
        </p>
        <ul>
          <li>Responding to inquiries</li>
          <li>Contacting you at your request</li>
          <li>Important notices about site operations</li>
        </ul>
      </section>

      <section>
        <h2>3. Sharing with Third Parties</h2>
        <p>
          We do not disclose or provide personal information to third parties, except as required by law.
        </p>
      </section>

      <section>
        <h2>4. Analytics and External Services</h2>
        <p>
          This site may use analytics tools such as Google Analytics to understand how the site is used. These tools
          may collect anonymous information using cookies. You can disable cookies in your browser settings.
        </p>
        <p>
          We also use Google Forms for inquiries. Information entered into Google Forms is managed in accordance with
          Google&apos;s <a href="https://policies.google.com/privacy?hl=en" target="_blank" rel="noopener">Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2>5. Local Storage</h2>
        <p>
          Some of the tools on this site use your browser&apos;s local storage to improve convenience.
          The stored data consists of your settings and inputs, and contains no personally identifiable information.
        </p>
      </section>

      <section>
        <h2>6. External Links</h2>
        <p>
          This site may contain links to external sites. Please note that we are not responsible for the handling of
          personal information on linked sites.
        </p>
      </section>

      <section>
        <h2>7. Changes to This Policy</h2>
        <p>
          This Privacy Policy may be updated as needed. The latest version is always available on this page.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>
          For questions about this policy, please reach us via the <a href="/en/contact/">contact page</a>.
        </p>
      </section>

      <section>
        <h2>9. Language</h2>
        <p>
          This Privacy Policy is provided in Japanese and English.
          The <a href="/legal/privacy-policy/">Japanese version</a> is the authoritative text; in the event of any
          discrepancy between the two versions, the Japanese version prevails.
        </p>
      </section>
    </main>
  );
}
