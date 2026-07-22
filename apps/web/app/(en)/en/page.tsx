import HomeContent, { buildHomeMetadata } from '../../content/home';

export const metadata = buildHomeMetadata('en');

export default function HomePage() {
  return <HomeContent locale="en" />;
}
