import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";

// GUI setup
const gui = new GUI();

// --- CONFIGURATION ---
const params = {};

// Scene setup
const scene = new THREE.Scene();
const bgColor = new THREE.Color(0x000000);
scene.background = bgColor;
scene.fog = new THREE.FogExp2(bgColor, 0.05);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

// Camera setup
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100,
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

//Base Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
});
const points = new THREE.Points(geometry, material);
scene.add(points);

// --- LOOP ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  controls.update();
  renderer.render(scene, camera);
}

// Handle Resize with FXAA update
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = renderer.getPixelRatio();

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
});

animate();
