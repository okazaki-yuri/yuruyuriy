// 対応ロケール。言語を追加するときはここに列挙する。
// web 側（apps/web/app/i18n/types.ts の Locale）と一致させること。
export type SupportedLocale = 'ja' | 'en';

// tools.json 上の多言語文字列。ja は必須、他ロケールは未翻訳の間は省略可（ja へフォールバック）。
export type LocalizedString = { ja: string } & Partial<Record<Exclude<SupportedLocale, 'ja'>, string>>;

// tools.json の生データ形式（多言語フィールドを持つ）
export type RawTool = {
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  href: string; // ロケール接頭辞なしのパス。表示時の接頭辞付与は web 側の責務
  icon: string;
};

// ページへ返す解決済みのツール情報（指定ロケールの文字列に解決済み）
export type Tool = {
  slug: string;
  name: string;
  description: string;
  href: string;
  icon: string;
};

export interface ToolsRepository {
  getTools(locale?: SupportedLocale): Promise<Tool[]>;
  getTool(slug: string, locale?: SupportedLocale): Promise<Tool | null>;
}
