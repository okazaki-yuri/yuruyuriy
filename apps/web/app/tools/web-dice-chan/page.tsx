import type { Metadata } from 'next';
import WebDice from './WebDice';
import './dice.css';

export const metadata: Metadata = {
  title: 'WEBサイコロちゃん',
  description: '指定した数字の範囲でサイコロを振ることができます。複数のサイコロを同時に振ることもできます。',
  alternates: { canonical: '/tools/web-dice-chan/' },
  openGraph: {
    title: 'WEBサイコロちゃん',
    description: '指定した数字の範囲でサイコロを振ることができます。複数のサイコロを同時に振ることもできます。',
    url: 'https://tools.yl-yuriy.com/tools/web-dice-chan/',
    siteName: 'ゆるユーリ',
    images: ['/assets/logo.png'],
    type: 'website',
  },
};

export default function WebDicePage() {
  return (
    <main>
      <h1>WEBサイコロちゃん</h1>

      {/* 入力・抽選・履歴（インタラクティブ部分） */}
      <WebDice />

      {/* ツール概要 */}
      <div className="introduction-area">
        <h2>WEBサイコロちゃんとは？</h2>
        <p>
          このツールでは、好きな範囲の数字でサイコロを振ることができます。<br />
          サイコロの個数や演出時間を設定することもできます。<br />
          平均値・最大値・最小値なども表示されるので、ゲームや抽選に活用できます！
        </p>
      </div>

      {/* ツール説明 */}
      <div className="howto-area">
        <h2>📖 使い方ガイド</h2>
        <ul>
          <li>「サイコロの出目（最小値 ~ 最大値）」に0~100の数字を入力します。</li>
          <li>最小値が最大値より大きい場合は抽選できません。</li>
          <li>「サイコロの個数」は30まで指定できます。</li>
          <li>「演出時間」切替で演出の時間を調整できます。</li>
          <li>「サイコロを振る」ボタン押下で抽選開始です。</li>
          <li>2個以上のサイコロを振った場合は「合計」「平均」「最大」「最小」がそれぞれ表示されます。</li>
          <li>その他詳細なご利用については<a href="/legal/terms-of-service/">利用規約</a>をご確認ください。</li>
        </ul>
      </div>
    </main>
  );
}
