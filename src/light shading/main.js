import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import GUI from "lil-gui";
import "./style.css";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

// GUI setup
const gui = new GUI();

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

const lightGUI = {
  color: new THREE.Color(0xffffff),
};

gui
  .addColor(lightGUI, "color")
  .name("Light Color")
  .onChange((value) => {
    material.uniforms.uColor.value.set(value);
  });

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uColor: new THREE.Uniform(lightGUI.color),
  },
});

const object1 = new THREE.Mesh(
  new THREE.CapsuleGeometry(1, 1, 4, 8, 1),
  material,
);
object1.position.x = -3.5;

const object2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4), material);

const object3 = new THREE.Mesh(new THREE.TorusKnotGeometry(), material);
object3.position.x = 3.5;

const directionalLightHelper = new THREE.Mesh(
  new THREE.PlaneGeometry(),
  new THREE.MeshBasicMaterial(),
);
directionalLightHelper.material.color.setRGB(0.1, 0.1, 1.0);
directionalLightHelper.material.side = THREE.DoubleSide;
directionalLightHelper.position.set(0, 0, 3);

scene.add(object1, object2, object3, directionalLightHelper);

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

  controls.update();
  renderer.render(scene, camera);
}

animate();
