// ツール一覧ページの実体（メタデータ生成 + 本文）。
import type { Metadata } from 'next';
import { toolsRepository } from '@yuruyuriy/core/data/toolsRepository';
import JsonLd from '../components/JsonLd';
import { getDictionary, localizePath, type Locale } from '../i18n';
import { SITE_URL, buildAlternates, buildOpenGraph } from '../site';

export function buildToolsMetadata(locale: Locale): Metadata {
  const d = getDictionary(locale);
  return {
    title: d.tools.metaTitle,
    description: d.tools.metaDescription,
    alternates: buildAlternates(locale, '/tools/'),
    openGraph: buildOpenGraph({
      locale,
      title: d.tools.ogTitle,
      description: d.tools.metaDescription,
      path: localizePath(locale, '/tools/'),
    }),
  };
}

export default async function ToolsContent({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  // データ実体（JSON/API）を知らず、repository I/F 経由でのみ取得する
  const tools = await toolsRepository.getTools(locale);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: d.breadcrumb.home, item: `${SITE_URL}${localizePath(locale, '/')}` },
      { '@type': 'ListItem', position: 2, name: d.breadcrumb.tools, item: `${SITE_URL}${localizePath(locale, '/tools/')}` },
    ],
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: d.tools.itemListName,
    itemListElement: tools.map((tool, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: tool.name,
      url: `${SITE_URL}${localizePath(locale, tool.href)}`,
    })),
  };

  return (
    <main className="tool-list-page">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={itemListLd} />
      {/* タイトルおよびページ説明 */}
      <section className="tools-heading-area">
        <h1>{d.tools.heading}</h1>
        <p>{d.tools.lead}</p>
      </section>

      {/* ツールカード一覧 */}
      <section className="tool-list-container">
        {tools.map((tool) => (
          <div className="tool-card active-tool" key={tool.slug}>
            <a href={localizePath(locale, tool.href)} className="tool-link">
              <div className="tool-icon">{tool.icon}</div>
              <div className="tool-name">{tool.name}</div>
              <p className="tool-description">{tool.description}</p>
            </a>
          </div>
        ))}
        {/* TODO 今後追加される予定のツールたち（準備中プレースホルダー） */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div className="tool-card coming-soon" key={`coming-soon-${i}`}>
            <div className="tool-link">
              <div className="tool-icon">🔧</div>
              <div className="tool-name">{d.tools.comingSoonName}</div>
              <p className="tool-description">{d.tools.comingSoonDescription}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
