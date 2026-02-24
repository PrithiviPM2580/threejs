import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sky } from "three/addons/objects/Sky.js";
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
  turbidity: 10,
  rayleigh: 3,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.95,
  elevation: -2.2,
  azimuth: 180,
  exposure: renderer.toneMappingExposure,
  cloudCoverage: 0.4,
  cloudDensity: 0.4,
  cloudElevation: 0.5,
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
  const timeMultiplier = new Float32Array(count);

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

    timeMultiplier[i] = 1 + Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positionArray, 3),
  );
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizeArray, 1));
  geometry.setAttribute(
    "aTimeMultiplier",
    new THREE.BufferAttribute(timeMultiplier, 1),
  );

  texture.flipY = false;

  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(size),
      uResolution: new THREE.Uniform(sizes.resolution),
      uTexture: new THREE.Uniform(texture),
      uColor: new THREE.Uniform(color),
      uProgress: new THREE.Uniform(0),
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const firework = new THREE.Points(geometry, material);
  firework.position.copy(position);
  scene.add(firework);

  function destroyFirework() {
    scene.remove(firework);
    geometry.dispose();
    material.dispose();
  }

  gsap.to(material.uniforms.uProgress, {
    value: 1,
    duration: 3,
    ease: "linear",
    onComplete: destroyFirework,
  });
};

const createRandomFirework = () => {
  const count = Math.round(400 + Math.random() * 1000);
  const position = new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    Math.random(),
    (Math.random() - 0.5) * 2,
  );

  const size = 0.1 + Math.random() * 0.1;
  const texture = textures[Math.floor(Math.random() * textures.length)];
  const radius = 0.5 + Math.random();
  const color = new THREE.Color();
  color.setHSL(Math.random(), 1, 0.7);

  createFirework(count, position, size, texture, radius, color);
};

createRandomFirework();

// Add click event listener to create fireworks on click
window.addEventListener("click", createRandomFirework);

//Sky
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const sun = new THREE.Vector3();

/// GUI

function guiChanged() {
  const uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = guiParams.turbidity;
  uniforms["rayleigh"].value = guiParams.rayleigh;
  uniforms["mieCoefficient"].value = guiParams.mieCoefficient;
  uniforms["mieDirectionalG"].value = guiParams.mieDirectionalG;

  const phi = THREE.MathUtils.degToRad(90 - guiParams.elevation);
  const theta = THREE.MathUtils.degToRad(guiParams.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  uniforms["sunPosition"].value.copy(sun);

  renderer.toneMappingExposure = guiParams.exposure;
}

gui.add(guiParams, "turbidity", 0.0, 20.0, 0.1).onChange(guiChanged);
gui.add(guiParams, "rayleigh", 0.0, 4, 0.001).onChange(guiChanged);
gui.add(guiParams, "mieCoefficient", 0.0, 0.1, 0.001).onChange(guiChanged);
gui.add(guiParams, "mieDirectionalG", 0.0, 1, 0.001).onChange(guiChanged);
gui.add(guiParams, "elevation", 0, 90, 0.1).onChange(guiChanged);
gui.add(guiParams, "azimuth", -180, 180, 0.1).onChange(guiChanged);
gui.add(guiParams, "exposure", 0, 1, 0.0001).onChange(guiChanged);

const folderClouds = gui.addFolder("Clouds");
folderClouds
  .add(guiParams, "cloudCoverage", 0, 1, 0.01)
  .name("coverage")
  .onChange(guiChanged);
folderClouds
  .add(guiParams, "cloudDensity", 0, 1, 0.01)
  .name("density")
  .onChange(guiChanged);
folderClouds
  .add(guiParams, "cloudElevation", 0, 1, 0.01)
  .name("elevation")
  .onChange(guiChanged);

guiChanged();

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
