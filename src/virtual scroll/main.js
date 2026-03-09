import * as THREE from "three";
import "./style.css";

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

camera.position.z = 10;
camera.position.y = 0;

let scrollTarget = 0;
let scrollCurrent = 0;
const maxScroll = (totalSections - 1) * sectionHeight;
const baseDamping = 0.08;

window.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    scrollTarget += event.deltaY * 0.01;
    scrollTarget = Math.max(0, Math.min(maxScroll, scrollTarget));
  },
  { passive: false },
);

let lastTouchY = 0;

window.addEventListener("touchstart", (event) => {
  lastTouchY = event.touches[0].clientY;
});

window.addEventListener(
  "touchmove",
  (event) => {
    event.preventDefault();
    const touchY = event.touches[0].clientY;
    const deltaY = lastTouchY - touchY;
    scrollTarget += deltaY * 0.05;
    scrollTarget = Math.max(0, Math.min(maxScroll, scrollTarget));
    lastTouchY = touchY;
  },
  { passive: false },
);

window.addEventListener("keydown", (e) => {
  const scrollSpeed = sectionHeight;
  const fastScrollSpeed = sectionHeight * 3;

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      scrollTarget = Math.min(maxScroll, scrollTarget + scrollSpeed);
      break;
    case "ArrowUp":
      e.preventDefault();
      scrollTarget = Math.max(0, scrollTarget - scrollSpeed);
      break;
    case "PageDown":
      e.preventDefault();
      scrollTarget = Math.min(maxScroll, scrollTarget + fastScrollSpeed);
      break;
    case "PageUp":
      e.preventDefault();
      scrollTarget = Math.max(0, scrollTarget - fastScrollSpeed);
      break;
    case "Home":
      e.preventDefault();
      scrollTarget = 0;
      break;
    case "End":
      e.preventDefault();
      scrollTarget = maxScroll;
      break;
  }
});

const statusElement = document.getElementById("scroll-status");
let lastAnnouncedSection = 1;

function updateScreenReaderStatus() {
  const currentSection = Math.round(scrollCurrent / sectionHeight) + 1;
  if (currentSection !== lastAnnouncedSection) {
    statusElement.textContent = `Viewing section ${currentSection} of ${totalSections}`;
    lastAnnouncedSection = currentSection;
  }
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function animate() {
  requestAnimationFrame(animate);

  const damping = preferReduceMotion ? 1 : baseDamping;
  scrollCurrent += (scrollTarget - scrollCurrent) * damping;

  camera.position.y = -scrollCurrent;

  const progress = (scrollCurrent / maxScroll) * 100;
  document.querySelector(".scroll-progress-fill").style.height = `${progress}%`;

  objects.forEach((obj) => {
    const distanceFromcamera = Math.abs(
      obj.mesh.position.y - camera.position.y,
    );
    const scale = Math.max(0.5, 1 - distanceFromcamera / 15);
    obj.mesh.scale.setScalar(scale);

    // if (!preferReduceMotion) {
    //   obj.mesh.rotation.z += 0.001;
    // }
  });

  // Update light positions
  pointLight.position.y = camera.position.y + 5;
  pointLight2.position.y = camera.position.y - 5;

  // Update screen reader status
  updateScreenReaderStatus();

  renderer.render(scene, camera);
}

animate();
