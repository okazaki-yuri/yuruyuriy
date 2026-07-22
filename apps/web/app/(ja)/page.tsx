import HomeContent, { buildHomeMetadata } from '../content/home';

export const metadata = buildHomeMetadata('ja');

export default function HomePage() {
  return <HomeContent locale="ja" />;
}
