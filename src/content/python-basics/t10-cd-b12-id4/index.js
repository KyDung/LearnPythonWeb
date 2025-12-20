import Phaser from "phaser";
import { setupCodeFullscreen } from "../../../shared/codeFullscreen.js";
import {
  isPyodideTimeout,
  withPyodideTimeout,
} from "../../../shared/pyodideTimeout.js";

const ORIGINAL_NAME = "Ca sĩ Sơn Ca";
const BROKEN_NAME = "Ca sĩ Vịt Ca";
const ASSET_BASE = import.meta.env.BASE_URL || "/";

const buildLayout = () => `
  <div class="lesson-header">
    <h2>Đổi tên ca sĩ</h2>
    <p>
      Giữa trung tâm thành phố, trên mặt tiền của một tòa nhà lớn đang treo màn hình LED khổng lồ để quảng bá cho đêm nhạc sắp diễn ra. Tên ca sĩ chính dự kiến biểu diễn là “Ca sĩ Sơn Ca”, nhưng khi màn hình vừa bật lên, mọi người phát hiện một lỗi rất oái oăm 😮. Do nhầm lẫn trong dữ liệu, tên hiển thị trên màn hình lại trở thành “Ca sĩ Vịt Ca”.
Nếu không sửa kịp thời, hình ảnh quảng bá sẽ gây hiểu nhầm cho hàng nghìn người đi ngang qua. Bạn được giao nhiệm vụ can thiệp nhanh vào hệ thống hiển thị để chỉnh sửa lại tên ca sĩ cho chính xác.
<br/>Lưu ý:
<br/>- Viết đoạn code trong khu vực được đánh dấu từ # Bắt đầu đến # Kết thúc
<br/>- Biến text đang lưu chuỗi hiển thị hiện tại trên màn hình LED
<br/>- Không được thay đổi trực tiếp biến text
<br/>💡 Nhiệm vụ của bạn:
<br/>- Sử dụng thao tác thay thế chuỗi để:
<br/>- Thay chữ “Vịt” bằng chữ “Sơn” trong chuỗi hiển thị
<br/>- Lưu tên ca sĩ sau khi sửa đúng vào biến result
<br/>🟢 Hãy nhanh tay sửa lỗi hiển thị, để màn hình LED kịp thời quảng bá đúng tên Ca sĩ Sơn Ca trước giờ diễn ra sự kiện nhé!
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
def fix_name(text):
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
          this.load.image("BG", `${ASSET_BASE}t10-cd-b12-id4/bg.png`);
          this.load.audio("correct", `${ASSET_BASE}sound_global/correct.mp3`);
          this.load.audio("wrong", `${ASSET_BASE}sound_global/wrong.mp3`);
        },
        create() {
          correctSound = this.sound.add("correct");
          wrongSound = this.sound.add("wrong");
          const bg = this.add.image(0, 0, "BG").setOrigin(0);
          bg.displayWidth = this.scale.gameSize.width;
          bg.displayHeight = this.scale.gameSize.height;
          nameText = this.add.text(350, 210, BROKEN_NAME, {
            fontFamily: "Turok",
            bold: true,
            fontSize: "45px",
            color: "#4e0b0bff",
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
        nameText.setFontFamily("Turok");
        nameText.setColor(isCorrect ? "#055e1bff" : "#ffb3b3");
      },
      playCorrect: () => correctSound && correctSound.play(),
      playWrong: () => wrongSound && wrongSound.play(),
    };
  };

  let ui = {
    setDisplay: () => {},
    playCorrect: () => {},
    playWrong: () => {},
  };

  const startAfterFont = () => {
    ui = startPhaser();
  };

  if (document.fonts && document.fonts.load) {
    document.fonts
      .load('45px "Turok"')
      .then(startAfterFont)
      .catch(startAfterFont);
  } else {
    startAfterFont();
  }

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
      const fn = pyodide.globals.get("fix_name");
      if (!fn) {
        status.textContent = "Chưa thấy hàm fix_name(text).";
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
        status.textContent = "Đúng! Bạn đã đổi tên thành công.";
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
