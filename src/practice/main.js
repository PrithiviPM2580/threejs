import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";
const imageLink =
  "https://images.unsplash.com/photo-1500881263786-ad74c00b9e60?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// GUI setup
const gui = new GUI();

const parameters = {
  size: 1,
  mix: 0.5,
};

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

const textureLoader = new THREE.TextureLoader();
const textureResolution = new THREE.Vector2(1, 1);
const videoResolution = new THREE.Vector2(16, 9);
const texture = textureLoader.load(imageLink, (loadedTexture) => {
  textureResolution.set(loadedTexture.image.width, loadedTexture.image.height);
});

const videoDOM = document.getElementById("video-bg");
videoDOM.crossOrigin = "anonymous";
const video = new THREE.VideoTexture(videoDOM);
videoDOM.addEventListener("loadedmetadata", () => {
  videoResolution.set(videoDOM.videoWidth, videoDOM.videoHeight);
});

// Camera setup
// const camera = new THREE.PerspectiveCamera(
//   70,
//   sizes.width / sizes.height,
//   0.1,
//   1000,
// );
// camera.position.z = 4;
const frustumSize = 1;
const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(
  (-frustumSize * aspect) / 2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  -frustumSize / 2,
  0.1,
  1000,
);
camera.position.z = 1;
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
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio,
      ),
    ),
    uTextureResolution: new THREE.Uniform(textureResolution),
    uVideoResolution: new THREE.Uniform(videoResolution),
    uVideo: new THREE.Uniform(video),
    uTexture: new THREE.Uniform(texture),
    uMix: new THREE.Uniform(parameters.mix),
  },
});

gui.add(parameters, "mix", 0, 1, 0.001).onChange((value) => {
  material.uniforms.uMix.value = value;
});

const plane = new THREE.Mesh(geometry, material);
plane.scale.set(frustumSize * aspect, frustumSize, 1);
scene.add(plane);

// Handle window resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
  const resizedAspect = sizes.width / sizes.height;
  camera.left = (-frustumSize * resizedAspect) / 2;
  camera.right = (frustumSize * resizedAspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  plane.scale.set(frustumSize * resizedAspect, frustumSize, 1);
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
