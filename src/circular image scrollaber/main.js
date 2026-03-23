import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { extendMSDFMaterial, TextGeometry } from "three-msdf-text";
import GUI from "lil-gui";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";
import VirtualScroll from "virtual-scroll";

// GUI setup
const gui = new GUI();

const parameters = {};

const TEXT = [
  "Serenity",
  "Ethereal",
  "Luminous",
  "Ephemeral",
  "Euphoria",
  "Harmony",
  "Radiance",
  "Bliss",
  "Enchanted",
  "Tranquility",
];
let position = 0;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdeefd6);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

// Camera setup
const camera = new THREE.PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.1,
  1000,
);
camera.position.z = 16;
// const frustumSize = 1;
// const aspect = sizes.width / sizes.height;
// const camera = new THREE.OrthographicCamera(
//   (-frustumSize * aspect) / 2,
//   (frustumSize * aspect) / 2,
//   frustumSize / 2,
//   -frustumSize / 2,
//   0.1,
//   1000,
// );
scene.add(camera);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
document.body.appendChild(renderer.domElement);

// Orbit Controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

let textMaterial = null;

const group = new THREE.Group();
scene.add(group);

//Base Geometry
(async () => {
  const textureLoader = new THREE.TextureLoader();
  const fileLoader = new THREE.FileLoader();
  fileLoader.setResponseType("json");

  try {
    const [atlas, font] = await Promise.all([
      textureLoader.loadAsync("/fonts/limelight/limelight.png"),
      fileLoader.loadAsync("/fonts/limelight/limelight.json"),
    ]);

    textMaterial = extendMSDFMaterial(
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
      }),
      { atlas },
    );

    const textSize = 1.8;
    const lineGap = textSize * 1.1;
    const totalHeight = (TEXT.length - 1) * lineGap;

    TEXT.forEach((text, index) => {
      const geometry = new TextGeometry({
        font,
        text: text.toUpperCase(),
        size: textSize,
      });
      geometry.center();

      const mesh = new THREE.Mesh(geometry, textMaterial);
      mesh.position.y = totalHeight * 0.5 - index * lineGap;
      group.add(mesh);
    });
  } catch (error) {
    console.error("Failed to load MSDF text assets:", error);
  }
})();

// Handle window resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
  camera.aspect = sizes.width / sizes.height;

  if (textMaterial?.uniforms?.uResolution?.value) {
    textMaterial.uniforms.uResolution.value.set(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio,
    );
  }

  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

const virtualScroll = new VirtualScroll();
virtualScroll.on((event) => {
  position += event.y / 2000;
  console.log(position);
});

const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  group.position.y = -position;

  // controls.update();
  renderer.render(scene, camera);
}

animate();
