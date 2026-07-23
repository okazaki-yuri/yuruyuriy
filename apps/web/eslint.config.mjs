import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// eslint-config-next は eslintrc 形式のため FlatCompat で flat config に変換する
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      '.next/**', // ビルドキャッシュ・生成型
      'out/**', // 静的エクスポート成果物
      'next-env.d.ts', // Next が自動生成
    ],
  },
  {
    rules: {
      // 静的エクスポート（images.unoptimized）のため next/image の最適化は効かない。
      // <img> はこのプロジェクトの設計どおり（docs/style-guide.md）
      '@next/next/no-img-element': 'off',
      // pages/_document 前提のルールで App Router には該当しない
      // （Google Fonts の <link> は app/components/FontLinks.tsx で全ページに適用される）
      '@next/next/no-page-custom-font': 'off',
    },
  },
  {
    // ビルド用 Node スクリプト（.cjs）は CommonJS のため require() を許可
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];

export default eslintConfig;
