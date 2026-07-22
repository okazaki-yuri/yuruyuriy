import WebDiceContent, { buildWebDiceMetadata } from '../../../content/webdice/page-content';

export const metadata = buildWebDiceMetadata('ja');

export default function WebDicePage() {
  return <WebDiceContent locale="ja" />;
}
