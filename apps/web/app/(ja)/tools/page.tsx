import ToolsContent, { buildToolsMetadata } from '../../content/tools';

export const metadata = buildToolsMetadata('ja');

export default function ToolsPage() {
  return <ToolsContent locale="ja" />;
}
