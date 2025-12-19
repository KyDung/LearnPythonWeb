import "./style.css";
import { applyAuthUI, clearUser, getUser } from "./shared/auth.js";

if (!getUser()) {
  window.location.href = "login.html?next=profile";
}

const username = getUser() || "testuser";

document.querySelector("#app").innerHTML = `
  <div class="app auth-page">
    <header class="site-header">
      <div class="brand">
        <span class="brand-mark">Py</span>Learn Arena
      </div>
      <nav class="nav">
        <a href="index.html">Trang chủ</a>
        <a href="game.html">Học qua game</a>
      </nav>
      <div class="header-actions">
        <a class="auth-link" href="login.html" data-auth="guest">Đăng nhập</a>
        <a class="auth-link" href="profile.html" data-auth="user">Hồ sơ</a>
        <button class="cta">Bắt đầu miễn phí</button>
      </div>
    </header>

    <main>
      <section class="section">
        <div class="section-header">
          <h2>Hồ sơ người dùng</h2>
          <p>Thông tin tài khoản mock hiện tại.</p>
        </div>
        <div class="profile-card">
          <div>
            <strong>${username}</strong>
            <div class="profile-meta">Tài khoản mock</div>
          </div>
          <div class="profile-meta">Trạng thái: Đã đăng nhập</div>
          <button class="ghost" id="sign-out">Đăng xuất</button>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <span>Runtime: chưa tải Pyodide</span>
      <span id="user-badge" hidden></span>
      <span>Phaser + Pyodide learning lab</span>
    </footer>
  </div>
`;

const signOutButton = document.querySelector("#sign-out");

signOutButton.addEventListener("click", () => {
  clearUser();
  window.location.href = "login.html";
});

applyAuthUI();
