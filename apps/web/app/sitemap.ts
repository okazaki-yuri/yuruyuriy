import type { MetadataRoute } from 'next';

// 方法B（自動生成）：ページ追加時はこのリストに追記する。
// 現行 sitemap.xml に欠落していた /legal/privacy-policy/ もここで解消される。
export const dynamic = 'force-static';

// 静的エクスポートのため lastModified はビルド時刻を用いる。
const lastModified = new Date();

// パス → 優先度。Google は priority をほぼ無視するが、サイト内の相対的な重要度の目安として付与する。
const routes: { path: string; priority: number }[] = [
  { path: '', priority: 1.0 },
  { path: 'tools/', priority: 0.8 },
  { path: 'tools/wordroulette-chan/', priority: 0.7 },
  { path: 'tools/web-dice-chan/', priority: 0.7 },
  { path: 'contact/', priority: 0.5 },
  { path: 'legal/privacy-policy/', priority: 0.3 },
  { path: 'legal/terms-of-service/', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://tools.yl-yuriy.com';
  return routes.map(({ path, priority }) => ({
    url: `${base}/${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority,
  }));
}
