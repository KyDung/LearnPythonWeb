import "./style.css";
import courses from "./data/courses.json";
import { applyAuthUI, getUser } from "./shared/auth.js";

const params = new URLSearchParams(window.location.search);
const courseId = params.get("course");

if (!getUser()) {
  const redirect = courseId
    ? `login.html?next=course&course=${encodeURIComponent(courseId)}`
    : "login.html?next=game";
  window.location.href = redirect;
}

const course = courseId
  ? courses.find((item) => item.id === courseId)
  : null;

const buildLessonItem = (courseSlug, lesson) => {
  const gameCount = Array.isArray(lesson.games) ? lesson.games.length : 0;
  const lessonAction =
    gameCount > 0
      ? `<a class="lesson-cta" href="lesson.html?course=${courseSlug}&lesson=${lesson.id}">Xem game (${gameCount})</a>`
      : '<span class="lesson-cta disabled">Chưa có game</span>';
  const actions = `<div class="lesson-actions">${lessonAction}</div>`;

  return `
    <li class="lesson-item">
      <div>
        <div class="lesson-title">${lesson.title}</div>
        <div class="lesson-summary">${lesson.summary}</div>
      </div>
      ${actions}
    </li>
  `;
};

const buildChapter = (courseSlug, chapter) => {
  const lessons = chapter.lessons
    .map((lesson) => buildLessonItem(courseSlug, lesson))
    .join("");

  return `
    <article class="chapter-card">
      <div class="chapter-head">
        <h3>${chapter.title}</h3>
        <span>${chapter.lessons.length} bài</span>
      </div>
      <ul class="lesson-list">
        ${lessons}
      </ul>
    </article>
  `;
};

const buildContent = () => {
  if (!course) {
    return `
      <div class="notice error">
        <p>Không tìm thấy khóa học. Vui lòng chọn lại.</p>
        <a class="ghost" href="game.html">Quay lại danh sách</a>
      </div>
    `;
  }

  const chapters = course.chapters
    .map((chapter) => buildChapter(course.id, chapter))
    .join("");

  return `
    <section class="section">
      <div class="section-header">
        <h2>${course.title}</h2>
        <p>${course.description}</p>
      </div>
      <div class="chapter-grid">
        ${chapters}
      </div>
    </section>
  `;
};

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
      ${buildContent()}
    </main>

    <footer class="site-footer">
      <span>Runtime: mở bài học để tải Pyodide</span>
      <span id="user-badge" hidden></span>
      <span>Phaser + Pyodide learning lab</span>
    </footer>
  </div>
`;

applyAuthUI();
