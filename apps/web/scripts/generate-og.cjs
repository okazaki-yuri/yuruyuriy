// サイト共通のOGP画像（1200×630, PNG）をビルド時に生成する。
// 静的エクスポート(next build)前に実行し public/assets/og-image.png を出力する。
// ※日本語は同梱フォントで描画できないため、テキストは既存ロゴ画像に委ね latin のみ描画する。
const { ImageResponse } = require('next/og');
const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');

const ROOT = join(__dirname, '..');
const logo = readFileSync(join(ROOT, 'public/assets/logo.png'));
const logoDataUri = `data:image/png;base64,${logo.toString('base64')}`;

const element = {
  type: 'div',
  props: {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
      background: 'linear-gradient(135deg, #fff5fb 0%, #ffe3f1 100%)',
    },
    children: [
      { type: 'img', props: { src: logoDataUri, width: 720, height: 480, alt: '' } },
      {
        type: 'div',
        props: {
          style: { fontSize: 40, color: '#d6699a', letterSpacing: 2 },
          children: 'tools.yl-yuriy.com',
        },
      },
    ],
  },
};

(async () => {
  const res = new ImageResponse(element, { width: 1200, height: 630 });
  const buf = Buffer.from(await res.arrayBuffer());
  const outDir = join(ROOT, 'public/assets');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'og-image.png');
  writeFileSync(outPath, buf);
  console.log(`generated ${outPath} (${(buf.length / 1024) | 0}KB)`);
})();
