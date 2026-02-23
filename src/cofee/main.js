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
camera.position.z = 8;

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

const parameters = {};
parameters.color = "#ff0000";

const gui = new GUI();
gui.addColor(parameters, "color").onChange(() => {
  material.uniforms.uColor.value.set(parameters.color);
});

// Geometry and Material
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uColor: new THREE.Uniform(new THREE.Color(parameters.color)),
  },
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
const torusKnotGeometry = new THREE.TorusKnotGeometry(0.6, 0.2, 200, 32);
const octahedronGeometry = new THREE.OctahedronGeometry(1);

const leftMesh = new THREE.Mesh(torusKnotGeometry, material);
leftMesh.position.set(-2.8, 0, 0);
scene.add(leftMesh);

const centerMesh = new THREE.Mesh(sphereGeometry, material);
centerMesh.position.set(0, 0, 0);
scene.add(centerMesh);

const rightMesh = new THREE.Mesh(octahedronGeometry, material);
rightMesh.position.set(2.8, 0, 0);
scene.add(rightMesh);

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

  material.uniforms.uTime.value = elapsedTime;

  controls.update();
  renderer.render(scene, camera);
}

animate();
