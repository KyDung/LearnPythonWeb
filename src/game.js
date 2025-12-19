import "./style.css";
import courses from "./data/courses.json";
import { applyAuthUI, getUser } from "./shared/auth.js";

if (!getUser()) {
  window.location.href = "login.html?next=game";
}

const countLessons = (course) =>
  course.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);

const buildCourseCard = (course) => `
  <article class="course-card">
    <div class="course-head">
      <h3>${course.title}</h3>
      <span class="pill">${course.level}</span>
    </div>
    <p class="course-summary">${course.description}</p>
    <div class="course-meta">
      <span>${course.chapters.length} chương</span>
      <span>${countLessons(course)} bài học</span>
    </div>
    <a class="primary" href="course.html?course=${course.id}">Vào khóa học</a>
  </article>
`;

const courseCards = courses.map(buildCourseCard).join("");

document.querySelector("#app").innerHTML = `
  <div class="app">
    <header class="site-header">
      <div class="brand">
        <span class="brand-mark">Py</span>Learn Arena
      </div>
      <nav class="nav">
        <a href="index.html">Trang chủ</a>
        <a class="active" href="game.html">Học qua game</a>
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
          <h2>Danh sách khóa học</h2>
          <p>Mỗi khóa có nhiều chương và bài code luyện tập.</p>
        </div>
        <div class="course-grid">
          ${courseCards}
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <span>Runtime: mở bài học để tải Pyodide</span>
      <span id="user-badge" hidden></span>
      <span>Phaser + Pyodide learning lab</span>
    </footer>
  </div>
`;

applyAuthUI();
