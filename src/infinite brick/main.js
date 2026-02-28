import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import "./style.css";
import { getBrick } from "./get-brick";

// GUI setup
const gui = new GUI();

// Scene setup
const scene = new THREE.Scene();
// scene.position.y = -7;
scene.background = new THREE.Color(0x000000);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRation: Math.min(window.devicePixelRatio, 2),
};

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000,
);
camera.position.z = 12;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRation);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
// scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(4, 2, 4);
scene.add(directionalLight);

//Geometry

let num = 12;
let rows = 10;
let anim = [];

for (let j = 0; j < rows; j++) {
  for (let i = 0; i < num; i++) {
    const mesh = getBrick(i, num, j % 2);
    mesh.position.y = -j;
    scene.add(mesh);

    anim.push({
      y: -j,
      row: j,
      mesh,
      offset: Math.random(),
    });
  }
}

// Handle window resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRation);
});

const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  anim.forEach((m) => {
    m.mesh.position.setY(m.y + Math.sin(elapsedTime) * 2);

    if (m.row < 2) {
      m.mesh.position.setY(m.y + Math.sin(elapsedTime) * 6);
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();
