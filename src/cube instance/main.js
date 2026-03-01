import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import "./style.css";
import { RoundedBoxGeometry } from "three/examples/jsm/Addons.js";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color("#000000");

const size = 30;
const spacing = 1.5;
const gridSpan = size * spacing;

// Camera setup
let frustumSize = gridSpan * 1.25;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  frustumSize / -2,
  0.1,
  100,
);
camera.position.set(gridSpan * 0.7, gridSpan * 0.8, gridSpan * 0.7);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 50, 0);
scene.add(directionalLight);

const splotLight = new THREE.SpotLight(0x66ccff, 3000);
splotLight.position.set(-30, 20, 0);
let target = new THREE.Object3D();
target.position.set(0, 0, 0);
splotLight.target = target;
scene.add(target);
splotLight.intensity = 3000;
splotLight.angle = 0.15;
splotLight.penumbra = 1.2;
splotLight.decay = 1.5;
splotLight.distance = 80;
scene.add(splotLight);

const spotLightHelper = new THREE.SpotLightHelper(splotLight, 0x66ccff);
scene.add(spotLightHelper);

//Geometry and Material
const cubeGeometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.2);
// const material = new THREE.ShaderMaterial({
//   vertexShader,
//   fragmentShader,
// });
const material = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#3613d3"),
  roughness: 0.85,
  metalness: 0.0,
  clearcoat: 0.0,
});

const instance = size ** 2;
const instanceMesh = new THREE.InstancedMesh(cubeGeometry, material, instance);
let dummy = new THREE.Object3D();
for (let i = 0; i < size; i++) {
  for (let j = 0; j < size; j++) {
    dummy.position.set(spacing * (i - size / 2), 0, spacing * (j - size / 2));
    dummy.updateMatrix();
    instanceMesh.setMatrixAt(i * size + j, dummy.matrix);
  }
}

scene.add(instanceMesh);

// Handle window resize
window.addEventListener("resize", () => {
  const newAspect = window.innerWidth / window.innerHeight;
  camera.left = (-frustumSize * newAspect) / 2;
  camera.right = (frustumSize * newAspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
// Animation loop
function animate() {
  requestAnimationFrame(animate);
  clock.getElapsedTime();
  spotLightHelper.update();

  controls.update();
  renderer.render(scene, camera);
}

animate();
