import ContactContent, { buildContactMetadata } from '../../content/contact';

export const metadata = buildContactMetadata('ja');

export default function ContactPage() {
  return <ContactContent locale="ja" />;
}
