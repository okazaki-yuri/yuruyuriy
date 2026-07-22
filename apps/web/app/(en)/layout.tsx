// 英語のルートレイアウト。
// Route Groups により言語ごとにルートレイアウトを分け、<html lang> を正しく出し分ける。
// 実体は app/content/root.tsx（言語間で共通）。
import RootDocument, { buildRootMetadata } from '../content/root';

export const metadata = buildRootMetadata('en');
export { viewport } from '../content/root';

export default function EnRootLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument locale="en">{children}</RootDocument>;
}
