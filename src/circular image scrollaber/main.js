import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { extendMSDFMaterial, TextGeometry } from "three-msdf-text";
import GUI from "lil-gui";
import "./style.css";
import fragmentShader from "./shader/fragment.glsl";
import vertexShader from "./shader/vertex.glsl";
import textVertexShader from "./shader/text/vertex.glsl";
import textFragmentShader from "./shader/text/fragment.glsl";
import VirtualScroll from "virtual-scroll";

// GUI setup
const gui = new GUI();

const parameters = {};

const TEXT = [
  "Serenity",
  "Ethereal",
  "Luminous",
  "Ephemeral",
  "Euphoria",
  "Harmony",
  "Radiance",
  "Bliss",
  "Enchanted",
  "Tranquility",
];
let position = 0;
let targetPosition = 0;
let speed = 0;
let targetSpeed = 0;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe2d3b7);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

// Camera setup
const camera = new THREE.PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.1,
  1000,
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
document.body.appendChild(renderer.domElement);

// Orbit Controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

let textMaterial = null;

const group = new THREE.Group();
const planeOrbit = new THREE.Group();
const planeGroup = new THREE.Group();
scene.add(group);
scene.add(planeOrbit);
planeOrbit.add(planeGroup);

//Base Geometry
(async () => {
  const textureLoader = new THREE.TextureLoader();
  const fileLoader = new THREE.FileLoader();
  fileLoader.setResponseType("json");

  try {
    const [atlas, font] = await Promise.all([
      textureLoader.loadAsync("/fonts/limelight/limelight.png"),
      fileLoader.loadAsync("/fonts/limelight/limelight.json"),
    ]);

    textMaterial = extendMSDFMaterial(
      new THREE.ShaderMaterial({
        vertexShader: textVertexShader,
        fragmentShader: textFragmentShader,
        uniforms: {
          uSpeed: new THREE.Uniform(0),
        },
      }),
      { atlas },
    );

    const textSize = 1.8;
    const lineGap = textSize * 1.1;
    const totalHeight = (TEXT.length - 1) * lineGap;

    TEXT.forEach((text, index) => {
      const geometry = new TextGeometry({
        font,
        text: text.toUpperCase(),
        size: textSize,
      });

      const mesh = new THREE.Mesh(geometry, textMaterial);
      mesh.position.y = totalHeight * 0.5 - index * lineGap;
      mesh.position.x = 0;
      group.add(mesh);
    });
  } catch (error) {
    console.error("Failed to load MSDF text assets:", error);
  }
})();

const cylinderRadius = 5;
const planeWidth = 10;
const planeGeometry = new THREE.PlaneGeometry(planeWidth, 6, 80, 1);
const positionAttribute = planeGeometry.attributes.position;

for (let i = 0; i < positionAttribute.count; i += 1) {
  const x = positionAttribute.getX(i);
  const y = positionAttribute.getY(i);
  const theta = x / cylinderRadius;

  const curvedX = Math.sin(theta) * cylinderRadius;
  const curvedZ = Math.cos(theta) * cylinderRadius - cylinderRadius;

  positionAttribute.setXYZ(i, curvedX, y, curvedZ);
}

positionAttribute.needsUpdate = true;
planeGeometry.computeVertexNormals();
const planeMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
  },
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
planeGroup.add(plane);

// Handle window resize
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
  camera.aspect = sizes.width / sizes.height;

  if (textMaterial?.uniforms?.uResolution?.value) {
    textMaterial.uniforms.uResolution.value.set(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio,
    );
  }

  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

const virtualScroll = new VirtualScroll();
virtualScroll.on((event) => {
  targetPosition += event.deltaY / 900;
  speed = event.deltaY / 1200;
});

// Move text to left side
group.position.x = -8;

const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  const positionDamping = 1 - Math.exp(-12 * deltaTime);
  const speedDamping = 1 - Math.exp(-10 * deltaTime);

  position = THREE.MathUtils.lerp(position, targetPosition, positionDamping);
  speed *= 0.9;
  speed = THREE.MathUtils.lerp(speed, targetSpeed, speedDamping);
  group.position.y = -position;

  // Cylindrical plane moves around a circular path using an orbit pivot.
  const orbitRadius = 5;
  const orbitAngle = position * 0.8;

  planeOrbit.position.set(0, 4, 0);
  planeOrbit.rotation.set(0, orbitAngle, 0);

  planeGroup.position.set(orbitRadius, 0, 0);
  // Keep local rotation neutral so inherited orbit rotation makes it follow the path.
  planeGroup.rotation.set(0, 0, 0);
  plane.position.set(0, 0, 0);
  plane.rotation.set(0, 0, 0);

  if (textMaterial) {
    textMaterial.uniforms.uSpeed.value = speed;
  }

  // controls.update();
  renderer.render(scene, camera);
}

animate();
