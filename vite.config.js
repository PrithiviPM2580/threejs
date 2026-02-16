import { defineConfig } from "vite";
import { glob } from "glob";
import path from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        "galaxy-generator": path.resolve(
          __dirname,
          "src/galaxy generator/index.html",
        ),
      },
    },
  },
  server: {
    middlewareMode: false,
  },
});
