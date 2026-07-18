document.addEventListener("DOMContentLoaded", () => {
  const hdr = document.getElementById("header-container");
  const ftr = document.getElementById("footer-container");

  // ヘッダー読み込み
  fetch("/components/header.html")
    .then(r => {
      if (!r.ok) throw new Error(`header.html の取得に失敗しました (${r.status})`);
      return r.text();
    })
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
    })
    .catch(err => console.error(err));

  // フッター読み込み
  fetch("/components/footer.html")
    .then(r => {
      if (!r.ok) throw new Error(`footer.html の取得に失敗しました (${r.status})`);
      return r.text();
    })
    .then(html => {
      ftr.innerHTML = html;
    })
    .catch(err => console.error(err));
});
