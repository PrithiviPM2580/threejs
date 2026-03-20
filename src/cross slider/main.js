import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";

// GUI setup
const gui = new GUI();

const parameters = {};
parameters.progress = 0;

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
    uProgress: new THREE.Uniform(parameters.progress),
    uPixels: new THREE.Uniform(new THREE.Vector2(sizes.width, sizes.height)),
    uUvRate1: new THREE.Uniform(new THREE.Vector2(1, 1)),
    uAccel: new THREE.Uniform(new THREE.Vector2(0.5, 2)),
  },
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

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
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
  camera.aspect = sizes.width / sizes.height;
  material.uniforms.uUvRate1.value.y = sizes.height / sizes.width;
  material.uniforms.uResolution.value.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio,
  );
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
  let dist = camera.position.z - mesh.position.z;
  let height = 1;
  camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));
  mesh.scale.x = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
});

gui.add(parameters, "progress", 0, 1, 0.01).onChange((value) => {
  material.uniforms.uProgress.value = value;
});

let speed = 0;
document.addEventListener("wheel", (event) => {
  speed += event.deltaY;
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
