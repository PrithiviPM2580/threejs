import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import "./style.css";

// GUI setup
const gui = new GUI();

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

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
camera.position.z = 15;

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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

//Gemometry and Material
const orbiter = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0x00ffff }),
);
scene.add(orbiter);

// Place orbiter 5 units away from center
orbiter.position.set(5, 0, 0);

const center = new THREE.Vector3(0, 0, 0); // orbit center

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
  // Vector from center to orbiter
  const radiusVec = orbiter.position.clone().sub(center);

  // Up vector for rotation axis
  const up = new THREE.Vector3(0, 1, 0);

  // Compute perpendicular direction using cross product
  const tangent = up.clone().cross(radiusVec).normalize();

  // Move orbiter along tangent
  orbiter.position.add(tangent.multiplyScalar(0.05));
  controls.update();
  renderer.render(scene, camera);
}

animate();
