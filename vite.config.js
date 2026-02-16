import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        "galaxy-generator": path.resolve(
          __dirname,
          "src/galaxy generator/index.html",
        ),
        raycaster: path.resolve(__dirname, "src/raycaster/index.html"),
      },
    },
  },
  server: {
    middlewareMode: false,
  },
});
