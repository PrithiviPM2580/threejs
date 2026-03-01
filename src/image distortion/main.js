import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import "./style.css";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color("#000000");

const textureLoader = new THREE.TextureLoader();
const imageTexture = textureLoader.load("/textures/potrait.png");

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRation: Math.min(window.devicePixelRatio, 2),
};

// Camera setup
// const camera = new THREE.PerspectiveCamera(
//   45,
//   sizes.width / sizes.height,
//   0.1,
//   1000,
// );
// camera.position.set(0, 0, 5);
// camera.lookAt(0, 0, 0);

let frustumSize = 1;
const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  frustumSize / -2,
  0.1,
  1000,
);
camera.position.set(0, 0, 2);
// camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRation);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

//Geometry and Material
const width = 32;
const height = 32;

const size = width * height;
const data = new Float32Array(3 * size);
const color = new THREE.Color("#ffffff");

const r = Math.floor(color.r * 255);
const g = Math.floor(color.g * 255);
const b = Math.floor(color.b * 255);

for (let i = 0; i < size; i++) {
  let r = Math.random();
  const stride = i * 3;
  data[stride] = r;
  data[stride + 1] = r;
  data[stride + 2] = r;
}

const texture = new THREE.DataTexture(
  data,
  width,
  height,
  THREE.RGBFormat,
  THREE.FloatType,
);
texture.magFilter = texture.minFilter = THREE.NearestFilter;
// texture.needsUpdate = true;

const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRation,
        sizes.height * sizes.pixelRation,
      ),
    ),
    uTexture: new THREE.Uniform(imageTexture),
    uDataTexture: new THREE.Uniform(texture),
  },
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// Handle window resize
window.addEventListener("resize", () => {
  const newAspect = sizes.width / sizes.height;
  camera.aspect = newAspect;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRation);
});

const clock = new THREE.Clock();
// Animation loop
function animate() {
  requestAnimationFrame(animate);
  clock.getElapsedTime();

  controls.update();
  renderer.render(scene, camera);
}

animate();
