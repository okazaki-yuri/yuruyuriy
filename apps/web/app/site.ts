// サイト共通の定数とメタデータ生成ヘルパー。
// 従来は各ページで SITE_URL や openGraph の定型をコピペしていたが、ここに集約する。
import type { Metadata } from 'next';
import { getDictionary, type Locale } from './i18n';
import { OG_IMAGE } from './og';

export const SITE_URL = 'https://tools.yl-yuriy.com';

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
    images: [OG_IMAGE],
    type: 'website',
  };
}
