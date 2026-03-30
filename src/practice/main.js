import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { AsciiEffect, TrackballControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";
import "./style.css";
// import fragmentShader from "./shader/fragment.glsl";
// import vertexShader from "./shader/vertex.glsl";

// GUI setup
const gui = new GUI();
let effect;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

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

effect = new AsciiEffect(renderer, " .,:;i1tfLCG08@", { invert: false });
effect.setSize(sizes.width, sizes.height);
effect.domElement.style.color = "white";
effect.domElement.style.backgroundColor = "transparent";
effect.domElement.style.position = "fixed";
effect.domElement.style.top = "0";
effect.domElement.style.left = "0";
document.body.appendChild(effect.domElement);

// Orbit Controls
// const controls = new OrbitControls(camera, effect.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;
const controls = new TrackballControls(camera, effect.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

//Base Geometry
const geometry = new THREE.SphereGeometry(3, 64, 64);
const material = new THREE.MeshPhongMaterial({ flatShading: true });
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

const sphereCenter = new THREE.Vector3();
const sphereEdge = new THREE.Vector3();

// Handle window resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
  effect.setSize(sizes.width, sizes.height);
});

const clock = new THREE.Clock();
let previousTime = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  controls.update();
  effect.render(scene, camera);
}

animate();
