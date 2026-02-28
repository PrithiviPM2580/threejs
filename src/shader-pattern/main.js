import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import GUI from "lil-gui";
import "./style.css";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

//Axis Helper
// const axesHelper = new THREE.AxesHelper();
// axesHelper.position.y += 0.25;
// scene.add(axesHelper);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.001,
  1000,
);
camera.position.z = 6;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

//Geometry and Material
// class CustomSinCurve extends THREE.Curve {
//   getPoint(t, optionalTarget = new THREE.Vector3()) {
//     const tx = t * 10 - 5; // wider range for longer tube
//     const ty = Math.sin(2 * Math.PI * t) * 2; // taller wave
//     const tz = 0;
//     return optionalTarget.set(tx, ty, tz);
//   }
// }

// const path = new CustomSinCurve();
// const geometry = new THREE.TubeGeometry(path, 80, 1, 16, false);
// const material = new THREE.MeshBasicMaterial({
//   color: 0x00ff00,
//   side: THREE.DoubleSide,
// });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
    ),
    uOffet: new THREE.Uniform(new THREE.Vector2(0, 0)),
    uTime: new THREE.Uniform(0),
  },
});

function range(min, max) {
  return min + Math.random() * (max - min);
}

let number = 100;
let animated = [];

for (let i = 0; i < number; i++) {
  let level = range(-300, 300);
  let precision = 100;
  let rad = 80;
  let spline = [];
  for (let j = 0; j <= precision; j++) {
    let x = rad * Math.sin((Math.PI * 2 * j) / precision);
    let z = rad * Math.cos((Math.PI * 2 * j) / precision);
    spline.push(new THREE.Vector3(x, level, z));
  }

  let sampleClosedSpline = new THREE.CatmullRomCurve3(spline);
  let params = {
    scale: 4,
    extrusionSegments: 400,
    radiusSegments: 16,
    closed: false,
  };

  let tubeGeometry = new THREE.TubeGeometry(
    sampleClosedSpline,
    params.extrusionSegments,
    2,
    params.radiusSegments,
    params.closed,
  );

  let m = material.clone();

  let mesh = new THREE.Mesh(tubeGeometry, m);
  mesh.scale.set(0.01, 0.01, 0.01);
  scene.add(mesh);
  animated.push({
    mesh,
    material: m,
  });
}

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  animated.forEach((item) => {
    item.material.uniforms.uTime.value = elapsedTime;
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();
