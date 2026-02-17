import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import glsl from "vite-plugin-glsl";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [glsl()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        "galaxy-generator": path.resolve(
          __dirname,
          "src/galaxy generator/index.html",
        ),
        raycaster: path.resolve(__dirname, "src/raycaster/index.html"),
        "raw-shader": path.resolve(__dirname, "src/raw-shader/index.html"),
      },
    },
  },
  server: {
    middlewareMode: false,
  },
});
