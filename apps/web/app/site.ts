// サイト共通の定数とメタデータ生成ヘルパー。
// 従来は各ページで SITE_URL や openGraph の定型をコピペしていたが、ここに集約する。
import type { Metadata } from 'next';
import { LOCALES, getDictionary, localizePath, type Locale } from './i18n';
import { OG_IMAGE, OG_IMAGE_EN } from './og';

export const SITE_URL = 'https://tools.yl-yuriy.com';

/** og:locale の表記（`言語_地域` 形式）。ロケール追加時はここにも列挙する */
const OG_LOCALES: Record<Locale, string> = {
  ja: 'ja_JP',
  en: 'en_US',
};

/**
 * 各ページの alternates（canonical + hreflang）を組み立てる。
 * canonical は自ページ自身、hreflang は全言語版 + x-default（主言語＝日本語）を指す。
 * URL は layout の metadataBase（SITE_URL）で絶対 URL に解決される。
 * @param locale ページの言語
 * @param path ロケール接頭辞なしのパス（例: '/tools/'、トップは '/'）
 */
export function buildAlternates(locale: Locale, path: string): Metadata['alternates'] {
  return {
    canonical: localizePath(locale, path),
    languages: {
      ja: localizePath('ja', path),
      en: localizePath('en', path),
      'x-default': localizePath('ja', path),
    },
  };
}

/**
 * 各ページの openGraph を組み立てる。siteName / images / type は共通値で埋め、
 * url は SITE_URL + path（トレイリングスラッシュ付き）で生成する。
 * @param locale ページの言語（siteName の辞書解決に使う）
 * @param path 先頭スラッシュ始まりの**ロケール接頭辞込み**のパス（例: '/tools/'、'/en/tools/'）
 */
export function buildOpenGraph({
  locale,
  title,
  description,
  path,
}: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
}): Metadata['openGraph'] {
  return {
    title,
    description,
    url: `${SITE_URL}${path}`,
    siteName: getDictionary(locale).meta.siteName,
    images: [locale === 'ja' ? OG_IMAGE : OG_IMAGE_EN],
    type: 'website',
    // og:locale / og:locale:alternate（hreflang と対応する言語シグナル）
    locale: OG_LOCALES[locale],
    alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
  };
}
