import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";

// GUI setup
const gui = new GUI();

const parameters = {};
parameters.pixel = 1;

gui
  .add(parameters, "pixel")
  .min(0.1)
  .max(5)
  .step(0.1)
  .name("Pixel Size")
  .onChange((value) => {
    material.uniforms.uPixelSize.value = value;
  });

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

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
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

//Base Geometry
const geometry = new THREE.TorusGeometry(4, 1, 16, 100);
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uPixelSize: new THREE.Uniform(parameters.pixel),
  },
  // transparent: true,
  // blending: THREE.AdditiveBlending,
  // depthWrite: false,
  // wireframe: true,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Handle window resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
  camera.aspect = sizes.width / sizes.height;
  material.uniforms.uResolution.value.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio,
  );
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

const clock = new THREE.Clock();
let previousTime = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  material.uniforms.uTime.value = elapsedTime;
  material.uniforms.uPixelSize.value = 3.0 + Math.sin(elapsedTime) * 0.5;

  controls.update();
  renderer.render(scene, camera);
}

animate();
