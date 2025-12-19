import "./style.css";
import courses from "./data/courses.json";
import { applyAuthUI, getUser } from "./shared/auth.js";

const params = new URLSearchParams(window.location.search);
const courseId = params.get("course");
const lessonId = params.get("lesson");

if (!getUser()) {
  const redirect =
    courseId && lessonId
      ? `login.html?next=lesson&course=${encodeURIComponent(
          courseId
        )}&lesson=${encodeURIComponent(lessonId)}`
      : "login.html?next=game";
  window.location.href = redirect;
}

const findLesson = () => {
  for (const course of courses) {
    if (course.id !== courseId) {
      continue;
    }
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.id === lessonId) {
          return { course, chapter, lesson };
        }
      }
    }
  }
  return null;
};

const data = findLesson();

const buildGameItem = (game) => {
  const path = game?.path ? game.path.trim() : "";
  const action = path
    ? `<a class="lesson-cta" href="play.html?path=${encodeURIComponent(
        path
      )}">Chơi game</a>`
    : '<span class="lesson-cta disabled">Chưa có</span>';

  return `
    <li class="lesson-item">
      <div>
        <div class="lesson-title">${game.title}</div>
        <div class="lesson-summary">${game.summary || ""}</div>
      </div>
      <div class="lesson-actions">${action}</div>
    </li>
  `;
};

const buildContent = () => {
  if (!data) {
    return `
      <div class="notice error">
        <p>Không tìm thấy bài học. Vui lòng chọn lại.</p>
        <a class="ghost" href="game.html">Quay lại danh sách</a>
      </div>
    `;
  }

  const games = Array.isArray(data.lesson.games) ? data.lesson.games : [];
  const gameList = games.length
    ? games.map(buildGameItem).join("")
    : `<li class="lesson-item">
        <div>
          <div class="lesson-title">Chưa có game</div>
          <div class="lesson-summary">Bài học này chưa có game nào.</div>
        </div>
        <div class="lesson-actions">
          <span class="lesson-cta disabled">Chưa có</span>
        </div>
      </li>`;

  return `
    <section class="section">
      <div class="section-header">
        <h2>${data.lesson.title}</h2>
        <p>${data.lesson.summary || ""}</p>
      </div>
      <div class="course-meta">
        <span>${data.course.title}</span>
        <span>${data.chapter.title}</span>
      </div>
      <ul class="lesson-list">
        ${gameList}
      </ul>
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
      <span>Runtime: mở game để tải Pyodide</span>
      <span id="user-badge" hidden></span>
      <span>Phaser + Pyodide learning lab</span>
    </footer>
  </div>
`;

applyAuthUI();
