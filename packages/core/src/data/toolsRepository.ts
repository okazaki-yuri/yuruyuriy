import type { Tool, ToolsRepository } from './types';
import tools from '../../../../data/tools.json'; // ビルド時に取り込まれる

// 第1段階：静的JSONを返す実装。
// 第2段階でAPI化する場合はこのファイルの実装を fetch に差し替えるだけで、
// 呼び出し側（ページ）は無改修で済む。
export const toolsRepository: ToolsRepository = {
  async getTools() {
    return tools as Tool[];
  },
  async getTool(slug) {
    return (tools as Tool[]).find((t) => t.slug === slug) ?? null;
  },
};
