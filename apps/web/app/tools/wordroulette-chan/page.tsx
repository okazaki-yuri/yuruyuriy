import type { Metadata } from 'next';
import WordRoulette from './WordRoulette';
import './roulette.css';

export const metadata: Metadata = {
  title: 'ことばルーレットちゃん | 単語抽選ツール',
  description: '入力された単語の中からランダムに1つを表示する抽選ツールです。お題決めや、チーム分けなどで活用できます。',
  openGraph: {
    title: 'ゆるユーリ | ことばルーレットちゃん',
    description: '入力された単語の中からランダムに1つを表示する抽選ツールです。お題決めや、チーム分けなどで活用できます。',
    url: 'https://tools.yl-yuriy.com/tools/wordroulette-chan/',
    siteName: 'ゆるユーリ',
    images: ['/assets/logo.png'],
    type: 'website',
  },
};

export default function WordRoulettePage() {
  return (
    <main>
      <h1>ことばルーレットちゃん</h1>

      {/* 入力・抽選（インタラクティブ部分） */}
      <WordRoulette />

      {/* ツール概要 */}
      <div className="introduction-area">
        <h2>ことばルーレットちゃんとは？</h2>
        <p>
          このツールは、入力した「ことば」の中からランダムに1つを選んで表示するシンプルなルーレットです。<br />
          ゲームのお題決めや、チーム分け、ちょっとした抽選など、さまざまなシーンで活用できます。
        </p>
      </div>

      {/* ツール説明 */}
      <div className="howto-area">
        <h2>📖 使い方ガイド</h2>
        <ul>
          <li>📝 「ことば入力モード」は1語ずつ登録できます（Enter または「追加」ボタン）。</li>
          <li>📋 「まとめて入力モード」は改行区切りで一括登録が可能です。</li>
          <li>⚠️ 同じ「ことば」があると確認ダイアログが表示されます。</li>
          <li>🎯 「ルーレット」でランダムに1語を選出します。</li>
          <li>🧹 「リセット」で登録された「ことば」をすべて削除します。</li>
          <li>🔀 「昇順／降順」切替で「ことば」の並び替えができます。</li>
          <li>🕒 「抽選時間」切替で演出の時間を調整できます。</li>
          <li>📄  その他詳細なご利用については<a href="/legal/terms-of-service/">利用規約</a>をご確認ください。</li>
        </ul>
      </div>
    </main>
  );
}
