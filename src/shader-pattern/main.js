import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import GUI from "lil-gui";
import "./style.css";
import colors from "nice-color-palettes";

let pallate = colors[Math.floor(Math.random() * 100)];

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color("#000000");

scene.rotation.z = Math.PI / 9;

// const gui = new GUI();

// const parameters = {
//   offset: 0,
//   color: "#000000",
// };

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
camera.position.z = 4;

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
    uOffset: new THREE.Uniform(0),
    uTime: new THREE.Uniform(0),
    uColor: new THREE.Uniform(new THREE.Color("#000000")),
  },
});

function range(min, max) {
  return min + Math.random() * (max - min);
}

let number = 100;
let animated = [];

for (let i = 0; i < number; i++) {
  let level = range(-300, 300);
  let zero = level / 300;
  let precision = 100;
  let rad = 130 * zero * zero + Math.random() * 10;
  let spline = [];
  let offset = Math.abs(zero);
  let width = Math.random() * 0.5 + 0.5;
  let angle = range(0, Math.PI * 2);

  let center = {
    x: range(-10, 10),
    y: range(-10, 10),
  };
  for (let j = 0; j <= precision * width; j++) {
    let x = center.x + rad * Math.sin((Math.PI * 2 * j) / precision);
    let z = center.y + rad * Math.cos((Math.PI * 2 * j) / precision);
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
    1.5,
    params.radiusSegments,
    params.closed,
  );

  let tubeGeometry1 = new THREE.TubeGeometry(
    sampleClosedSpline,
    params.extrusionSegments,
    2,
    params.radiusSegments,
    params.closed,
  );

  let m = material.clone();
  let m1 = material.clone();

  let mesh = new THREE.Mesh(tubeGeometry, m);
  let mesh1 = new THREE.Mesh(tubeGeometry1, m1);
  m.uniforms.uColor.value = new THREE.Color(
    pallate[Math.floor(Math.random() * 5)],
  );
  m.uniforms.uOffset.value = offset;
  m1.uniforms.uOffset.value = offset;
  m1.side = THREE.BackSide;
  mesh.scale.set(0.01, 0.01, 0.01);
  mesh1.scale.set(0.01, 0.01, 0.01);

  mesh.rotation.y = mesh1.rotation.y = angle;
  scene.add(mesh);
  scene.add(mesh1);
  animated.push({
    mesh,
    material: m,
    material1: m1,
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
    item.material1.uniforms.uTime.value = elapsedTime;
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();
