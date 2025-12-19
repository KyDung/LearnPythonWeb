import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/LearnPythonWeb/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        game: resolve(__dirname, "game.html"),
        course: resolve(__dirname, "course.html"),
        lesson: resolve(__dirname, "lesson.html"),
        play: resolve(__dirname, "play.html"),
        login: resolve(__dirname, "login.html"),
        profile: resolve(__dirname, "profile.html"),
      },
    },
  },
});
