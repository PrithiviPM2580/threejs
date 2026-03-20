import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";

// GUI setup
// const gui = new GUI();

// const parameters = {};
// parameters.progress = 0;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

// Texture loader
const textureLoader = new THREE.TextureLoader();
const gallery = [
  textureLoader.load("/images/img1.png"),
  textureLoader.load("/images/img2.png"),
  textureLoader.load("/images/img3.png"),
  textureLoader.load("/images/img4.png"),
  textureLoader.load("/images/img5.png"),
  textureLoader.load("/images/img6.png"),
];
const texture1 = textureLoader.load("/images/img1.png");
const texture2 = textureLoader.load("/images/img2.png");

// Camera setup
const camera = new THREE.PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.001,
  1000,
);
camera.position.z = 1;
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
controls.enableZoom = false;
controls.enablePan = false;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

//Base Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uResolution: {
      value: new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio,
      ),
    },
    uTexture1: new THREE.Uniform(texture1),
    uTexture2: new THREE.Uniform(texture2),
    uProgress: new THREE.Uniform(0),
    uPixels: new THREE.Uniform(new THREE.Vector2(sizes.width, sizes.height)),
    uUvRate1: new THREE.Uniform(new THREE.Vector2(1, 1)),
    uAccel: new THREE.Uniform(new THREE.Vector2(0.5, 2)),
  },
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function updateViewport() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  camera.aspect = sizes.width / sizes.height;
  material.uniforms.uUvRate1.value.set(1, sizes.height / sizes.width);
  material.uniforms.uResolution.value.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio,
  );
  material.uniforms.uPixels.value.set(sizes.width, sizes.height);

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);

  const dist = camera.position.z - mesh.position.z;
  const height = 1;
  camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));
  mesh.scale.x = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
}

const body = document.querySelector("body");
body.addEventListener("click", () => {
  gsap.to(parameters, {
    progress: 1,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      material.uniforms.uProgress.value = parameters.progress;
    },
  });
});

// Handle window resize
window.addEventListener("resize", () => {
  updateViewport();
});

updateViewport();

// gui.add(parameters, "progress", 0, 1, 0.01).onChange((value) => {
//   material.uniforms.uProgress.value = value;
// });

let speed = 0;
let position = 0;
renderer.domElement.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    speed += event.deltaY * 0.0003;
  },
  { passive: false },
);

const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  position += speed;
  speed *= 0.7;

  let i = Math.round(position);
  let diff = i - position;

  position += diff * 0.03;
  if (Math.abs(i - position) < 0.001) {
    position = i;
  }

  material.uniforms.uProgress.value = position;

  const total = gallery.length;
  let curslide = ((Math.floor(position) % total) + total) % total;
  let nextslide = (curslide + 1) % total;

  material.uniforms.uTexture1.value = gallery[curslide];
  material.uniforms.uTexture2.value = gallery[nextslide];

  const elapsedTime = clock.getElapsedTime();
  material.uniforms.uTime.value = elapsedTime;

  controls.update();
  renderer.render(scene, camera);
}

animate();
