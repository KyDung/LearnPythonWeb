// Template UI for new lessons/games (not used by the app).
// Copy this file into src/content/<course>/<lesson>/index.js and edit.

import Phaser from "phaser";

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
          <button class="primary">Submit</button>
          <p class="lesson-summary">Hướng dẫn ngắn ở đây.</p>
        </div>
        <div class="lesson-panel output-panel">Output...</div>
      </aside>
    </div>
  `;

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

  if (!pyodide) {
    return;
  }

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

  return { playCorrect, playWrong };
}
