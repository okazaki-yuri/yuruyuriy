import { getDictionary, localizePath, type Locale } from '../i18n';

export default function Footer({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  return (
    <footer className="site-footer">
      <div className="footer-nav">
        <a href={localizePath(locale, '/')}>{d.nav.top}</a>
        <a href={localizePath(locale, '/tools/')}>{d.nav.tools}</a>
        <a href={localizePath(locale, '/legal/privacy-policy/')}>{d.nav.privacy}</a>
        <a href={localizePath(locale, '/legal/terms-of-service/')}>{d.nav.terms}</a>
        <a href={localizePath(locale, '/contact/')}>{d.nav.contact}</a>
      </div>

      {/* コピーライト */}
      <div className="footer-copy">
        {d.footer.copyright}
      </div>
    </footer>
  );
}
