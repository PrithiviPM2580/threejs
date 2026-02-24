import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import GUI from "lil-gui";
import "./style.css";

// GUI setup
const gui = new GUI();

const guiParams = {
  clearColor: "#26132f",
  color: "#ff794d",
  lightRepeatation: 100,
  shadeRepeatation: 130,
  low: -0.8,
  high: 1.5,
  shadeColor: "#8000ff",
  lightColor: "#e5ffe0",
};

gui
  .addColor(guiParams, "clearColor")
  .name("Clear Color")
  .onChange((value) => {
    scene.background.set(value);
  });

gui
  .addColor(guiParams, "color")
  .name("Object Color")
  .onChange((value) => {
    material.uniforms.uColor.value.set(value);
  });

gui
  .add(guiParams, "lightRepeatation", 100, 500, 1)
  .name("Light Repeatation")
  .onChange((value) => {
    material.uniforms.uLightRepeatation.value = value;
  });

gui
  .add(guiParams, "shadeRepeatation", 130, 500, 1)
  .name("Shade Repeatation")
  .onChange((value) => {
    material.uniforms.uShadeRepeatation.value = value;
  });

gui
  .add(guiParams, "low", -1, 0, 0.01)
  .name("Low Threshold")
  .onChange((value) => {
    material.uniforms.uLow.value = value;
  });

gui
  .add(guiParams, "high", 0, 2, 0.01)
  .name("High Threshold")
  .onChange((value) => {
    material.uniforms.uHigh.value = value;
  });

gui
  .addColor(guiParams, "shadeColor")
  .name("Shade Color")
  .onChange((value) => {
    material.uniforms.uShadeColor.value.set(value);
  });

gui
  .addColor(guiParams, "lightColor")
  .name("Light Color")
  .onChange((value) => {
    material.uniforms.uLightColor.value.set(value);
  });

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(guiParams.clearColor);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000,
);
camera.position.z = 8;

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

const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uColor: new THREE.Uniform(new THREE.Color(guiParams.color)),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio,
      ),
    ),
    uLightRepeatation: new THREE.Uniform(guiParams.lightRepeatation),
    uShadeRepeatation: new THREE.Uniform(guiParams.shadeRepeatation),
    uLow: new THREE.Uniform(guiParams.low),
    uHigh: new THREE.Uniform(guiParams.high),
    uShadeColor: new THREE.Uniform(new THREE.Color(guiParams.shadeColor)),
    uLightColor: new THREE.Uniform(new THREE.Color(guiParams.lightColor)),
  },
});

const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
const torusKnotGeometry = new THREE.TorusKnotGeometry(0.6, 0.2, 200, 32);
const dodecahedronGeometry = new THREE.DodecahedronGeometry();

const leftMesh = new THREE.Mesh(torusKnotGeometry, material);
leftMesh.position.set(-2.8, 0, 0);
scene.add(leftMesh);

const centerMesh = new THREE.Mesh(sphereGeometry, material);
centerMesh.position.set(0, 0, 0);
scene.add(centerMesh);

const rightMesh = new THREE.Mesh(dodecahedronGeometry, material);
rightMesh.position.set(2.8, 0, 0);
scene.add(rightMesh);

// Handle window resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
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
// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  controls.update();
  renderer.render(scene, camera);
}

animate();
