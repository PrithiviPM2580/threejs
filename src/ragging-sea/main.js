import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import GUI from "lil-gui";
import "./style.css";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 2.4;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const gemotry = new THREE.PlaneGeometry(2, 2, 512, 512);

const uniforms = {
  uTime: { value: 0 },
  uBigWavesElevation: { value: 0.2 },
  uBigWaveFrequency: { value: new THREE.Vector2(4, 1.5) },
  uBigWaveSpeed: { value: 0.75 },
  uDepthColor: { value: new THREE.Color("#186691") },
  uSurfaceColor: { value: new THREE.Color("#9bd8ff") },
  uColorOffset: { value: 0.08 },
  uColorMultiplier: { value: 5 },
  uSmallWavesElevation: { value: 0.15 },
  uSmallWavesFrequency: { value: 3.0 },
  uSmallWavesSpeed: { value: 0.2 },
  uSmallWavesIterations: { value: 4.0 },
};

const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide,
  uniforms: uniforms,
  // wireframe: true,
});

// GUI setup
const gui = new GUI();
gui
  .add(uniforms.uBigWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Big Waves Elevation");

gui
  .add(uniforms.uBigWaveFrequency.value, "x")
  .min(0)
  .max(10)
  .step(0.1)
  .name("Big Waves Frequency X");

gui
  .add(uniforms.uBigWaveFrequency.value, "y")
  .min(0)
  .max(10)
  .step(0.1)
  .name("Big Waves Frequency Y");

gui
  .add(uniforms.uBigWaveSpeed, "value")
  .min(0)
  .max(5)
  .step(0.01)
  .name("Big Waves Speed");

gui
  .add(uniforms.uColorOffset, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Color Offset");

gui
  .add(uniforms.uColorMultiplier, "value")
  .min(0)
  .max(10)
  .step(0.1)
  .name("Color Multiplier");

gui
  .add(uniforms.uSmallWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Small Waves Elevation");

gui
  .add(uniforms.uSmallWavesFrequency, "value")
  .min(0)
  .max(10)
  .step(0.1)
  .name("Small Waves Frequency");

gui
  .add(uniforms.uSmallWavesSpeed, "value")
  .min(0)
  .max(5)
  .step(0.01)
  .name("Small Waves Speed");

gui
  .add(uniforms.uSmallWavesIterations, "value")
  .min(1)
  .max(10)
  .step(1)
  .name("Small Waves Iterations");

gui
  .addColor({ depthColor: "#0000ff" }, "depthColor")
  .onChange((value) => {
    uniforms.uDepthColor.value.set(value);
  })
  .name("Depth Color");

gui
  .addColor({ surfaceColor: "#8888ff" }, "surfaceColor")
  .onChange((value) => {
    uniforms.uSurfaceColor.value.set(value);
  })
  .name("Surface Color");

const plane = new THREE.Mesh(gemotry, material);
plane.rotation.x = -Math.PI * 0.3;
plane.rotation.z = -Math.PI * 0.2;
scene.add(plane);

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  uniforms.uTime.value = elapsedTime;
  controls.update();
  renderer.render(scene, camera);
}

animate();
