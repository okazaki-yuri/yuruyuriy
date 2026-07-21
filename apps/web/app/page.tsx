import type { Metadata } from 'next';
import { SITE_URL, buildOpenGraph } from './site';
import JsonLd from './components/JsonLd';

export const metadata: Metadata = {
  // title はレイアウトの default（'ゆるユーリ | かわいいWebツールを集めたサイト'）を使用
  description: 'ゆるユーリは、日常で使える便利なWebツールを自主制作しているサイトです。',
  alternates: { canonical: '/' },
  openGraph: buildOpenGraph({
    title: 'ゆるユーリ | 便利なWebツールを自主制作しているサイト',
    description: '日常で使える便利なWebツールを自主制作しているサイトです。',
    path: '/',
  }),
};

export default function HomePage() {
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ゆるユーリ',
    url: SITE_URL,
    description: 'ゆるユーリは、日常で使える便利なWebツールを自主制作しているサイトです。',
    inLanguage: 'ja',
    publisher: {
      '@type': 'Organization',
      name: 'ゆるユーリ',
      url: SITE_URL,
      logo: `${SITE_URL}/assets/logo.png`,
      sameAs: [
        'https://x.com/ylyuriy_1st',
        'https://www.instagram.com/ylyuriy_1st',
        'https://www.youtube.com/@ylyuriy',
      ],
    },
  };

  return (
    <main className="top-page">
      <JsonLd data={websiteLd} />
      <h1>ゆるユーリ</h1>

      {/* サイト説明 */}
      <section className="top-description">
        <img src="/assets/logo.png" alt="ゆるユーリ ロゴ" className="top-logo" width={480} height={320} />
        <p>
          ゆるユーリは、個人製作サイトです。<br />
          趣味で制作したツールを公開しています。<br />
          コンセプトは「かわいい！！」
        </p>
      </section>

      {/* 各ページリンク */}
      <section className="top-section-links">
        {/* ツール一覧 */}
        <div className="top-link-box top-tool-box">
          <h2>ツール一覧</h2>
          <a href="/tools/" className="top-tool-link-button">ツール一覧を見る</a>
          <p>便利なツールをまとめた一覧ページです。</p>
        </div>
        <div className="top-link-box top-blog-box">
          <h2>ブログ</h2>
          <a href="https://yl-yuriy.com/" target="_blank" className="top-blog-link-button">ブログを見る</a>
          <p>
            開発メモやアップデート情報の他、<br />
            日常のあれこれをゆるく書き残していく予定です。
          </p>
        </div>
      </section>

      {/* 外部リンク */}
      <section className="external-links">
        <h2>外部リンク</h2>
        <p>当サイトや運営者に関連するSNSや外部サイトへのリンクです。</p>
        <div className="external-links-grid">
          <a href="https://x.com/ylyuriy_1st" target="_blank" rel="noopener" className="link-card">
            <div className="icon-area">
              <img src="/assets/x_icon.png" alt="Xアイコン" width={128} height={128} loading="lazy" />
            </div>
            <div className="text-area">
              <h3>X（旧Twitter）</h3>
            </div>
          </a>
          <a href="https://www.instagram.com/ylyuriy_1st" target="_blank" rel="noopener" className="link-card">
            <div className="icon-area">
              <img src="/assets/instagram_icon.png" alt="Instagramアイコン" width={128} height={128} loading="lazy" />
            </div>
            <div className="text-area">
              <h3>Instagram</h3>
            </div>
          </a>
          <a href="https://www.youtube.com/@ylyuriy" target="_blank" rel="noopener" className="link-card">
            <div className="icon-area">
              <img src="/assets/youtube_icon.png" alt="YouTubeアイコン" width={128} height={128} loading="lazy" />
            </div>
            <div className="text-area">
              <h3>YouTube</h3>
            </div>
          </a>
        </div>
      </section>
    </main>
  );
}
