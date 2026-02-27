import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";

// GUI setup
const gui = new GUI();

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRation: Math.min(window.devicePixelRatio, 2),
};

// Camera setup
const camera = new THREE.PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.1,
  1000,
);
camera.position.z = 200;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRation);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

//Geometry
const planeGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);

const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  side: THREE.DoubleSide,
});

//Material
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uSize: new THREE.Uniform(10.0),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRation,
        sizes.height * sizes.pixelRation,
      ),
    ),
  },
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

//GLTF Loader
const gltfLoader = new GLTFLoader();
gltfLoader.load("/models/beyonce/beyonce.glb", (gltf) => {
  scene.add(gltf.scene);

  const geometry = new THREE.BufferGeometry();
  const positionArray =
    gltf.scene.children[0].geometry.attributes.position.array;

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positionArray, 3),
  );

  const points = new THREE.Points(geometry, material);
  scene.add(points);
});

//Raycaster and mouse setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / sizes.width) * 2 - 1;
  mouse.y = -(e.clientY / sizes.height) * 2 + 1;
});

// Handle window resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRation);
});

const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([plane]);

  if (intersects.length > 0) {
    console.log("Mouse is intersecting with the plane");
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
