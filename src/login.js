import "./style.css";
import users from "./data/users.json";
import { applyAuthUI, getUser, setUser } from "./shared/auth.js";

if (getUser()) {
  window.location.href = "profile.html";
}

const getNextPage = () => {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  const course = params.get("course");
  const lesson = params.get("lesson");
  const game = params.get("game");
  const path = params.get("path");

  if (next === "play" && path) {
    return `play.html?path=${encodeURIComponent(path)}`;
  }

  if (next === "play" && game) {
    return `play.html?path=${encodeURIComponent(game)}`;
  }

  if (next === "lesson" && course && lesson) {
    return `lesson.html?course=${encodeURIComponent(
      course
    )}&lesson=${encodeURIComponent(lesson)}`;
  }

  if (next === "course" && course) {
    return `course.html?course=${encodeURIComponent(course)}`;
  }

  if (next === "profile") {
    return "profile.html";
  }

  if (next === "game") {
    return "game.html";
  }

  return "index.html";
};

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
          <h2>Đăng nhập</h2>
          <p>Hiện tại là tài khoản mock. Xác thực thật sẽ có sau.</p>
        </div>
        <form class="login-card" id="login-form">
          <label>
            Tên đăng nhập
            <input id="login-user" type="text" placeholder="testuser" required />
          </label>
          <label>
            Mật khẩu
            <input id="login-pass" type="password" placeholder="123456" required />
          </label>
          <button type="submit" class="primary">Đăng nhập</button>
          <p class="login-note" id="login-status">
            Tài khoản demo: testuser / 123456
          </p>
        </form>
      </section>
    </main>

    <footer class="site-footer">
      <span>Runtime: chưa tải Pyodide</span>
      <span id="user-badge" hidden></span>
      <span>Phaser + Pyodide learning lab</span>
    </footer>
  </div>
`;

const loginForm = document.querySelector("#login-form");
const loginStatus = document.querySelector("#login-status");
const loginUser = document.querySelector("#login-user");
const loginPass = document.querySelector("#login-pass");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = loginUser.value.trim();
  const password = loginPass.value.trim();
  const matched = users.find(
    (user) => user.username === username && user.password === password
  );
  if (matched) {
    loginStatus.textContent = "Đăng nhập mock thành công. Đang chuyển trang...";
    loginStatus.classList.remove("error");
    loginStatus.classList.add("success");
    setUser(matched.username);
    window.location.href = getNextPage();
  } else {
    loginStatus.textContent = "Sai tài khoản hoặc mật khẩu. Thử lại.";
    loginStatus.classList.remove("success");
    loginStatus.classList.add("error");
  }
});

applyAuthUI();
