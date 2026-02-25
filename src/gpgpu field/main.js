import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import gpgpuParticlesShader from "./shader/gpgpu/particles.glsl";
import GUI from "lil-gui";
import "./style.css";
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js";

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
camera.position.z = 8;

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

//Base Geometry
const baseGeometry = {};
baseGeometry.instance = new THREE.SphereGeometry(3);
baseGeometry.count = baseGeometry.instance.attributes.position.count;

//Gpu Computation
//Setup
const gpgpu = {};
gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count));
gpgpu.computation = new GPUComputationRenderer(
  gpgpu.size,
  gpgpu.size,
  renderer,
);

//Base particles
const baseParticlesTexture = gpgpu.computation.createTexture();

for (let i = 0; i < baseGeometry.count; i++) {
  const i3 = i * 3;
  const i4 = i * 4;

  baseParticlesTexture.image.data[i4 + 0] =
    baseGeometry.instance.attributes.position.array[i3 + 0];
  baseParticlesTexture.image.data[i4 + 1] =
    baseGeometry.instance.attributes.position.array[i3 + 1];
  baseParticlesTexture.image.data[i4 + 2] =
    baseGeometry.instance.attributes.position.array[i3 + 2];
  baseParticlesTexture.image.data[i4 + 3] = 1.0;
}

//Particles variable
gpgpu.particlesVariable = gpgpu.computation.addVariable(
  "uParticles",
  gpgpuParticlesShader,
  baseParticlesTexture,
);
gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [
  gpgpu.particlesVariable,
]);

// Init
gpgpu.computation.init();

//Debug
gpgpu.debug = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 3),
  new THREE.MeshBasicMaterial({
    map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable)
      .texture,
  }),
);
gpgpu.debug.position.x = 3;
scene.add(gpgpu.debug);

// Geometry and Material
const particles = {};

particles.geometry = new THREE.BufferGeometry();
particles.geometry.setDrawRange(0, baseGeometry.count);

particles.material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uSize: new THREE.Uniform(0.1),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRation,
        sizes.height * sizes.pixelRation,
      ),
    ),
    uParticles: new THREE.Uniform(),
  },
});

particles.point = new THREE.Points(particles.geometry, particles.material);
scene.add(particles.point);

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

  controls.update();

  // Update GPGPU computation
  gpgpu.computation.compute();
  particles.material.uniforms.uParticles.value =
    gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture;

  renderer.render(scene, camera);
}

animate();
