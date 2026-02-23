import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import GUI from "lil-gui";
import "./style.css";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 4;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

//Texture Loader
const textureLoader = new THREE.TextureLoader();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const parameters = {
  rotationX: 0.33,
  rotationY: 0.87,
  rotationZ: 0,
  smokeRotationX: 0.25,
  smokeRotationY: 3.19,
  smokeRotationZ: 0,
  smokePositionY: 0.42,
  smokeColor: "#ffffff",
};

const gui = new GUI();

gui
  .add(parameters, "rotationX", 0, Math.PI * 2)
  .name("Rotation X")
  .onChange((value) => {
    const model = scene.getObjectByName("coffee_cup");
    if (model) {
      model.rotation.x = value;
    }
  });

gui
  .add(parameters, "rotationY", 0, Math.PI * 2)
  .name("Rotation Y")
  .onChange((value) => {
    const model = scene.getObjectByName("coffee_cup");
    if (model) {
      model.rotation.y = value;
    }
  });

gui
  .add(parameters, "rotationZ", 0, Math.PI * 2)
  .name("Rotation Z")
  .onChange((value) => {
    const model = scene.getObjectByName("coffee_cup");
    if (model) {
      model.rotation.z = value;
    }
  });

gui
  .add(parameters, "smokeRotationX", 0, Math.PI * 2)
  .name("Smoke Rotation X")
  .onChange((value) => {
    smoke.rotation.x = value;
  });

gui
  .add(parameters, "smokeRotationY", 0, Math.PI * 2)
  .name("Smoke Rotation Y")
  .onChange((value) => {
    smoke.rotation.y = value;
  });

gui
  .add(parameters, "smokeRotationZ", 0, Math.PI * 2)
  .name("Smoke Rotation Z")
  .onChange((value) => {
    smoke.rotation.z = value;
  });

gui
  .add(parameters, "smokePositionY", -2, 2)
  .name("Smoke Position Y")
  .onChange((value) => {
    smoke.position.y = value;
  });

gui
  .addColor(parameters, "smokeColor")
  .name("Smoke Color")
  .onChange((value) => {
    smokeMaterial.uniforms.uColor.value = new THREE.Color(value);
  });

const loader = new GLTFLoader();

loader.load(
  "/models/coffee_cup/scene.gltf",
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(6, 6, 6);
    model.rotation.x = parameters.rotationX;
    model.rotation.y = parameters.rotationY;
    model.rotation.z = parameters.rotationZ;
    model.name = "coffee_cup";
    scene.add(model);
  },
  undefined,
  (error) => {
    console.error("An error occurred while loading the model:", error);
  },
);

// Geometry and Material
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
smokeGeometry.translate(0, 0.5, 0);
smokeGeometry.scale(0.8, 2.2, 0.8);

const smokeTexture = textureLoader.load("/textures/smoke.png");
smokeTexture.wrapS = THREE.RepeatWrapping;
smokeTexture.wrapT = THREE.RepeatWrapping;

const smokeMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uPerlinTexture: { value: smokeTexture },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(parameters.smokeColor) },
  },
  side: THREE.DoubleSide,
  transparent: true,
  depthWrite: false,
  // wireframe: true,
});

const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
smoke.rotation.x = parameters.smokeRotationX;
smoke.rotation.y = parameters.smokeRotationY;
smoke.rotation.z = parameters.smokeRotationZ;
smoke.position.y = parameters.smokePositionY;
scene.add(smoke);

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

  smokeMaterial.uniforms.uTime.value = elapsedTime;

  controls.update();
  renderer.render(scene, camera);
}

animate();
