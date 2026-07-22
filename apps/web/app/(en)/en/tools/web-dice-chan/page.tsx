import WebDiceContent, { buildWebDiceMetadata } from '../../../../content/webdice/page-content';

export const metadata = buildWebDiceMetadata('en');

export default function WebDicePage() {
  return <WebDiceContent locale="en" />;
}
