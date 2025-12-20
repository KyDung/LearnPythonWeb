export const setupCodeFullscreen = (root) => {
  const panel = root.querySelector(".code-panel");
  const toggle = root.querySelector(".code-toggle");
  if (!panel || !toggle) {
    return;
  }

  const setState = (isFullscreen) => {
    panel.classList.toggle("fullscreen", isFullscreen);
    document.body.classList.toggle("no-scroll", isFullscreen);
    toggle.textContent = isFullscreen ? "Thu nhỏ" : "Phóng to";
  };

  toggle.addEventListener("click", () => {
    setState(!panel.classList.contains("fullscreen"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("fullscreen")) {
      setState(false);
    }
  });
};
