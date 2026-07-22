import type { MetadataRoute } from 'next';
import { SITE_URL } from './site';

// 方法B（自動生成）：ページ追加時はこのリストに追記する。
// 現行 sitemap.xml に欠落していた /legal/privacy-policy/ もここで解消される。
export const dynamic = 'force-static';

// lastmod はビルド時刻（new Date()）ではなく、ページごとの実更新日を明示する。
// ビルド時刻を使うと無変更ページも毎回 lastmod が更新され、誤った鮮度シグナルになるため。
// コンテンツを更新したら、そのページの lastmod（YYYY-MM-DD）だけを書き換える。
// パス → 優先度。Google は priority をほぼ無視するが、サイト内の相対的な重要度の目安として付与する。
const routes: { path: string; priority: number; lastmod: string }[] = [
  { path: '', priority: 1.0, lastmod: '2026-07-23' },
  { path: 'tools/', priority: 0.8, lastmod: '2026-07-23' },
  { path: 'tools/wordroulette-chan/', priority: 0.7, lastmod: '2026-07-23' },
  { path: 'tools/web-dice-chan/', priority: 0.7, lastmod: '2026-07-23' },
  { path: 'contact/', priority: 0.5, lastmod: '2026-07-23' },
  { path: 'legal/privacy-policy/', priority: 0.3, lastmod: '2026-07-23' },
  { path: 'legal/terms-of-service/', priority: 0.3, lastmod: '2026-07-23' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority, lastmod }) => ({
    url: `${SITE_URL}/${path}`,
    lastModified: lastmod,
    changeFrequency: 'monthly',
    priority,
  }));
}
