import ContactContent, { buildContactMetadata } from '../../../content/contact';

export const metadata = buildContactMetadata('en');

export default function ContactPage() {
  return <ContactContent locale="en" />;
}
