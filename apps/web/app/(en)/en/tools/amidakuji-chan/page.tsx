import AmidakujiContent, { buildAmidakujiMetadata } from '../../../../content/amidakuji/page-content';

export const metadata = buildAmidakujiMetadata('en');

export default function AmidakujiPage() {
  return <AmidakujiContent locale="en" />;
}
