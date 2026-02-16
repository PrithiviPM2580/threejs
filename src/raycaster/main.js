import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./style.css";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 8;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xff0000 }),
);
object1.position.x = -2;

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0x0000ff }),
);

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 }),
);
object3.position.x = 2;

scene.add(object1, object2, object3);

//Raycaster setup
const raycaster = new THREE.Raycaster();
// const rayOrigin = new THREE.Vector3(-3, 0, 0);
// const rayDirection = new THREE.Vector3(10, 0, 0);
// rayDirection.normalize();

// const intersect = raycaster.intersectObject(object2);

// const intersects = raycaster.intersectObjects([object1, object2, object3]);

// Handle window resize

const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // const rayOrigin = new THREE.Vector3(-3, 0, 0);
  // const rayDirection = new THREE.Vector3(10, 0, 0);
  // rayDirection.normalize();

  // const objectsToTest = [object1, object2, object3];
  // raycaster.set(rayOrigin, rayDirection);
  // const intersects = raycaster.intersectObjects(objectsToTest);

  const objectsToTest = [object1, object2, object3];
  raycaster.setFromCamera(mouse, camera);
  const intersectsMouse = raycaster.intersectObjects(objectsToTest);

  for (const object of objectsToTest) {
    object.material.color.set(0x00ff00);
  }

  for (const intersect of intersectsMouse) {
    intersect.object.material.color.set(0xff0000);
  }

  object1.position.y = Math.sin(Date.now() * 0.001) * 4;
  object2.position.y = Math.sin(Date.now() * 0.002) * 4;
  object3.position.y = Math.sin(Date.now() * 0.003) * 4;
  controls.update();
  renderer.render(scene, camera);
}

animate();
