import type { MetadataRoute } from 'next';
import { SITE_URL } from './site';

// robots.txt を /robots.txt として静的生成する。
// sitemap.ts / manifest.ts と方式を揃え、sitemap の URL も一元管理する。
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
