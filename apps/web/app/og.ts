// サイト共通のOGP画像定義。各ページの openGraph.images に指定して使う。
// 画像本体は scripts/generate-og.cjs がビルド時に public/assets/og-image.png を生成する。
// ※Next の metadata はページごとに openGraph を上書き（浅いマージ）するため、
//   ページ側で明示指定する必要がある。twitter:image は openGraph.images から自動継承される。
import { getDictionary } from './i18n';

export const OG_IMAGE = {
  url: '/assets/og-image.png',
  width: 1200,
  height: 630,
  // alt はサイトの既定タイトル（辞書）と一致させ、文言変更時のズレを防ぐ
  alt: getDictionary('ja').meta.titleDefault,
} as const;

// 英語ページ用。画像本体はロゴ + ドメイン表記（latin のみ）のため日本語版と共用し、alt だけ英語にする。
// 海外向けロゴを用意したら url を差し替える（docs/i18n-plan.md §9）。
export const OG_IMAGE_EN = {
  ...OG_IMAGE,
  alt: getDictionary('en').meta.titleDefault,
} as const;
