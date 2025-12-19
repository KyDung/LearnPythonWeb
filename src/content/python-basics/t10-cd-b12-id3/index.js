import Phaser from "phaser";

const FOOD_LIST =
  "Pizza&Sushi&Burger&Phở&Bún chả&Bánh mì&Ramen&Tacos&Paella&Lasagna&Spaghetti Carbonara&Pad Thai&Tom Yum&Curry Ấn Độ&Butter Chicken&Kebab&Shawarma&Peking Duck&Dim Sum&Hotpot&Bibimbap&Kimchi&Bulgogi&Gimbap&Miso Soup&Udon&Tempura&Okonomiyaki&Takoyaki&Sashimi&Croissant&Baguette&Crêpe&Ratatouille&Coq au Vin&Beef Bourguignon&Fish and Chips&Shepherd's Pie&Roast Beef&Apple Pie&Hamburger Steak&Fried Chicken&Mac and Cheese&Clam Chowder&Lobster Roll&Caesar Salad&Greek Salad&Hummus&Falafel&Baklava&Couscous&Tagine&Jollof Rice&Egusi Soup&Fufu&Ceviche&Empanada&Arepa&Feijoada&Churrasco&Pão de Queijo&Tiramisu&Risotto&Gnocchi&Gelato&Panna Cotta&Biryani&Samosa&Naan&Dal&Satay&Nasi Goreng&Rendang&Laksa&Char Kway Teow&Hainanese Chicken Rice&Chili con Carne&Burrito&Quesadilla&Nachos&Pancakes&Waffles&French Toast&Omelette&Quiche&Dumplings&Pierogi&Goulash&Schnitzel&Pretzel&Sauerbraten&Pâté&Fondue&Raclette&Borscht&Pelmeni&Stroganoff&Pirozhki&Tandoori Chicken&Ice Cream";
const TARGET_FOOD = "Phở";
const ASSET_BASE = import.meta.env.BASE_URL || "/";

const buildLayout = () => `
  <div class="lesson-header">
    <h2>Tìm món Phở</h2>
    <p>
      My vừa tình cờ tìm thấy một website nước ngoài đang đăng bài xếp hạng 100 món ăn ngon nhất thế giới. Vì quá tò mò, My muốn kiểm tra xem món Phở của Việt Nam có xuất hiện trong danh sách này không. Danh sách trên web được lưu dưới dạng một chuỗi dài, trong đó mỗi món ăn được ngăn cách bởi dấu & (kiểu tên&tên&tên...). Cuối cũng My nhìn thấy có một chức cho phép nhập tên món ăn để kiểm tra xem món đó có nằm trong top 100 hay không, nhưng có vẻ chức năng này đang không hoạt động hãy giúp My code chức năng kiểm tra này cho trang web nhé!
<br/> Lưu ý:
<br/>- Viết đoạn code trong khu vực được đánh dấu từ # Bắt đầu đến # Kết thúc
<br/>- Biến text lưu chuỗi Top 100 món ăn theo định dạng: tên&tên&tên...
<br/>- Bạn chỉ cần kiểm tra có món “Phở” trong chuỗi hay không (không cần tìm vị trí)
<br/>Nhiệm vụ của bạn:
<br/>- Kiểm tra xem trong chuỗi text có chứa món “Phở” hay không
<br/>- Lưu giá trị trả về True/False vào biến result
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
def has_pho(text):
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

    let foodText = null;
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
          this.load.image("BG", `${ASSET_BASE}t10-cd-b12-id3/bg.png`);
          this.load.audio("correct", `${ASSET_BASE}sound_global/correct.mp3`);
          this.load.audio("wrong", `${ASSET_BASE}sound_global/wrong.mp3`);
        },
        create() {
          correctSound = this.sound.add("correct");
          wrongSound = this.sound.add("wrong");
          const bg = this.add.image(0, 0, "BG").setOrigin(0);
          bg.displayWidth = this.scale.gameSize.width;
          bg.displayHeight = this.scale.gameSize.height;
          foodText = this.add.text(167, 250, "", {
            fontFamily: "IBM Plex Sans, sans-serif",
            fontSize: "26px",
            color: "#ffdea3",
            wordWrap: { width: 650 },
          });
          PhoText = this.add.text(170, 188, "Phở", {
            fontFamily: "Space Grotesk, sans-serif",
            bold: true,
            fontSize: "20px",
            color: "#120404ff",
          });
        },
      },
    });

    return {
      setResult: (text, isCorrect) => {
        if (!foodText) {
          return;
        }
        foodText.setText(text);
        foodText.setColor(isCorrect ? "#055e1bff" : "#ffb3b3");
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
      const fn = pyodide.globals.get("has_pho");
      if (!fn) {
        status.textContent = "Chưa thấy hàm has_pho(text).";
        return;
      }
      const resultProxy = fn(FOOD_LIST);
      const resultValue = String(resultProxy).toLowerCase() === "true";
      if (resultProxy?.destroy) {
        resultProxy.destroy();
      }
      const expected = FOOD_LIST.includes(TARGET_FOOD);
      if (resultValue === expected) {
        status.textContent = "Đúng! Bạn đã kiểm tra chính xác.";
        ui.setResult("There's Pho that's in the top 100.", true);
        ui.playCorrect();
      } else {
        status.textContent = "Sai. Hãy thử lại.";
        ui.setResult("Pho is not in the top 100.", false);
        ui.playWrong();
      }
    } catch (error) {
      status.textContent = "Có lỗi trong code.";
      logLine(String(error));
    }
  });
}
