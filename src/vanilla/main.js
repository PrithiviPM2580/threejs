import * as THREE from "three";
import "./style.css";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb0b0a);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 1.5);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);

let scrollTarget = 0;
let scrollCurrent = 0;
const baseDamping = 0.1;

const objects = [];
const sections = 12;
const maxScroll = (sections - 1) * 8;
const height = 8;

for (let section = 0; section < sections; section++) {
  const y = -section * height;

  const radius = 6;
  const torGeo = new THREE.TorusGeometry(radius, 0.3, 16, 100);
  const torMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(`hsl(${(section * 360) / sections},100%,50%)`),
    roughness: 0.2,
    metalness: 0.7,
    emissive: new THREE.Color(`hsl(${(section * 360) / sections},100%,50%)`),
    emissiveIntensity: 0.5,
  });
  const torMesh = new THREE.Mesh(torGeo, torMat);
  torMesh.position.y = y;
  torMesh.rotation.x = Math.PI / 2;
  scene.add(torMesh);
  objects.push({
    mesh: torMesh,
    section,
    baseY: y,
  });
}

camera.position.z = 10;
camera.position.y = 0;

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    scrollTarget += event.deltaY * 0.01;
    scrollTarget = Math.max(0, Math.min(maxScroll, scrollTarget));
  },
  { passive: false },
);

function animate() {
  requestAnimationFrame(animate);

  scrollCurrent += (scrollTarget - scrollCurrent) * baseDamping;
  camera.position.y = -scrollCurrent;

  const progress = (scrollCurrent / maxScroll) * 100;
  document.querySelector(".scroll-progress-fill").style.height = `${progress}%`;

  renderer.render(scene, camera);
}

animate();
