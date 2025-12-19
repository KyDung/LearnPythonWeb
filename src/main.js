import "./style.css";
import { applyAuthUI } from "./shared/auth.js";

document.querySelector("#app").innerHTML = `
  <div class="app">
    <header class="site-header">
      <div class="brand">
        <span class="brand-mark">Py</span>Learn Arena
      </div>
      <nav class="nav">
        <a class="active" href="index.html">Trang chủ</a>
        <a href="game.html">Học qua game</a>
      </nav>
      <div class="header-actions">
        <a class="auth-link" href="login.html" data-auth="guest">Đăng nhập</a>
        <a class="auth-link" href="profile.html" data-auth="user">Hồ sơ</a>
        <button class="cta">Bắt đầu miễn phí</button>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="hero-grid">
          <div class="hero-copy">
            <p class="eyebrow">Python x Game x Thực hành</p>
            <h1>Học Python qua các mini-game ngắn, tập trung.</h1>
            <p class="lead">
              Mỗi bài học là một mini-game. Mục tiêu rõ ràng, phản hồi tức thì,
              lộ trình từ cơ bản đến xây dựng dự án.
            </p>
            <div class="hero-actions">
              <a class="primary" href="game.html">Chơi bài đầu tiên</a>
              <a class="ghost" href="game.html">Xem lộ trình</a>
            </div>
            <div class="stats">
              <div>
                <strong>3</strong>
                <span>Khóa học</span>
              </div>
              <div>
                <strong>24</strong>
                <span>Bài học</span>
              </div>
              <div>
                <strong>Demo</strong>
                <span>Tài khoản mock</span>
              </div>
            </div>
          </div>
          <div class="hero-card float">
            <h3>Thử thách hôm nay</h3>
            <p>Dùng vòng lặp để tự động sửa cầu và mở bản đồ tiếp theo.</p>
            <div class="challenge">
              <div class="challenge-row">
                <span>Mục tiêu</span>
                <span>Sửa 5 ô</span>
              </div>
              <div class="challenge-row">
                <span>Kỹ năng</span>
                <span>for / while</span>
              </div>
              <div class="challenge-row">
                <span>Thời gian</span>
                <span>6 phút</span>
              </div>
            </div>
            <a class="primary" href="game.html">Xếp hàng nhiệm vụ</a>
          </div>
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

applyAuthUI();
