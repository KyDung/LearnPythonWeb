// Template UI for new lessons/games (not used by the app).
// Copy this file into src/content/<course>/<lesson>/index.js and edit.

import Phaser from "phaser";
import { setupCodeFullscreen } from "../../shared/codeFullscreen.js";
import {
  isPyodideTimeout,
  withPyodideTimeout,
} from "../../shared/pyodideTimeout.js";

export default function initTemplate(root, { pyodide } = {}) {
  root.innerHTML = `
    <div class="lesson-header">
      <h2>Template Lesson</h2>
      <p>Mô tả ngắn về bài học ở đây.</p>
    </div>
    <div class="lesson-layout">
      <div class="lesson-game">
        <div class="game-card">
          <div id="phaser-root" class="phaser-frame"></div>
          <p class="game-status">Pyodide sẵn sàng. Hãy submit code.</p>
        </div>
      </div>
      <aside class="lesson-side">
        <div class="lesson-panel code-panel">
          <h3>Code</h3>
          <textarea class="code-editor" spellcheck="false"></textarea>
          <div class="code-actions">
            <button class="primary">Submit</button>
            <button class="code-toggle" type="button">Phóng to</button>
          </div>
          <p class="lesson-summary">Hướng dẫn ngắn ở đây.</p>
        </div>
        <div class="lesson-panel output-panel">Output...</div>
      </aside>
    </div>
  `;

  const status = root.querySelector(".game-status");
  const output = root.querySelector(".output-panel");
  const submitButton = root.querySelector(".primary");
  const codeInput = root.querySelector(".code-editor");
  if (codeInput) {
    codeInput.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") {
        return;
      }
      event.preventDefault();
      const start = codeInput.selectionStart;
      const end = codeInput.selectionEnd;
      const value = codeInput.value;
      codeInput.value = `${value.slice(0, start)}    ${value.slice(end)}`;
      codeInput.selectionStart = codeInput.selectionEnd = start + 4;
    });
  }

  setupCodeFullscreen(root);

  if (!pyodide) {
    if (status) {
      status.textContent = "Pyodide chưa sẵn sàng.";
    }
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add("disabled");
    }
    return;
  }

  const logLine = (text) => {
    if (!output) {
      return;
    }
    const line = document.createElement("div");
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  };

  const resetOutput = () => {
    if (output) {
      output.textContent = "";
    }
  };

  pyodide.setStdout({
    batched: (text) => {
      if (text.trim()) {
        logLine(text.trim());
      }
    },
  });

  const baseWidth = 720;
  const baseHeight = 520;
  let correctSound = null;
  let wrongSound = null;
  const ASSET_BASE = import.meta.env.BASE_URL || "/";

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "phaser-root",
    width: baseWidth,
    height: baseHeight,
    backgroundColor: "#121425",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: {
      preload() {
        this.load.audio("correct", `${ASSET_BASE}sound_global/correct.mp3`);
        this.load.audio("wrong", `${ASSET_BASE}sound_global/wrong.mp3`);
      },
      create() {
        correctSound = this.sound.add("correct");
        wrongSound = this.sound.add("wrong");
      },
    },
  });

  const playCorrect = () => correctSound && correctSound.play();
  const playWrong = () => wrongSound && wrongSound.play();

  if (submitButton && codeInput) {
    submitButton.addEventListener("click", () => {
      resetOutput();
      if (status) {
        status.textContent = "Đang chạy code...";
      }
      try {
        withPyodideTimeout(pyodide, () => {
          pyodide.runPython(codeInput.value);
        });
        if (status) {
          status.textContent = "Chạy xong. Hãy kiểm tra kết quả.";
        }
      } catch (error) {
        if (status) {
          status.textContent = isPyodideTimeout(error)
            ? "Code chạy quá lâu. Hãy kiểm tra vòng lặp."
            : "Có lỗi trong code.";
        }
        logLine(String(error));
      }
    });
  }

  return { playCorrect, playWrong };
}
