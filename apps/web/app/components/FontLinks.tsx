/*
 * Googleフォント（React 19 が <head> へ巻き上げる）。
 * M PLUS Rounded 1c は日本語対応フォントのため next/font での自ホスト化は
 * 巨大ファイルを丸ごと抱えることになり不利。Google CDN の unicode-range
 * 分割配信をそのまま活かしつつ、preconnect で接続確立を前倒しして高速化する。
 * display=swap で FOIT（テキスト不可視）も回避済み。
 * wght@400;500;700 を明示読み込みし、見出し・ボタンの合成ボールドを防ぐ。
 * 言語別レイアウト（Route Groups）から共用するため、レイアウト本体から分離している。
 */
export default function FontLinks() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
    </>
  );
}
