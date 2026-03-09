import * as THREE from "three";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";

const preferReduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
scene.fog = new THREE.Fog(0x0a0a0a, 5, 35);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

renderer.domElement.setAttribute("role", "img");
renderer.domElement.setAttribute(
  "aria-label",
  "A dynamic 3D visualization of a virtual scroll effect, where a plane geometry is deformed based on the user's scroll position, creating an immersive and interactive experience.",
);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 1.5);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);

const objects = [];
const totalSections = 12;
const sectionHeight = 8;

for (let section = 0; section < totalSections; section++) {
  const y = -section * sectionHeight;
  const ringRadius = 6;

  const torusGeo = new THREE.TorusGeometry(ringRadius, 0.3, 16, 32);
  const torusMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(section / totalSections, 0.8, 0.5),
    roughness: 0.2,
    metalness: 0.7,
    emissive: new THREE.Color().setHSL(section / totalSections, 0.8, 0.3),
    emissiveIntensity: 0.3,
  });

  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.y = y;
  torus.rotation.x = Math.PI / 2;
  scene.add(torus);
  objects.push({
    mesh: torus,
    baseY: y,
    section: section,
  });
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();
