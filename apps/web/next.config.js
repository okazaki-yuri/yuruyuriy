/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // out/ に静的書き出し
  trailingSlash: true,       // /tools/ 形式を維持（現行URLと一致させる）
  images: { unoptimized: true }, // 静的エクスポートでは最適化サーバが無いためオフ
  transpilePackages: ['@yuruyuriy/core'], // workspaceパッケージの生TSをNext側でコンパイル
};

module.exports = nextConfig;
