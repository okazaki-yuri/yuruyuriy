import type { Metadata } from 'next';
import { toolsRepository } from '@yuruyuriy/core/data/toolsRepository';

export const metadata: Metadata = {
  title: 'ゆるユーリ | ツール一覧',
  description: '便利なWebツール一覧です。',
  alternates: { canonical: '/tools/' },
  openGraph: {
    title: 'ゆるユーリ | 便利なWebツール一覧',
    description: '便利なWebツール一覧です。',
    url: 'https://tools.yl-yuriy.com/tools/',
    siteName: 'ゆるユーリ',
    images: ['/assets/logo.png'],
    type: 'website',
  },
};

export default async function ToolsPage() {
  // データ実体（JSON/API）を知らず、repository I/F 経由でのみ取得する
  const tools = await toolsRepository.getTools();

  return (
    <main className="tool-list-page">
      {/* タイトルおよびページ説明 */}
      <section className="tools-heading-area">
        <h1>🛠 ツール一覧</h1>
        <p>現在公開中および今後公開予定のツールたちです。</p>
      </section>

      {/* ツールカード一覧 */}
      <section className="tool-list-container">
        {tools.map((tool) => (
          <div className="tool-card active-tool" key={tool.slug}>
            <a href={tool.href} className="tool-link">
              <div className="tool-icon">{tool.icon}</div>
              <div className="tool-name">{tool.name}</div>
              <p className="tool-description">{tool.description}</p>
            </a>
          </div>
        ))}
        {/* TODO 今後追加される予定のツールたち */}
        <div className="tool-card coming-soon">
          <div className="tool-link">
            <div className="tool-icon">🔧</div>
            <div className="tool-name">Coming Soon</div>
            <p className="tool-description">準備中のツールです。お楽しみに！</p>
          </div>
        </div>
        <div className="tool-card coming-soon">
          <div className="tool-link">
            <div className="tool-icon">🔧</div>
            <div className="tool-name">Coming Soon</div>
            <p className="tool-description">準備中のツールです。お楽しみに！</p>
          </div>
        </div>
      </section>
    </main>
  );
}
