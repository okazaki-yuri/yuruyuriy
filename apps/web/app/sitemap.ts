import type { MetadataRoute } from 'next';
import { SITE_URL } from './site';

// 方法B（自動生成）：ページ追加時はこのリストに追記する。
export const dynamic = 'force-static';

// lastmod はビルド時刻（new Date()）ではなく、ページごとの実更新日を明示する。
// ビルド時刻を使うと無変更ページも毎回 lastmod が更新され、誤った鮮度シグナルになるため。
// lastmod は言語別に管理する：コンテンツを更新したら、更新した言語側の lastmod（YYYY-MM-DD）だけを書き換える。
// パス → 優先度。Google は priority をほぼ無視するが、サイト内の相対的な重要度の目安として付与する。
const routes: { path: string; priority: number; lastmod: { ja: string; en: string } }[] = [
  { path: '', priority: 1.0, lastmod: { ja: '2026-07-23', en: '2026-07-23' } },
  { path: 'tools/', priority: 0.8, lastmod: { ja: '2026-07-23', en: '2026-07-23' } },
  { path: 'tools/wordroulette-chan/', priority: 0.7, lastmod: { ja: '2026-07-23', en: '2026-07-23' } },
  { path: 'tools/web-dice-chan/', priority: 0.7, lastmod: { ja: '2026-07-23', en: '2026-07-23' } },
  { path: 'tools/amidakuji-chan/', priority: 0.7, lastmod: { ja: '2026-07-23', en: '2026-07-23' } },
  { path: 'contact/', priority: 0.5, lastmod: { ja: '2026-07-23', en: '2026-07-23' } },
  { path: 'legal/privacy-policy/', priority: 0.3, lastmod: { ja: '2026-07-23', en: '2026-07-23' } },
  { path: 'legal/terms-of-service/', priority: 0.3, lastmod: { ja: '2026-07-23', en: '2026-07-23' } },
];

// 日本語・英語の両ページを1エントリずつ登録し、各エントリに hreflang（alternates.languages）を付ける。
// ページ側の <link rel="alternate">（site.ts の buildAlternates）と対応を一致させること。
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.flatMap(({ path, priority, lastmod }) => {
    const jaUrl = `${SITE_URL}/${path}`;
    const enUrl = `${SITE_URL}/en/${path}`;
    const languages = { ja: jaUrl, en: enUrl, 'x-default': jaUrl };
    return [
      {
        url: jaUrl,
        lastModified: lastmod.ja,
        changeFrequency: 'monthly' as const,
        priority,
        alternates: { languages },
      },
      {
        url: enUrl,
        lastModified: lastmod.en,
        changeFrequency: 'monthly' as const,
        priority,
        alternates: { languages },
      },
    ];
  });
}
