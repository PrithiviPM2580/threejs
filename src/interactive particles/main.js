import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import simVertexShader from "./shader/sim/vertex.glsl";
import simFragmentShader from "./shader/sim/fragment.glsl";
import GUI from "lil-gui";
import "./style.css";

// GUI setup
const gui = new GUI();

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

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
camera.position.z = 4;

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

const fboSize = 128;

// Ping-pong render targets (simulation textures)
let fbo = new THREE.WebGLRenderTarget(fboSize, fboSize, {
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
  format: THREE.RGBAFormat,
  type: THREE.FloatType,
});
let fbo1 = fbo.clone();

const fboScene = new THREE.Scene();
const fbocamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
fbocamera.position.set(0, 0, 0.5);
fbocamera.lookAt(0, 0, 0);
const fboGeometry = new THREE.PlaneGeometry(2, 2);

const data = new Float32Array(fboSize * fboSize * 4);
for (let i = 0; i < fboSize; i++) {
  for (let j = 0; j < fboSize; j++) {
    const index = (i + fboSize * j) * 4;
    const theta = Math.random() * Math.PI * 2;
    const r = 0.5 + Math.random() * 0.5;
    data[index] = r * Math.cos(theta);
    data[index + 1] = r * Math.sin(theta);
    data[index + 2] = 1;
    data[index + 3] = 1;
  }
}

const fboTexture = new THREE.DataTexture(
  data,
  fboSize,
  fboSize,
  THREE.RGBAFormat,
  THREE.FloatType,
);
fboTexture.minFilter = THREE.NearestFilter;
fboTexture.magFilter = THREE.NearestFilter;
fboTexture.needsUpdate = true;

const info = new Float32Array(fboSize * fboSize * 4);
for (let i = 0; i < fboSize; i++) {
  for (let j = 0; j < fboSize; j++) {
    const index = (i + fboSize * j) * 4;
    info[index] = 0.5 + Math.random();
    info[index + 1] = 0.5 + Math.random();
    info[index + 2] = 1;
    info[index + 3] = 1;
  }
}

const infoTexture = new THREE.DataTexture(
  info,
  fboSize,
  fboSize,
  THREE.RGBAFormat,
  THREE.FloatType,
);
infoTexture.minFilter = THREE.NearestFilter;
infoTexture.magFilter = THREE.NearestFilter;
infoTexture.needsUpdate = true;

const fboMaterial = new THREE.ShaderMaterial({
  vertexShader: simVertexShader,
  fragmentShader: simFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio,
      ),
    ),
    uPositions: new THREE.Uniform(fboTexture),
    uInfo: new THREE.Uniform(infoTexture),
  },
});

const fboMesh = new THREE.Mesh(fboGeometry, fboMaterial);
fboScene.add(fboMesh);

//geometry and material

const count = fboSize ** 2;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(count * 3);
const uv = new Float32Array(count * 2);
for (let i = 0; i < fboSize; i++) {
  for (let j = 0; j < fboSize; j++) {
    const index = i + fboSize * j;
    positions[index * 3] = Math.random();
    positions[index * 3 + 1] = Math.random();
    positions[index * 3 + 2] = 0;

    uv[index * 2] = i / fboSize;
    uv[index * 2 + 1] = j / fboSize;
  }
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uSize: new THREE.Uniform(1.5),
    uPositions: new THREE.Uniform(fboTexture),
    uInfo: new THREE.Uniform(infoTexture),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio,
      ),
    ),
  },
});

const points = new THREE.Points(geometry, material);
scene.add(points);

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
let hasInitializedFbo = false;
// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  fboMaterial.uniforms.uTime.value = elapsedTime;
  material.uniforms.uTime.value = elapsedTime;

  if (!hasInitializedFbo) {
    fboMaterial.uniforms.uPositions.value = fboTexture;
    hasInitializedFbo = true;
  } else {
    fboMaterial.uniforms.uPositions.value = fbo.texture;
  }

  renderer.setRenderTarget(fbo1);
  renderer.render(fboScene, fbocamera);
  renderer.setRenderTarget(null);

  material.uniforms.uPositions.value = fbo1.texture;
  material.uniforms.uInfo.value = infoTexture;

  let temp = fbo;
  fbo = fbo1;
  fbo1 = temp;

  controls.update();
  renderer.render(scene, camera);
}

animate();
