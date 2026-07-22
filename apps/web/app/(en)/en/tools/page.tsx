import ToolsContent, { buildToolsMetadata } from '../../../content/tools';

export const metadata = buildToolsMetadata('en');

export default function ToolsPage() {
  return <ToolsContent locale="en" />;
}
