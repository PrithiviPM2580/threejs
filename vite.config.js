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
        "shader-pattern": path.resolve(
          __dirname,
          "src/shader-pattern/index.html",
        ),
        "ragging-sea": path.resolve(__dirname, "src/ragging-sea/index.html"),
        hologram: path.resolve(__dirname, "src/hologram/index.html"),
        coffee: path.resolve(__dirname, "src/coffee/index.html"),
        firework: path.resolve(__dirname, "src/firework/index.html"),
        "light-shading": path.resolve(
          __dirname,
          "src/light shading/index.html",
        ),
        "halftone-shading": path.resolve(
          __dirname,
          "src/halftone  shading/index.html",
        ),
        earth: path.resolve(__dirname, "src/earth/index.html"),
        "cursor-particle": path.resolve(
          __dirname,
          "src/cursor particle/index.html",
        ),
        "particle-morphing": path.resolve(
          __dirname,
          "src/particle morphing/index.html",
        ),
        "gpgpu-field": path.resolve(__dirname, "src/gpgpu field/index.html"),
        particles: path.resolve(__dirname, "src/particles/index.html"),
        "beyonce-particle": path.resolve(
          __dirname,
          "src/beyonce particle/index.html",
        ),
        "infinite-brick": path.resolve(
          __dirname,
          "src/infinite brick/index.html",
        ),
        "cube-instance": path.resolve(
          __dirname,
          "src/cube instance/index.html",
        ),
        "image-distortion": path.resolve(
          __dirname,
          "src/image distortion/index.html",
        ),
        practice: path.resolve(__dirname, "src/practice/index.html"),
        "interactive-particles": path.resolve(
          __dirname,
          "src/interactive particles/index.html",
        ),
        "pixel-frequency": path.resolve(
          __dirname,
          "src/pixel frequency/index.html",
        ),
      },
    },
  },
  server: {
    middlewareMode: false,
  },
});
