import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";
import { noiseTexture } from "./constant.js";

// GUI setup
const gui = new GUI();

const parameters = {};

//Texture loader
const textureLoader = new THREE.TextureLoader();
const noiseTextureMap = textureLoader.load(noiseTexture.noiseHu85k);
noiseTextureMap.wrapS = THREE.RepeatWrapping;
noiseTextureMap.wrapT = THREE.RepeatWrapping;

// Video texture setup
const video = document.createElement("video");
video.src =
  "https://ik.imagekit.io/sqiqig7tz/e4d8fe34-ac0f-4485-9c56-716f218acdc1_hd.mp4";
video.crossOrigin = "anonymous";
video.loop = true;
video.muted = true;
video.play();

const texture = new THREE.VideoTexture(video);

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
camera.position.z = 2;
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

//Geometry and Material
const geometry = new THREE.PlaneGeometry(1.5, 2, 512, 512);
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio,
      ),
    ),
    uTexture: new THREE.Uniform(texture),
  },
  // wireframe: true,
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

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

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  material.uniforms.uTime.value = elapsedTime;
  controls.update();
  renderer.render(scene, camera);
}

animate();
