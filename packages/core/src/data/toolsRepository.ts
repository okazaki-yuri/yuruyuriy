import type { LocalizedString, RawTool, SupportedLocale, Tool, ToolsRepository } from './types';
import tools from '../../../../data/tools.json'; // ビルド時に取り込まれる

/** 多言語文字列を指定ロケールへ解決する（未翻訳のロケールは ja へフォールバック） */
function resolve(text: LocalizedString, locale: SupportedLocale): string {
  return text[locale] ?? text.ja;
}

function toTool(raw: RawTool, locale: SupportedLocale): Tool {
  return {
    slug: raw.slug,
    name: resolve(raw.name, locale),
    description: resolve(raw.description, locale),
    href: raw.href,
    icon: raw.icon,
  };
}

// 第1段階：静的JSONを返す実装。
// 第2段階でAPI化する場合はこのファイルの実装を fetch に差し替えるだけで、
// 呼び出し側（ページ）は無改修で済む。
export const toolsRepository: ToolsRepository = {
  async getTools(locale = 'ja') {
    return (tools as RawTool[]).map((t) => toTool(t, locale));
  },
  async getTool(slug, locale = 'ja') {
    const raw = (tools as RawTool[]).find((t) => t.slug === slug);
    return raw ? toTool(raw, locale) : null;
  },
};
