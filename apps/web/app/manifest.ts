import type { MetadataRoute } from 'next';
import { getDictionary } from './i18n';

// Web App Manifest。/manifest.webmanifest として静的生成され、
// Next が <link rel="manifest"> を自動付与する。
// アイコンは scripts/generate-icons.cjs がビルド時に生成する。
// ※manifest は言語共通で1枚のみ（静的エクスポートでは言語別に出し分けられない）ため、
//   文言は主言語（ja）の辞書から取得する。/en/ からの PWA インストールでも
//   アプリ名は日本語になる（既知の制約。docs/i18n.md §1 参照）。
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  const d = getDictionary('ja');
  return {
    name: d.meta.titleDefault,
    short_name: d.meta.siteName,
    description: d.home.ogDescription,
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
