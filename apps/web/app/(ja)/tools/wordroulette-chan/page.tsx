import WordRouletteContent, { buildWordRouletteMetadata } from '../../../content/wordroulette/page-content';

export const metadata = buildWordRouletteMetadata('ja');

export default function WordRoulettePage() {
  return <WordRouletteContent locale="ja" />;
}
