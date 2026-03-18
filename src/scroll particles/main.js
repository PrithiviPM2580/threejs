import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";
import t1 from "/pngs/car.png";
import t2 from "/pngs/heart.png";
import mask from "/pngs/mask.jpg";

// GUI setup
const gui = new GUI();

// --- CONFIGURATION ---
const params = {
  size: 1000,
  progress: 0,
};

// Texture loading
const textureLoader = new THREE.TextureLoader();
const textures = [textureLoader.load(t1), textureLoader.load(t2)];
const maskTexture = textureLoader.load(mask);

// Scene setup
const scene = new THREE.Scene();
const bgColor = new THREE.Color(0x000000);
scene.background = bgColor;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

// Camera setup
const camera = new THREE.PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.01,
  3000,
);
camera.position.z = 1000;
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
// renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = false;
controls.enablePan = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Base geometry: dense grid so Points has many vertices to render.
const geometry = new THREE.BufferGeometry();
const count = 512 * 512;
const positions = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
const coordinates = new THREE.BufferAttribute(new Float32Array(count * 3), 3);
let index = 0;
for (let i = 0; i < 512; i++) {
  let posX = i - 256;
  for (let j = 0; j < 512; j++) {
    positions.setXYZ(index, posX * 2, (j - 256) * 2, 0);
    coordinates.setXYZ(index, i, j, 0);
    index++;
  }
}

geometry.setAttribute("position", positions);
geometry.setAttribute("aCoordinates", coordinates);
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uSize: new THREE.Uniform(params.size),
    uProgress: new THREE.Uniform(params.progress),
    uPixelRatio: new THREE.Uniform(sizes.pixelRatio),
    uTexture1: new THREE.Uniform(textures[0]),
    uTexture2: new THREE.Uniform(textures[1]),
    uMaskTexture: new THREE.Uniform(maskTexture),
  },
  side: THREE.DoubleSide,
  transparent: true,
  depthTest: false,
  depthWrite: false,
});
const points = new THREE.Points(geometry, material);
scene.add(points);

gui.add(params, "size", 0, 10000).onChange((value) => {
  material.uniforms.uSize.value = value;
});
gui.add(params, "progress", 0, 1).onChange((value) => {
  material.uniforms.uProgress.value = value;
});

// --- LOOP ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  material.uniforms.uTime.value = elapsedTime;

  controls.update();
  renderer.render(scene, camera);
}

// Handle Resize with FXAA update
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = Math.min(window.devicePixelRatio, 2);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(pixelRatio);
  material.uniforms.uPixelRatio.value = pixelRatio;
});

animate();
