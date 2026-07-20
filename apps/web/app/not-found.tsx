import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ゆるユーリ | ページが見つかりません',
  description: 'お探しのページは見つかりませんでした。',
};

export default function NotFound() {
  return (
    <main className="top-page">
      <h1>404 ページが見つかりません</h1>
      <p>
        お探しのページは移動または削除された可能性があります。<br />
        お手数ですが、<a href="/">TOPページ</a>からたどり直してください。
      </p>
    </main>
  );
}
