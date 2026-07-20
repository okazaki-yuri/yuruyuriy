// PWA / apple-touch-icon 用の正方形アイコンをビルド時に生成する。
// 既存の正方形素材が無いため、ロゴをピンク背景の正方形に中央配置して出力する。
// 生成物は public/assets 配下（.gitignore 済み）。
const { ImageResponse } = require('next/og');
const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');

const ROOT = join(__dirname, '..');
const logo = readFileSync(join(ROOT, 'public/assets/logo.png'));
const logoDataUri = `data:image/png;base64,${logo.toString('base64')}`;

// 出力対象：ファイル名とサイズ（px）
const targets = [
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
];

function element(size) {
  // maskable のセーフゾーン（中央 80% の円内）にロゴ本体が収まるよう 0.7 に抑える
  const logoW = Math.round(size * 0.7);
  const logoH = Math.round((logoW * 320) / 480); // ロゴ実寸 480x320 の比率を維持
  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fff5fb 0%, #ffe3f1 100%)',
      },
      children: {
        type: 'img',
        props: { src: logoDataUri, width: logoW, height: logoH, alt: '' },
      },
    },
  };
}

(async () => {
  const outDir = join(ROOT, 'public/assets');
  mkdirSync(outDir, { recursive: true });
  for (const { file, size } of targets) {
    const res = new ImageResponse(element(size), { width: size, height: size });
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(join(outDir, file), buf);
    console.log(`generated ${file} (${size}x${size}, ${(buf.length / 1024) | 0}KB)`);
  }
})();
