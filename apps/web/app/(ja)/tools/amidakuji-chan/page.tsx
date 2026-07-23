import AmidakujiContent, { buildAmidakujiMetadata } from '../../../content/amidakuji/page-content';

export const metadata = buildAmidakujiMetadata('ja');

export default function AmidakujiPage() {
  return <AmidakujiContent locale="ja" />;
}
