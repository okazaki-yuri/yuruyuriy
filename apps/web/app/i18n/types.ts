// i18n の基盤型。対応ロケールと辞書の形をここで定義する。
// ロケール追加時は Locale へ列挙を足し、辞書ファイル（ja.ts / en.ts / …）を追加する。
// packages/core の SupportedLocale と一致させること。
import type { DiceStats, DiceValidationError } from '@yuruyuriy/core';

export type Locale = 'ja' | 'en';

export const LOCALES: readonly Locale[] = ['ja', 'en'] as const;

/** デフォルトロケール（URL 接頭辞なしでルート直下に配置される言語） */
export const DEFAULT_LOCALE: Locale = 'ja';

// FAQ の1項目（表示と JSON-LD（FAQPage）の両方で使う。必ず一致させる）
export type FaqItem = { q: string; a: string };

// 文中にリンクを1つ含むテキスト（例: 「詳しくは<a>利用規約</a>をご確認ください」）
export type LinkedText = { pre: string; linkText: string; post: string };

/**
 * サイト全文言の辞書型。
 * 各ロケールの辞書（ja.ts / en.ts）は `satisfies Dictionary` で定義し、
 * キーの過不足をコンパイル時に検出する。
 * 数値などの埋め込みが必要な文言は関数として持つ（ロケールごとの複数形にも対応できる）。
 */
export type Dictionary = {
  meta: {
    /** サイト名（JSON-LD の publisher 名などに使用） */
    siteName: string;
    /** <title> の既定値（トップなど title 未設定ページ用） */
    titleDefault: string;
    /** <title> のテンプレート（'%s | サイト名'） */
    titleTemplate: string;
  };
  /** ナビゲーションのリンクラベル（ヘッダー・フッター共通） */
  nav: {
    top: string;
    tools: string;
    blog: string;
    privacy: string;
    terms: string;
    contact: string;
  };
  header: {
    logoAlt: string;
    menuLabel: string;
    menuCloseLabel: string;
    /** ブログリンクをヘッダーに表示するか（ブログは日本語のみのため en では非表示） */
    showBlog: boolean;
    /** 言語スイッチャー（🌐 ドロップダウン）の aria-label */
    langSwitcherLabel: string;
  };
  footer: {
    copyright: string;
  };
  /** SNS シェアボタン（各ツール共通） */
  share: {
    /** LINE ボタンを表示するか（LINE は日本・アジア圏中心のため、利用実態のない言語では非表示） */
    showLine: boolean;
    /** 抽選結果シェアセクションの aria-label */
    resultSectionLabel: string;
    xLabel: string;
    xAria: string;
    lineLabel: string;
    lineAria: string;
    copyLabel: string;
    copyDone: string;
    copyAria: string;
    nativeLabel: string;
    nativeAria: string;
  };
  /** パンくず（JSON-LD BreadcrumbList）の共通項目名 */
  breadcrumb: {
    home: string;
    tools: string;
  };
  notFound: {
    metaTitle: string;
    metaDescription: string;
    heading: string;
    line1: string;
    line2: LinkedText;
  };
  home: {
    /** meta description と JSON-LD（WebSite）の description に共用 */
    description: string;
    ogTitle: string;
    ogDescription: string;
    heading: string;
    logoAlt: string;
    introLines: string[];
    toolsBox: { heading: string; button: string; text: string };
    blogBox: { heading: string; button: string; textLines: string[] };
    external: {
      heading: string;
      text: string;
      xAlt: string;
      xName: string;
      instagramAlt: string;
      instagramName: string;
      youtubeAlt: string;
      youtubeName: string;
    };
  };
  tools: {
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    heading: string;
    lead: string;
    /** JSON-LD（ItemList）の name */
    itemListName: string;
    comingSoonName: string;
    comingSoonDescription: string;
  };
  roulette: {
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    /** JSON-LD（WebApplication）と h1・パンくずのツール名 */
    name: string;
    ldDescription: string;
    heading: string;
    lead: string;
    aboutHeading: string;
    aboutLines: string[];
    usecaseHeading: string;
    usecases: string[];
    howtoHeading: string;
    howtoItems: string[];
    /** 使い方ガイド末尾の利用規約リンク行 */
    howtoTermsItem: LinkedText;
    faqHeading: string;
    faqs: FaqItem[];
    widget: {
      modeTabsLabel: string;
      modeText: string;
      modeWheel: string;
      /** ホイールにことばが未登録のときの案内文 */
      wheelEmptyText: string;
      /** 結果ボックスが空のときの案内文（CSS の ::before から attr(data-placeholder) で参照） */
      resultPlaceholder: string;
      /** 抽選中の結果ボックス表示（CSS の ::before から attr(data-spinning) で参照） */
      resultSpinning: string;
      tabSingle: string;
      tabMulti: string;
      singlePlaceholder: string;
      multiPlaceholder: string;
      addButton: string;
      spinButton: string;
      spinningButton: string;
      sortLabel: string;
      sortAsc: string;
      sortDesc: string;
      durationLabel: string;
      durationNone: string;
      durationSeconds: (n: number) => string;
      /** 当選したことばを一覧から自動で除外するオプションのラベル */
      removeWinnerLabel: string;
      historyHeading: string;
      historyResetButton: string;
      confirmHistoryReset: string;
      resetButton: string;
      confirmDuplicate: (word: string) => string;
      confirmReset: string;
      shareText: (result: string) => string;
      hashtags: string[];
    };
  };
  dice: {
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    /** JSON-LD（WebApplication）と h1・パンくずのツール名 */
    name: string;
    ldDescription: string;
    heading: string;
    lead: string;
    aboutHeading: string;
    aboutLines: string[];
    usecaseHeading: string;
    usecases: string[];
    howtoHeading: string;
    howtoSteps: string[];
    howtoNotes: string[];
    /** 使い方ガイド末尾の利用規約リンク行 */
    howtoTermsItem: LinkedText;
    faqHeading: string;
    faqs: FaqItem[];
    widget: {
      rangeLabel: string;
      rangeHint: string;
      tilde: string;
      countLabel: string;
      countHint: string;
      durationLabel: string;
      durationHint: string;
      durationSeconds: (n: number) => string;
      rollButton: string;
      /** よく使う出目範囲のプリセットボタン群のラベル */
      presetsLabel: string;
      historyHeading: string;
      historyResultLabel: string;
      /** 履歴に付記する抽選条件（括弧込み。例: （1〜6 × 2個）） */
      historyConfig: (min: number, max: number, count: number) => string;
      resetButton: string;
      confirmReset: string;
      /** 「合計 / 平均 / 最大 / 最小」の表示文字列 */
      statsText: (stats: DiceStats) => string;
      shareText: (results: number[]) => string;
      hashtags: string[];
      /** バリデーションエラーコード → 表示文言 */
      errors: Record<DiceValidationError, string>;
    };
  };
  contact: {
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    /** パンくずのページ名 */
    name: string;
    heading: string;
    intro: string;
    formButton: string;
    sub: string;
    xLinkLabel: string;
  };
};
