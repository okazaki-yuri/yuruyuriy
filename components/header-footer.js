document.addEventListener("DOMContentLoaded", () => {
  // プレースホルダ作成
  const hdr = document.createElement("div");
  const ftr = document.createElement("div");
  hdr.id = "header-container";
  ftr.id = "footer-container";
  document.body.prepend(hdr);
  document.body.appendChild(ftr);

  // ヘッダー読み込み
  fetch("/components/header.html")
    .then(r => r.text())
    .then(html => {
      hdr.innerHTML = html;

      const hb = document.getElementById("hamburgerBtn");
      const nav = document.getElementById("mobileMenu");
      const closeBtn = document.getElementById("overlayCloseBtn");

      // ハンバーガー開閉
      hb.addEventListener("click", () => {
        hb.classList.toggle("open");
        nav.classList.toggle("show");
      });

      // オーバーレイ閉じる
      closeBtn.addEventListener("click", () => {
        hb.classList.remove("open");
        nav.classList.remove("show");
      });

      // 外部クリックで閉じる
      document.addEventListener("click", e => {
        if (!hb.contains(e.target) && !nav.contains(e.target)) {
          hb.classList.remove("open");
          nav.classList.remove("show");
        }
      });
    });

  // フッター読み込み
  fetch("/components/footer.html")
    .then(r => r.text())
    .then(html => {
      ftr.innerHTML = html;
    });
});
