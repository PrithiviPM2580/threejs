import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";
import { BufferGeometryUtils } from "three/examples/jsm/Addons.js";

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
