const baseUrl = import.meta.env.BASE_URL || "/";
const style = document.createElement("style");
style.textContent = `
@font-face {
  font-family: "Turok";
  src: url("${baseUrl}font_global/turok.ttf") format("truetype");
  font-display: swap;
}
`;
document.head.appendChild(style);
