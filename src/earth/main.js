import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import earthVertexShader from "./shader/earth/vertex.glsl";
import earthFragmentShader from "./shader/earth/fragment.glsl";
import atmosphereVertexShader from "./shader/atmosphere/vertex.glsl";
import atmosphereFragmentShader from "./shader/atmosphere/fragment.glsl";

import GUI from "lil-gui";
import "./style.css";

// GUI setup
const gui = new GUI();

const earthParams = {
  atmosphereDayColor: "#00aaff",
  atmosphereTwilightColor: "#ff6600",
};

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

//Texture Loader
const textureLoader = new THREE.TextureLoader();

const earthDayTexture = textureLoader.load("/textures/earth/earth-day.jpg");
earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthDayTexture.anisotropy = 8;

const earthNightTexture = textureLoader.load("/textures/earth/earth-night.jpg");
earthNightTexture.colorSpace = THREE.SRGBColorSpace;
earthNightTexture.anisotropy = 8;

const earthCloudTexture = textureLoader.load("/textures/earth/earth-cloud.jpg");
earthCloudTexture.anisotropy = 8;

const earthSpecularTexture = textureLoader.load(
  "/textures/earth/earthcloudmap.jpg",
);
earthSpecularTexture.anisotropy = 8;

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

//Gemometry and Material

const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
const material = new THREE.ShaderMaterial({
  vertexShader: earthVertexShader,
  fragmentShader: earthFragmentShader,
  uniforms: {
    uColor: new THREE.Uniform(new THREE.Color(0xffffff)),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio,
      ),
    ),
    uDayTexture: new THREE.Uniform(earthDayTexture),
    uNightTexture: new THREE.Uniform(earthNightTexture),
    uCloudTexture: new THREE.Uniform(earthCloudTexture),
    uSpecularTexture: new THREE.Uniform(earthSpecularTexture),
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
    uAtmosphereDayColor: new THREE.Uniform(
      new THREE.Color(earthParams.atmosphereDayColor),
    ),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(earthParams.atmosphereTwilightColor),
    ),
  },
});

const earth = new THREE.Mesh(earthGeometry, material);
scene.add(earth);

const atmosphereMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  uniforms: {
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
    uAtmosphereDayColor: new THREE.Uniform(
      new THREE.Color(earthParams.atmosphereDayColor),
    ),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(earthParams.atmosphereTwilightColor),
    ),
  },
});
const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial);
atmosphere.scale.set(1.04, 1.04, 1.04);
scene.add(atmosphere);

const debugSun = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial(),
);
scene.add(debugSun);

const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
const sunDirection = new THREE.Vector3();

const updateSun = () => {
  sunDirection.setFromSpherical(sunSpherical);
  debugSun.position.copy(sunDirection).multiplyScalar(4.8);
  material.uniforms.uSunDirection.value.copy(sunDirection);
  atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);
};

updateSun();

gui.add(sunSpherical, "phi", 0, Math.PI).onChange(updateSun);
gui.add(sunSpherical, "theta", -Math.PI, Math.PI).onChange(updateSun);
gui.addColor(earthParams, "atmosphereDayColor").onChange((value) => {
  material.uniforms.uAtmosphereDayColor.value.set(value);
  atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(value);
});
gui.addColor(earthParams, "atmosphereTwilightColor").onChange((value) => {
  material.uniforms.uAtmosphereTwilightColor.value.set(value);
  atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(value);
});

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
  earth.rotation.y = elapsedTime * 0.1;

  controls.update();
  renderer.render(scene, camera);
}

animate();
