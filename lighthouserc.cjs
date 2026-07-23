// Lighthouse CI の設定（`pnpm check:lighthouse` / CI から `lhci autorun` で実行）
// 静的エクスポート成果物（apps/web/out）をローカル配信して主要ページを計測する
module.exports = {
  ci: {
    collect: {
      staticDistDir: './apps/web/out',
      // 全20ページ計測すると CI が長くなるため、レイアウト・ツール・英語版の代表ページに絞る
      // （ポートは LHCI が起動する静的サーバーのものに自動で置換される）
      url: [
        'http://localhost/',
        'http://localhost/tools/',
        'http://localhost/tools/wordroulette-chan/',
        'http://localhost/en/',
      ],
      numberOfRuns: 1, // PR ごとの目安計測のため1回（回数を増やすほどブレは減るが遅くなる）
    },
    assert: {
      assertions: {
        // パフォーマンスは CI ランナーの性能でブレるため warn 止まりにする
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      // 外部サービスにはアップロードせず、レポートHTMLをローカル出力する
      // （CI では actions/upload-artifact で成果物として保存）
      target: 'filesystem',
      outputDir: './.lighthouseci-reports',
    },
  },
};
