import Script from 'next/script';

/*
 * Google tag (gtag.js)。言語別レイアウト（Route Groups）から共用する。
 * 将来 CMP を導入する際は、ここで Consent Mode v2 の
 * gtag('consent', 'default', { …, region: [...] }) を gtag('js') より前に設定する
 * （docs/i18n-plan.md §10 参照）。
 */
export default function GoogleAnalytics() {
  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-WP93BYLBD9" strategy="afterInteractive" />
      <Script id="ga" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-WP93BYLBD9');
        `}</Script>
    </>
  );
}
