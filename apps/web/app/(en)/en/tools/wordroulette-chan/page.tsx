import WordRouletteContent, { buildWordRouletteMetadata } from '../../../../content/wordroulette/page-content';

export const metadata = buildWordRouletteMetadata('en');

export default function WordRoulettePage() {
  return <WordRouletteContent locale="en" />;
}
