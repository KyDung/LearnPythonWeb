import "./style.css";
import "./shared/fonts.js";
import { loadPyodide } from "pyodide";
import courses from "./data/courses.json";
import { applyAuthUI, getUser } from "./shared/auth.js";

const params = new URLSearchParams(window.location.search);
const pathParam = params.get("path");

if (!getUser()) {
  const redirect = pathParam
    ? `login.html?next=play&path=${encodeURIComponent(pathParam)}`
    : "login.html";
  window.location.href = redirect;
}

const findGameByPath = (path) => {
  for (const course of courses) {
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        const games = Array.isArray(lesson.games) ? lesson.games : [];
        for (const game of games) {
          if (game.path === path) {
            return { course, chapter, lesson, game };
          }
        }
      }
    }
  }
  return null;
};

const gameInfo = pathParam ? findGameByPath(pathParam) : null;
const gameTitle = gameInfo ? gameInfo.game.title : "Game";
const lessonTitle = gameInfo ? gameInfo.lesson.title : "";
const courseTitle = gameInfo ? gameInfo.course.title : "";
const backLink =
  gameInfo && gameInfo.lesson
    ? `lesson.html?course=${gameInfo.course.id}&lesson=${gameInfo.lesson.id}`
    : "game.html";

const contentModules = import.meta.glob("./content/**/index.js");
const contentModulePath = pathParam
  ? `./content/${pathParam}/index.js`
  : null;

const buildGameHeader = () => {
  const subtitle = [courseTitle, lessonTitle].filter(Boolean).join(" · ");
  const subtitleLine = subtitle
    ? `<span class="game-meta">${subtitle}</span>`
    : "";
  return `
    <div class="game-head">
      <div>
        <h2>${gameTitle}</h2>
        ${subtitleLine}
      </div>
      <a class="ghost" href="${backLink}">Quay lại</a>
    </div>
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
      <section class="section game-shell">
        ${buildGameHeader()}
        <div class="game-stage" id="game-root">
          <p class="notice">Đang tải game...</p>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <span id="runtime-status">Runtime: đang tải Pyodide...</span>
      <span id="user-badge" hidden></span>
      <span>Phaser + Pyodide learning lab</span>
    </footer>
  </div>
`;

const gameRoot = document.querySelector("#game-root");
const status = document.querySelector("#runtime-status");

const showError = (message) => {
  gameRoot.innerHTML = `
    <div class="notice error">
      <p>${message}</p>
      <a class="ghost" href="game.html">Quay lại danh sách</a>
    </div>
  `;
};

const loadGame = async () => {
  if (!pathParam || !contentModulePath || !contentModules[contentModulePath]) {
    showError("Không tìm thấy nội dung. Vui lòng chọn lại bài học.");
    return;
  }

  let pyodide = null;
  try {
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/",
    });
    const result = pyodide.runPython("1 + 1");
    status.textContent = `Runtime: Pyodide sẵn sàng (${result})`;
  } catch (error) {
    status.textContent = "Runtime: Pyodide không tải được";
    console.error(error);
  }

  try {
    const module = await contentModules[contentModulePath]();
    const init = module.default;
    if (typeof init === "function") {
      init(gameRoot, { pyodide });
    } else {
      showError("Game chưa có hàm khởi tạo.");
    }
  } catch (error) {
    showError("Không thể tải game. Kiểm tra lại file game.");
    console.error(error);
  }
};

loadGame();

applyAuthUI();
