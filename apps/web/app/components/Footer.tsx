export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-nav">
        <a href="/">TOP</a>
        <a href="/tools/">ツール一覧</a>
        <a href="/legal/privacy-policy/">プライバシーポリシー</a>
        <a href="/legal/terms-of-service/">利用規約</a>
        <a href="/contact/">お問い合わせ</a>
      </div>

      {/* コピーライト */}
      <div className="footer-copy">
        © 2025 Ylyuriy All rights reserved.
      </div>
    </footer>
  );
}
