export type Tool = {
  slug: string;
  name: string;
  description: string;
  href: string;
  icon: string;
};

export interface ToolsRepository {
  getTools(): Promise<Tool[]>;
  getTool(slug: string): Promise<Tool | null>;
}
