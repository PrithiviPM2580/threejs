import * as THREE from "three";
import "./style.css";
import {
  OrbitControls,
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
  OutputPass,
} from "three/examples/jsm/Addons.js";
import { ShapeManager } from "./shape-manager";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";

//Configuration
const CONFIG = {
  points: 300000,
  baseScale: 30.0,
  m: 0,
  n1: 0,
  n2: 0,
  n3: 0,
  a: 1,
  b: 1,
};

//Shapes
const SHAPES = [
  {
    name: "Quantum Star",
    params: { m: 7, n1: 0.2, n2: 1.7, n3: 1.7, a: 1, b: 1 },
    scaleMultiplier: 1.0,
    accent: [0x001133, 0x00ffff, 0x0066ff],
  },
  {
    name: "Hyper-Thorn",
    params: { m: 19, n1: 0.5, n2: 0.2, n3: 0.2, a: 1, b: 1 },
    scaleMultiplier: 1.5,
    accent: [0x220000, 0xff0000, 0xaa0000],
  },
  {
    name: "Void Prism",
    params: { m: 6, n1: 0.4, n2: 1, n3: 1, a: 1, b: 1 },
    scaleMultiplier: 1.2,
    accent: [0x110022, 0xff00ff, 0xaa00ff],
  },
  {
    name: "Cosmic Shell",
    params: { m: 12, n1: 0.5, n2: 0.5, n3: 0.5, a: 1, b: 1 },
    scaleMultiplier: 1.0,
    accent: [0x331100, 0xffaa00, 0xff4400],
  },
  {
    name: "Vortex Flower",
    params: { m: 5, n1: 18, n2: 4, n3: 2, a: 1, b: 1 },
    scaleMultiplier: 1.0,
    accent: [0x220022, 0xff00ff, 0xaa00aa],
  },
];

//Setup
const container = document.getElementById("canvas-container");

//Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.001);

//Camera
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  2000,
);
camera.position.set(0, 0, 75);

//Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);

//Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.5;

//Post-Processing
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85,
);
bloomPass.threshold = 0.1;
bloomPass.strength = 0.8;
bloomPass.radius = 0.4;
const outputPass = new OutputPass();
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

//Geometry and Shapes
function superShape(theta, m, n1, n2, n3, a, b) {
  let t1 = Math.abs((1 / a) * Math.cos((m * theta) / 4));
  t1 = Math.pow(t1, n2);

  let t2 = Math.abs((1 / b) * Math.sin((m * theta) / 4));
  t2 = Math.pow(t2, n3);

  let t3 = t1 + t2;
  let r = Math.pow(t3, -1 / n1);

  return r;
}

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(CONFIG.points * 3);
const lineDistances = new Float32Array(CONFIG.points);

for (let i = 0; i < CONFIG.points; i++) {
  lineDistances[i] = 1 / CONFIG.points;
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute(
  "lineDistance",
  new THREE.BufferAttribute(lineDistances, 1),
);

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: new THREE.Uniform(0),
    uTransition: new THREE.Uniform(0),
    uColorA1: new THREE.Uniform(new THREE.Color()),
    uColorA2: new THREE.Uniform(new THREE.Color()),
    uColorA3: new THREE.Uniform(new THREE.Color()),
    uColorB1: new THREE.Uniform(new THREE.Color()),
    uColorB2: new THREE.Uniform(new THREE.Color()),
    uColorB3: new THREE.Uniform(new THREE.Color()),
  },
  vertexShader,
  fragmentShader,
  blending: THREE.AdditiveBlending,
  depthTest: false,
  transparent: true,
  side: THREE.DoubleSide,
});

const line = new THREE.Line(geometry, material);
line.geometry.computeBoundingSphere();
scene.add(line);

const starsGeometry = new THREE.BufferGeometry();
const starsPositions = new Float32Array(5000 * 3);
for (let i = 0; i < 5000 * 3; i += 3) {
  starsPositions[i] = THREE.MathUtils.randFloatSpread(2000);
  starsPositions[i + 1] = THREE.MathUtils.randFloatSpread(2000);
  starsPositions[i + 2] = THREE.MathUtils.randFloatSpread(2000);
}
starsGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(starsPositions, 3),
);
const starsMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.1,
  transparent: true,
});
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

//Audio
const audio = document.getElementById("bg-music");
const btnPlay = document.getElementById("btn-play");
const btnPause = document.getElementById("btn-pause");
const btnStop = document.getElementById("btn-stop");
const eqViz = document.getElementById("eq-viz");
audio.volume = 0.7;

function playMusic() {
  audio
    .play()
    .then(() => {
      btnPlay.style.display = "none";
      btnPause.style.display = "flex";
      eqViz.classList.add("active");
    })
    .catch((error) => {
      console.error("Error playing audio:", error);
    });
}

function pauseMusic() {
  audio.pause();
  btnPause.style.display = "none";
  btnPlay.style.display = "flex";
  eqViz.classList.remove("active");
}

function stopMusic() {
  audio.pause();
  audio.currentTime = 0;
  btnPause.style.display = "none";
  btnPlay.style.display = "flex";
  eqViz.classList.remove("active");
}

btnPlay.addEventListener("click", playMusic);
btnPause.addEventListener("click", pauseMusic);
btnStop.addEventListener("click", stopMusic);

//Shape Manager
const shapeManager = new ShapeManager(
  SHAPES,
  CONFIG,
  material,
  geometry,
  superShape,
);

//Event Listeners
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  material.uniforms.uTime.value += delta;
  line.rotation.x += delta * 0.1;
  line.rotation.y += delta * 0.05;
  stars.rotation.y += delta * 0.001;
  shapeManager.update();
  controls.update();
  composer.render();
}
animate();
