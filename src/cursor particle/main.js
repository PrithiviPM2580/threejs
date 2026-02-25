import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shader/vertex.glsl";
import fragmentShader from "./shader/fragment.glsl";
import GUI from "lil-gui";
import "./style.css";

// GUI setup
const gui = new GUI();

//Texture loader
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("/textures/lion.png");

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000,
);
camera.position.z = 10;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
document.body.appendChild(renderer.domElement);

//Displacement
const displacement = {};
displacement.canvas = document.createElement("canvas");
displacement.canvas.width = 128;
displacement.canvas.height = 128;
displacement.canvas.style.position = "fixed";
displacement.canvas.style.width = "256px";
displacement.canvas.style.height = "256px";
displacement.canvas.style.top = 0;
displacement.canvas.style.left = 0;
displacement.canvas.style.zIndex = 10;
document.body.appendChild(displacement.canvas);

//context
displacement.context = displacement.canvas.getContext("2d");
displacement.context.fillRect(
  0,
  0,
  displacement.canvas.width,
  displacement.canvas.height,
);

//Glow Image
displacement.glowImage = new Image();
displacement.glowImage.src = "/particles/black/circle_05.png";
window.setTimeout(() => {
  displacement.context.drawImage(displacement.glowImage, 20, 20, 32, 32);
}, 1000);

displacement.intractiveMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshBasicMaterial({ color: "red", wireframe: true }),
);

displacement.intractiveMesh.visible = false;
scene.add(displacement.intractiveMesh);

displacement.raycaster = new THREE.Raycaster();

displacement.screenCursor = new THREE.Vector2(999, 999);
displacement.canvasCursor = new THREE.Vector2(999, 999);

window.addEventListener("pointermove", (e) => {
  displacement.screenCursor.x = (e.clientX / sizes.width) * 2 - 1;
  displacement.screenCursor.y = -(e.clientY / sizes.height) * 2 + 1;
});

displacement.texture = new THREE.CanvasTexture(displacement.canvas);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

//geometry and material
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128);
particlesGeometry.setIndex(null);

const intensityArray = new Float32Array(
  particlesGeometry.attributes.position.count,
);

const angleArray = new Float32Array(
  particlesGeometry.attributes.position.count,
);
for (let i = 0; i < intensityArray.length; i++) {
  intensityArray[i] = Math.random();
  angleArray[i] = Math.random() * Math.PI * 2;
}

particlesGeometry.setAttribute(
  "aIntensity",
  new THREE.BufferAttribute(intensityArray, 1),
);

particlesGeometry.setAttribute(
  "aAngle",
  new THREE.BufferAttribute(angleArray, 1),
);

const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uColor: new THREE.Uniform(new THREE.Color(0xffffff)),
    uTexture: new THREE.Uniform(particleTexture),
    uDisplacementTexture: new THREE.Uniform(displacement.texture),
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        sizes.width * sizes.pixelRatio,
        sizes.height * sizes.pixelRatio,
      ),
    ),
  },
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(particlesGeometry, material);
scene.add(particles);

// Handle window resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
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

  controls.update();

  displacement.raycaster.setFromCamera(displacement.screenCursor, camera);
  const intersects = displacement.raycaster.intersectObject(
    displacement.intractiveMesh,
  );

  if (intersects.length) {
    const uv = intersects[0].uv;
    displacement.canvasCursor.x = uv.x * displacement.canvas.width;
    displacement.canvasCursor.y = (1 - uv.y) * displacement.canvas.height;
  }

  displacement.context.globalCompositeOperation = "source-over";
  displacement.context.globalAlpha = 0.02;
  displacement.context.fillRect(
    0,
    0,
    displacement.canvas.width,
    displacement.canvas.height,
  );

  const glowSize = displacement.glowImage.width * 0.25;
  displacement.context.globalCompositeOperation = "lighten";
  displacement.context.globalAlpha = 1;
  displacement.context.drawImage(
    displacement.glowImage,
    displacement.canvasCursor.x - glowSize * 0.5,
    displacement.canvasCursor.y - glowSize * 0.5,
    glowSize,
    glowSize,
  );

  displacement.texture.needsUpdate = true;
  renderer.render(scene, camera);
}

animate();
