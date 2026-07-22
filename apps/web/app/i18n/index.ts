// i18n の公開API。ページ・コンポーネントはここから取得する。
// クライアントコンポーネントからも import できる（locale を props で受け取り、辞書は各自で引く）。
import { en } from './en';
import { ja } from './ja';
import { DEFAULT_LOCALE, type Dictionary, type Locale } from './types';

export { DEFAULT_LOCALE, LOCALES } from './types';
export type { Dictionary, FaqItem, LinkedText, Locale } from './types';

/** 各言語の表示名。言語スイッチャーではどのページでも「その言語自身の表記」で表示する */
export const LOCALE_NAMES: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
};

const dictionaries: Record<Locale, Dictionary> = {
  ja,
  en,
};

/** 指定ロケールの辞書を返す */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * ロケールに応じた URL パスを返す。
 * デフォルトロケール（ja）は接頭辞なし（現行 URL 維持）、それ以外は '/en/…' のように接頭辞を付ける。
 * @param path 先頭スラッシュ始まりのロケール非依存パス（例: '/tools/'、トップは '/'）
 */
export function localizePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? `/${locale}/` : `/${locale}${path}`;
}
