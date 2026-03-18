import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";
import {
  BufferGeometryUtils,
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
  ShaderPass,
  FXAAShader,
} from "three/examples/jsm/Addons.js";

// GUI setup
const gui = new GUI();

// --- CONFIGURATION ---
const params = {
  count: 100,
  radius: 7,
  turns: 3,
  tubeRadius: 0.007,

  rotateX: -1.1,
  rotateY: -0.45,

  // Animation
  speed: 0.03,
  trailLength: 0.1,
  waveAmplitude: 0.005,

  // Colors
  color1: "#00ffff",
  color2: "#ff00ff",
  color3: "#0055ff",
  color4: "#ffffff",
  backgroundColor: "#000000",

  // Bloom
  bloomStrength: 0.5,
  bloomRadius: 0.04,
  bloomThreshold: 0.0,
};

// Scene setup
const scene = new THREE.Scene();
const bgColor = new THREE.Color(0x000000);
scene.background = bgColor;
scene.fog = new THREE.FogExp2(bgColor, 0.05);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

// Camera setup
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.z = 16;
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
renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = false;
controls.enablePan = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

//Base Geometry
function getSpiralCurve(radius, turns, randomOffset) {
  const points = [];
  const divisions = 200;
  for (let i = 0; i <= divisions; i++) {
    const t = i / divisions;
    const angle = t * Math.PI * 2 * turns + randomOffset;
    const r = radius * (1 - t);
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    // Base Z-depth (static)
    const z = Math.sin(t * 12.0 + randomOffset) * 0.5 * (1.0 - t);
    points.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(points, false, "centripetal");
}
let mesh;
let material;

function createSpirals() {
  const oldRotX = mesh ? mesh.rotation.x : params.rotateX;
  const oldRotY = mesh ? mesh.rotation.y : params.rotateY;

  if (mesh) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    if (mesh.material) mesh.material.dispose();
  }

  const geometries = [];
  const tubularSegments = 450;
  const radialSegments = 12;

  for (let i = 0; i < params.count; i++) {
    const randomAngle = Math.random() * Math.PI * 2;
    const curve = getSpiralCurve(params.radius, params.turns, randomAngle);

    const geometry = new THREE.TubeGeometry(
      curve,
      tubularSegments,
      params.tubeRadius,
      radialSegments,
      false,
    );
    const count = geometry.attributes.position.count;

    const randomOffsets = new Float32Array(count);
    const offsetVal = Math.random() * 100; // Used for wave phase too

    const speeds = new Float32Array(count);
    const speedVal = 0.8 + Math.random() * 0.4;

    const colors = new Float32Array(count);
    const colorType = Math.floor(Math.random() * 4);

    for (let j = 0; j < count; j++) {
      randomOffsets[j] = offsetVal;
      speeds[j] = speedVal;
      colors[j] = colorType;
    }

    geometry.setAttribute(
      "aOffset",
      new THREE.BufferAttribute(randomOffsets, 1),
    );
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute("aColorIdx", new THREE.BufferAttribute(colors, 1));

    geometries.push(geometry);
  }

  const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uGlobalSpeed: { value: params.speed },
      uTrailLength: { value: params.trailLength },
      uWaveAmplitude: { value: params.waveAmplitude }, // Pass wave amp
      uColor1: { value: new THREE.Color(params.color1) },
      uColor2: { value: new THREE.Color(params.color2) },
      uColor3: { value: new THREE.Color(params.color3) },
      uColor4: { value: new THREE.Color(params.color4) },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

  mesh = new THREE.Mesh(mergedGeometry, material);
  mesh.rotation.x = oldRotX;
  mesh.rotation.y = oldRotY;

  // Manual Position adjustment
  mesh.position.y = 0.8;
  mesh.position.x = -0.3;

  scene.add(mesh);
}

createSpirals();

const renderScene = new RenderPass(scene, camera);

// 1. Bloom Pass
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85,
);
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

// 2. FXAA Pass (Fast Approximate Anti-Aliasing)
const fxaaPass = new ShaderPass(FXAAShader);
const pixelRatio = renderer.getPixelRatio();
// Set resolution for FXAA
fxaaPass.uniforms["resolution"].value.set(
  1 / (window.innerWidth * pixelRatio),
  1 / (window.innerHeight * pixelRatio),
);

const composer = new EffectComposer(renderer);
composer.setPixelRatio(pixelRatio); // Important for crisp rendering on high DPI
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(fxaaPass); // FXAA must be the last pass

const fGeom = gui.addFolder("Geometry");
fGeom
  .add(params, "tubeRadius", 0.001, 0.05)
  .name("Thickness")
  .onFinishChange(createSpirals);
fGeom
  .add(params, "rotateX", -Math.PI, Math.PI)
  .name("Rotate X")
  .onChange((v) => {
    if (mesh) mesh.rotation.x = v;
  });
fGeom
  .add(params, "rotateY", -Math.PI, Math.PI)
  .name("Rotate Y")
  .onChange((v) => {
    if (mesh) mesh.rotation.y = v;
  });

const fAnim = gui.addFolder("Animation");
fAnim.add(params, "speed", 0.0, 0.1).name("Speed");
fAnim
  .add(params, "count", 10, 200)
  .step(1)
  .name("Count")
  .onFinishChange(createSpirals);
fAnim
  .add(params, "trailLength", 0.0, 0.5)
  .name("Trail Length")
  .onChange((v) => {
    if (material) material.uniforms.uTrailLength.value = v;
  });
fAnim
  .add(params, "waveAmplitude", 0.0, 2.0)
  .name("Wave Motion")
  .onChange((v) => {
    if (material) material.uniforms.uWaveAmplitude.value = v;
  });

const fColors = gui.addFolder("Colors");
const updateColor = (uniformName, colorValue) => {
  if (material) material.uniforms[uniformName].value.set(colorValue);
};
fColors
  .addColor(params, "color1")
  .name("Trail Color 1")
  .onChange((v) => updateColor("uColor1", v));
fColors
  .addColor(params, "color2")
  .name("Trail Color 2")
  .onChange((v) => updateColor("uColor2", v));
fColors
  .addColor(params, "color3")
  .name("Trail Color 3")
  .onChange((v) => updateColor("uColor3", v));
fColors
  .addColor(params, "color4")
  .name("Trail Color 4")
  .onChange((v) => updateColor("uColor4", v));
fColors
  .addColor(params, "backgroundColor")
  .name("Background")
  .onChange((v) => {
    const c = new THREE.Color(v);
    scene.background = c;
    scene.fog.color = c;
  });

const fGlow = gui.addFolder("Glow Effect");
fGlow
  .add(params, "bloomStrength", 0.0, 3.0)
  .onChange((v) => (bloomPass.strength = v));
fGlow
  .add(params, "bloomRadius", 0.0, 1.0)
  .onChange((v) => (bloomPass.radius = v));

// --- LOOP ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  if (material) {
    material.uniforms.uTime.value = elapsedTime;
    material.uniforms.uGlobalSpeed.value = params.speed;
  }

  controls.update();
  composer.render();
}

// Handle Resize with FXAA update
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = renderer.getPixelRatio();

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);

  // Update FXAA shader resolution uniform
  fxaaPass.uniforms["resolution"].value.set(
    1 / (width * pixelRatio),
    1 / (height * pixelRatio),
  );
});

animate();
