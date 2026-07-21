import type { MetadataRoute } from 'next';

// robots.txt を /robots.txt として静的生成する。
// sitemap.ts / manifest.ts と方式を揃え、sitemap の URL も一元管理する。
export const dynamic = 'force-static';

const SITE_URL = 'https://tools.yl-yuriy.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
