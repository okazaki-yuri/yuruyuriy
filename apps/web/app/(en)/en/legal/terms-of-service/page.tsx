// 利用規約（英語版）。法務ページは本文をロケール別ファイルとして保持する（辞書化しない）。
// 日本語版（app/(ja)/legal/terms-of-service/page.tsx）が正文。相違がある場合は日本語版が優先する
// 旨を Language セクションで明記している。日本語版を改定したら本ページも追随させること。
import type { Metadata } from 'next';
import { SITE_URL, buildOpenGraph } from '../../../../site';
import JsonLd from '../../../../components/JsonLd';
import '../../../../content/legal.css';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service for Ylyuriy. Explains the usage terms for our tools (use in videos and blogs, including monetized content, is OK), prohibited actions, and copyright.',
  alternates: { canonical: '/en/legal/terms-of-service/' },
  openGraph: buildOpenGraph({
    locale: 'en',
    title: 'Terms of Service | Ylyuriy',
    description:
      'Terms of Service for Ylyuriy. Explains the usage terms for our tools (use in videos and blogs, including monetized content, is OK), prohibited actions, and copyright.',
    path: '/en/legal/terms-of-service/',
  }),
};

export default function TermsOfServicePage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en/` },
      { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: `${SITE_URL}/en/legal/terms-of-service/` },
    ],
  };

  return (
    <main className="legal-container">
      <JsonLd data={breadcrumbLd} />
      <h1>Terms of Service</h1>

      <section>
        <h2>About This Site</h2>
        <p>
          This site is created and run as a personal hobby.<br />
          Anyone is free to use the tools and content we provide.
        </p>
      </section>

      <section>
        <h2>Using Our Tools</h2>
        <ul>
          <li>You are welcome to feature our tools and screens in YouTube videos, blogs, and similar content.</li>
          <li>Monetized use is also OK.</li>
          <li>No prior contact or permission is needed. Crediting the site name as your source is appreciated (optional).</li>
        </ul>
      </section>

      <section>
        <h2>Use in Educational Settings</h2>
        <p>
          Schools, cram schools, and other educational institutions are welcome to use our tools freely.<br />
          Use them in classes, incorporate them into teaching materials, or use them as teaching aids.<br />
          No application or permission is required.
        </p>
      </section>

      <section>
        <h2>Prohibited Actions</h2>
        <p>
          To keep the site running smoothly, please refrain from the following:
        </p>
        <ul>
          <li>Unauthorized access or placing excessive load on the site</li>
          <li>Reproducing or redistributing our content or source code without permission</li>
          <li>Actions that trouble other users or third parties</li>
        </ul>
      </section>

      <section>
        <h2>About the Tools and Content</h2>
        <ul>
          <li>We strive for accuracy, but we do not guarantee the content or results.</li>
          <li>If you find a bug, we would appreciate a report via the <a href="/en/contact/">contact page</a>.</li>
          <li>We are not liable for any bugs, data loss, or damages arising from use of the site.</li>
          <li>Tools and their specifications may change or be discontinued without notice.</li>
        </ul>
      </section>

      <section>
        <h2>Copyright</h2>
        <p>
          The content on this site — text, images, tools, and more — belongs to the site operator or its rightful owners.<br />
          Please do not reproduce or redistribute it without permission.<br />
          * Monetizing videos or blogs that use our tools is fine, but please refrain from commercial uses of the site
          name or logo (such as selling merchandise or using them in app names).
        </p>
      </section>

      <section>
        <h2>Third-Party Services</h2>
        <p>
          Some features (e.g., the <a href="/en/contact/">contact page</a>) use external services such as Google Forms
          and X (formerly Twitter).<br />
          Please check each provider&apos;s policies for their privacy practices and terms of use.
        </p>
      </section>

      <section>
        <h2>Other</h2>
        <p>
          These terms may be revised as needed.<br />
          Please check this page for the latest version.
        </p>
      </section>

      <section>
        <h2>Language</h2>
        <p>
          These Terms of Service are provided in Japanese and English.
          The <a href="/legal/terms-of-service/">Japanese version</a> is the authoritative text; in the event of any
          discrepancy between the two versions, the Japanese version prevails.
        </p>
      </section>

      <p style={{ marginTop: '2em', fontSize: '0.9em', color: '#666' }}>
        (Last updated: July 23, 2026)
      </p>
    </main>
  );
}
