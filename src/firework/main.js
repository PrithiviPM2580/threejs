import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import GUI from "lil-gui";
import "./style.css";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

//Texture loader
const textureLoader = new THREE.TextureLoader();
const textures = [
  textureLoader.load("/particles/black/star_01.png"),
  textureLoader.load("/particles/black/star_02.png"),
  textureLoader.load("/particles/black/star_03.png"),
  textureLoader.load("/particles/black/star_04.png"),
  textureLoader.load("/particles/black/star_05.png"),
  textureLoader.load("/particles/black/star_06.png"),
  textureLoader.load("/particles/black/star_07.png"),
  textureLoader.load("/particles/black/star_08.png"),
];

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRation: Math.min(window.devicePixelRatio, 2),
};

sizes.resolution = new THREE.Vector2(
  sizes.width * sizes.pixelRation,
  sizes.height * sizes.pixelRation,
);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 4;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(sizes.pixelRation);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// GUI setup
const gui = new GUI();

const guiParams = {
  size: 0.1,
  imageIndex: 0,
  radius: 1,
  sphereCount: 100,
  color: "#8affff",
};

gui.add(guiParams, "size", 0, 1, 0.01).onChange((value) => {
  scene.clear();
  createFirework(guiParams.sphereCount, new THREE.Vector3(), value);
});

gui.add(guiParams, "imageIndex", 0, 7, 1).onChange((value) => {
  scene.clear();
  createFirework(
    guiParams.sphereCount,
    new THREE.Vector3(),
    guiParams.size,
    textures[value],
  );
});

gui.add(guiParams, "radius", 0, 5, 0.1).onChange((value) => {
  scene.clear();
  createFirework(
    guiParams.sphereCount,
    new THREE.Vector3(),
    guiParams.size,
    textures[guiParams.imageIndex],
    value,
  );
});

gui.add(guiParams, "sphereCount", 100, 50000, 1000).onChange((value) => {
  scene.clear();
  createFirework(
    value,
    new THREE.Vector3(),
    guiParams.size,
    textures[guiParams.imageIndex],
    guiParams.radius,
  );
});

gui.addColor(guiParams, "color").onChange((value) => {
  scene.clear();
  createFirework(
    guiParams.sphereCount,
    new THREE.Vector3(),
    guiParams.size,
    textures[guiParams.imageIndex],
    guiParams.radius,
    new THREE.Color(value),
  );
});

//Create firework
const createFirework = (count, position, size, texture, radius, color) => {
  const positionArray = new Float32Array(count * 3);
  const sizeArray = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const spherical = new THREE.Spherical(
      radius * (0.75 + Math.random() * 0.25),
      Math.random() * Math.PI,
      Math.random() * 2 * Math.PI,
    );

    const position = new THREE.Vector3();
    position.setFromSpherical(spherical);

    positionArray[i3] = position.x;
    positionArray[i3 + 1] = position.y;
    positionArray[i3 + 2] = position.z;

    sizeArray[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positionArray, 3),
  );
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizeArray, 1));

  texture.flipY = false;

  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(size),
      uResolution: new THREE.Uniform(sizes.resolution),
      uTexture: new THREE.Uniform(texture),
      uColor: new THREE.Uniform(color),
      uprogress: new THREE.Uniform(0),
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.position.copy(position);
  scene.add(points);

  function destroyFirework() {}

  gsap.to(material.uniforms.uprogress, {
    value: 1,
    duration: 3,
    ease: "linear",
    onComplete: destroyFirework,
  });
};

createFirework(
  guiParams.sphereCount, // count
  new THREE.Vector3(), // position
  guiParams.size, // size
  textures[guiParams.imageIndex], // texture
  guiParams.radius, // radius
  new THREE.Color(guiParams.color), // color
);

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  sizes.resolution.set(
    sizes.width * sizes.pixelRation,
    sizes.height * sizes.pixelRation,
  );
  sizes.pixelRation = Math.min(window.devicePixelRatio, 2);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(sizes.pixelRation);
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
