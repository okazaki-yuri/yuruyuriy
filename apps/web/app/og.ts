// サイト共通のOGP画像定義。各ページの openGraph.images に指定して使う。
// 画像本体は scripts/generate-og.cjs がビルド時に public/assets/og-image.png を生成する。
// ※Next の metadata はページごとに openGraph を上書き（浅いマージ）するため、
//   ページ側で明示指定する必要がある。twitter:image は openGraph.images から自動継承される。
export const OG_IMAGE = {
  url: '/assets/og-image.png',
  width: 1200,
  height: 630,
  alt: 'ゆるユーリ | かわいいWebツールを集めたサイト',
} as const;
