import Phaser from "phaser";
import { setupCodeFullscreen } from "../../../shared/codeFullscreen.js";
import {
  isPyodideTimeout,
  withPyodideTimeout,
} from "../../../shared/pyodideTimeout.js";

const ORIGINAL_NAME = "Nguyễn Anh Long";
const BROKEN_NAME = `${ORIGINAL_NAME}g`;
const ASSET_BASE = import.meta.env.BASE_URL || "/";

const buildLayout = () => `
  <div class="lesson-header">
    <h2>Cắt ký tự thừa</h2>
    <p>
      Long vừa hoàn thành hồ sơ xin học bổng du học và cẩn thận gửi profile của mình tới trường đại học mơ ước.
Mọi thông tin đều hoàn hảo… cho đến khi Long kiểm tra lại email xác nhận và hoảng hốt phát hiện một lỗi nhỏ nhưng nguy hiểm 😱. Tên của Long ở cuối hồ sơ bị viết thừa một chữ g, khiến tên không còn chính xác nữa.
Nếu không sửa kịp thời, hồ sơ có thể bị đánh giá sai hoặc thậm chí bị loại! Là người hỗ trợ kỹ thuật, bạn được nhờ giúp Long chỉnh sửa lại tên cho đúng trước khi hội đồng xét duyệt bắt đầu xem xét hồ sơ.
<br/>Lưu ý:
<br/>- Viết đoạn code trong khu vực được đánh dấu từ # Bắt đầu đến # Kết thúc
<br/>- Biến text đang lưu chuỗi tên hiện tại của Long (có thừa chữ g ở cuối)
<br/>- Không được thay đổi trực tiếp giá trị của text
<br/>💡Nhiệm vụ của bạn:
<br/>- Viết hàm <code>remove_last_char(text)</code>
<br/>- Viết code Python để cắt bỏ chữ g dư thừa ở cuối chuỗi
<br/>- Lưu tên đúng sau khi sửa vào biến result
<br/>⏰Hãy nhanh tay sửa lỗi giúp Long, vì học bổng chỉ chờ những hồ sơ chính xác nhất! 🎓✨
    </p>
  </div>
  <div class="lesson-layout">
    <div class="lesson-game">
      <div class="game-card">
        <div id="phaser-root" class="phaser-frame"></div>
        <p class="game-status" id="status">Đang tải Pyodide...</p>
      </div>
    </div>
    <aside class="lesson-side">
      <div class="lesson-panel code-panel">
        <h3>Code</h3>
        <textarea id="code-input" class="code-editor" spellcheck="false">
def remove_last_char(text):
    # Bắt đầu

    # Kết thúc
    return result
</textarea>
        <div class="code-actions">
          <button class="primary" id="submit-code">Submit</button>
          <button class="code-toggle" type="button">Phóng to</button>
        </div>
      </div>
      <div class="lesson-panel output-panel" id="output"></div>
    </aside>
  </div>
`;

export default function initGame(root, { pyodide } = {}) {
  root.innerHTML = buildLayout();

  const status = root.querySelector("#status");
  const output = root.querySelector("#output");
  const submitButton = root.querySelector("#submit-code");
  const codeInput = root.querySelector("#code-input");

  let phaserGame = null;

  const logLine = (text) => {
    const line = document.createElement("div");
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  };

  const resetOutput = () => {
    output.textContent = "";
  };

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

  setupCodeFullscreen(root);

  const startPhaser = () => {
    if (phaserGame) {
      phaserGame.destroy(true);
      phaserGame = null;
    }

    let nameText = null;
    let correctSound = null;
    let wrongSound = null;
    const baseWidth = 720;
    const baseHeight = 520;

    phaserGame = new Phaser.Game({
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
          this.load.image("BG", `${ASSET_BASE}t10-cd-b12-id2/bg.png`);
        },
        create() {
          correctSound = this.sound.add("correct");
          wrongSound = this.sound.add("wrong");
          const bg = this.add.image(0, 0, "BG").setOrigin(0);
          bg.displayWidth = this.scale.gameSize.width;
          bg.displayHeight = this.scale.gameSize.height;
          nameText = this.add.text(300, 170, BROKEN_NAME, {
            fontFamily: "Space Grotesk, sans-serif",
            bold: true,
            fontSize: "20px",
            color: "#120404ff",
          });
        },
      },
    });

    return {
      setDisplay: (text, isCorrect) => {
        if (!nameText) {
          return;
        }
        nameText.setText(text);
        nameText.setColor(isCorrect ? "#055e1bff" : "#000000ff");
      },
      playCorrect: () => correctSound && correctSound.play(),
      playWrong: () => wrongSound && wrongSound.play(),
    };
  };

  const ui = startPhaser();

  if (!pyodide) {
    status.textContent = "Pyodide chưa sẵn sàng.";
    submitButton.disabled = true;
    submitButton.classList.add("disabled");
  } else {
    status.textContent = "Pyodide sẵn sàng. Hãy submit code.";
    pyodide.setStdout({
      batched: (text) => {
        if (text.trim()) {
          logLine(text.trim());
        }
      },
    });
  }

  submitButton.addEventListener("click", () => {
    resetOutput();
    status.textContent = "Đang chấm bài...";
    try {
      withPyodideTimeout(pyodide, () => {
        pyodide.runPython(codeInput.value);
      });
      const fn = pyodide.globals.get("remove_last_char");
      if (!fn) {
        status.textContent = "Chưa thấy hàm remove_last_char(text).";
        return;
      }
      const resultProxy = withPyodideTimeout(pyodide, () => fn(BROKEN_NAME));
      const resultText = String(resultProxy);
      if (resultProxy?.destroy) {
        resultProxy.destroy();
      }
      if (!resultText.trim()) {
        status.textContent = "Kết quả rỗng.";
        return;
      }
      if (resultText === ORIGINAL_NAME) {
        status.textContent = "Đúng! Bạn đã sửa tên cửa hàng.";
        ui.setDisplay(resultText, true);
        ui.playCorrect();
      } else {
        status.textContent = "Sai. Hãy thử lại.";
        ui.setDisplay(resultText, false);
        ui.playWrong();
      }
    } catch (error) {
      if (isPyodideTimeout(error)) {
        status.textContent = "Code chạy quá lâu. Hãy kiểm tra vòng lặp.";
      } else {
        status.textContent = "Có lỗi trong code.";
      }
      logLine(String(error));
    }
  });
}
