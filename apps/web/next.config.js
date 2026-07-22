/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // out/ に静的書き出し
  trailingSlash: true,       // /tools/ 形式を維持（現行URLと一致させる）
  images: { unoptimized: true }, // 静的エクスポートでは最適化サーバが無いためオフ
  transpilePackages: ['@yuruyuriy/core'], // workspaceパッケージの生TSをNext側でコンパイル
  experimental: {
    // Route Groups による複数ルートレイアウト構成（言語別 <html lang>）では、
    // 通常の not-found.tsx がルートレイアウト外で描画されてしまうため、
    // 完全なドキュメントを自前で描画する global-not-found.tsx を使う（app/global-not-found.tsx と対）
    globalNotFound: true,
  },
};

module.exports = nextConfig;
