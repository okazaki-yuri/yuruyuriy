// グローバル 404 ページ（未マッチ URL 用。静的エクスポートでは out/404.html として1枚だけ生成される）。
// Route Groups による複数ルートレイアウト構成ではルート直下に layout.tsx が無いため、
// 通常の not-found.tsx ではレイアウト（<html lang>・ヘッダー・CSS）を適用できない。
// そのため experimental の global-not-found（自前で完全なドキュメントを描画する方式）を使う
// （next.config.js の experimental.globalNotFound と対）。表示言語はデフォルトロケール（ja）。
import type { Metadata } from 'next';
import RootDocument, { buildRootMetadata } from './content/root';
import { getDictionary } from './i18n';

const d = getDictionary('ja');

// global-not-found はレイアウトのメタデータ（twitter・icons 等）と viewport を継承しないため、
// ルート共通メタデータを土台に、このページ固有の値を上書きして自前で組み立てる。
export const metadata: Metadata = {
  ...buildRootMetadata('ja'),
  // title テンプレートも経由しないため、ここで解決済みの文字列にする
  title: d.meta.titleTemplate.replace('%s', d.notFound.metaTitle),
  description: d.notFound.metaDescription,
  robots: { index: false, follow: true },
};

export { viewport } from './content/root';

export default function GlobalNotFound() {
  return (
    <RootDocument locale="ja">
      <main className="top-page">
        <h1>{d.notFound.heading}</h1>
        <p>
          {d.notFound.line1}<br />
          {d.notFound.line2.pre}<a href="/">{d.notFound.line2.linkText}</a>{d.notFound.line2.post}
        </p>
      </main>
    </RootDocument>
  );
}
