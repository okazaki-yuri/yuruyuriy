// サイト共通の定数とメタデータ生成ヘルパー。
// 従来は各ページで SITE_URL や openGraph の定型をコピペしていたが、ここに集約する。
import type { Metadata } from 'next';
import { OG_IMAGE } from './og';

export const SITE_URL = 'https://tools.yl-yuriy.com';
export const SITE_NAME = 'ゆるユーリ';

/**
 * 各ページの openGraph を組み立てる。siteName / images / type は共通値で埋め、
 * url は SITE_URL + path（トレイリングスラッシュ付き）で生成する。
 * @param path 先頭スラッシュ始まりのパス（例: '/tools/'、トップは '/'）
 */
export function buildOpenGraph({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata['openGraph'] {
  return {
    title,
    description,
    url: `${SITE_URL}${path}`,
    siteName: SITE_NAME,
    images: [OG_IMAGE],
    type: 'website',
  };
}
