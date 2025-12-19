import Phaser from "phaser";

const ORIGINAL_NAME = "TIỆM KEM MÙA HÈ";
const REVERSED_NAME = [...ORIGINAL_NAME].reverse().join("");
const ASSET_BASE = import.meta.env.BASE_URL || "/";

const buildLayout = () => `
  <div class="lesson-header">
    <h2>Đảo chuỗi - Tiệm kem</h2>
    <p>
      Trong một khu rừng nhỏ, có một tiệm kem nổi tiếng nhưng hôm nay biển hiệu của nó gặp sự cố kỳ lạ.
      Do bạn nhỏ nghịch nghợm nào đó đã đảo ngược toàn bộ thứ sắp xếp của các kí tự trong tên biển hiệu, tên tiệm kem trên màn hình đã bị đảo ngược từng ký tự, khiến không ai có thể đọc được nữa.
      <br/> Là một lập trình viên trẻ được giao nhiệm vụ “cứu nguy”, bạn cần giải mã chuỗi ký tự bị đảo này để khôi phục lại đúng tên của tiệm kem trước khi cửa hàng mở cửa đón khách.
      <br/> Lưu ý:
      <br/>- Viết đoạn code trong khu vực được đánh dấu từ # Bắt đầu đến # Kết thúc
      <br/>- Biến text lưu chuỗi kí tự bị đảo ngược hiện tại (chưa được sửa)
      <br/>💡 Nhiệm vụ của bạn:
<br/>- Đảo ngược chuỗi ký tự đang hiển thị trên màn hình
<br/>- Lưu tên tiệm kem đúng sau khi đảo lại vào biến result
<br/>- ⏱️ Hãy nhanh tay hoàn thành nhiệm vụ trước khi khách hàng kéo đến nhé!
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
        <button class="primary" id="submit-code">Submit</button>
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
          this.load.image("BG", `${ASSET_BASE}t10-cd-b12-id1/bg.png`);
          this.load.audio("correct", `${ASSET_BASE}sound_global/correct.mp3`);
          this.load.audio("wrong", `${ASSET_BASE}sound_global/wrong.mp3`);
        },
        create() {
          correctSound = this.sound.add("correct");
          wrongSound = this.sound.add("wrong");
          const bg = this.add.image(0, 0, "BG").setOrigin(0);
          bg.displayWidth = this.scale.gameSize.width;
          bg.displayHeight = this.scale.gameSize.height;
          nameText = this.add.text(247, 125, REVERSED_NAME, {
            fontFamily: "Space Grotesk, sans-serif",
            bold: true,
            fontSize: "28px",
            color: "#a51515ff",
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
        nameText.setColor(isCorrect ? "#055e1bff" : "#e91616ff");
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
      pyodide.runPython(codeInput.value);
      const fn = pyodide.globals.get("fix_name");
      if (!fn) {
        status.textContent = "Chưa thấy hàm fix_name(text).";
        return;
      }
      const resultProxy = fn(REVERSED_NAME);
      const resultText = String(resultProxy);
      if (resultProxy?.destroy) {
        resultProxy.destroy();
      }
      if (!resultText.trim()) {
        status.textContent = "Kết quả rỗng.";
        return;
      }
      if (resultText === ORIGINAL_NAME) {
        status.textContent = "Đúng! Bạn đã đảo chuỗi thành công.";
        ui.setDisplay(resultText, true);
        ui.playCorrect();
      } else {
        status.textContent = "Sai. Hãy thử lại.";
        ui.setDisplay(resultText, false);
        ui.playWrong();
      }
    } catch (error) {
      status.textContent = "Có lỗi trong code.";
      logLine(String(error));
    }
  });
}
