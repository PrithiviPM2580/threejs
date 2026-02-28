import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";

// GUI setup
const gui = new GUI();

const parameters = {
  size: 1,
};

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

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
const planeGeometry = new THREE.PlaneGeometry(250, 450, 1, 1);

const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  visible: false,
});

//Material
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uSize: new THREE.Uniform(parameters.size),
    uMouse: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRation,
        sizes.height * sizes.pixelRation,
      ),
    ),
    uTime: new THREE.Uniform(0),
  },
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

let points;

//GLTF Loader
const gltfLoader = new GLTFLoader();
gltfLoader.load("/models/beyonce/beyonce.glb", (gltf) => {
  const geometry = new THREE.BufferGeometry();
  const originalPositions =
    gltf.scene.children[0].geometry.attributes.position.array;

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(originalPositions, 3),
  );

  points = new THREE.Points(geometry, material);
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

gui
  .add(parameters, "size")
  .min(0.1)
  .max(2)
  .step(0.01)
  .onChange((value) => {
    material.uniforms.uSize.value = value;
  });

const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  if (points) {
    material.uniforms.uTime.value = elapsedTime;

    // points.rotation.y += 0.01;
  }

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([plane]);

  if (intersects.length > 0) {
    material.uniforms.uMouse.value = intersects[0].point;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
