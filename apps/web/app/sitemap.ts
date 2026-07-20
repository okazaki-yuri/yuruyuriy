import type { MetadataRoute } from 'next';

// 方法B（自動生成）：ページ追加時はこのリストに追記する。
// 現行 sitemap.xml に欠落していた /legal/privacy-policy/ もここで解消される。
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://tools.yl-yuriy.com';
  return [
    '',
    'tools/',
    'tools/wordroulette-chan/',
    'tools/web-dice-chan/',
    'contact/',
    'legal/privacy-policy/',
    'legal/terms-of-service/',
  ].map((p) => ({ url: `${base}/${p}`, changeFrequency: 'monthly' }));
}
