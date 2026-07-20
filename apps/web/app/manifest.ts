import type { MetadataRoute } from 'next';

// Web App Manifest。/manifest.webmanifest として静的生成され、
// Next が <link rel="manifest"> を自動付与する。
// アイコンは scripts/generate-icons.cjs がビルド時に生成する。
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ゆるユーリ | かわいいWebツールを集めたサイト',
    short_name: 'ゆるユーリ',
    description: 'ゆるユーリは、日常で使える便利なWebツールを自主制作しているサイトです。',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff5fb',
    theme_color: '#ffe3f1',
    lang: 'ja',
    icons: [
      { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
