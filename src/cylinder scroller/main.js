import * as THREE from "three";
import Lenis from "lenis";

window.addEventListener("load", () => {
  const lenis = new Lenis();

  // Create a real scroll range since the scene UI is fully fixed-position.
  const existingSpacer = document.querySelector(".scroll-spacer");
  if (!existingSpacer) {
    const spacer = document.createElement("div");
    spacer.className = "scroll-spacer";
    spacer.style.height = "700vh";
    spacer.style.width = "1px";
    spacer.style.opacity = "0";
    spacer.style.pointerEvents = "none";
    document.body.appendChild(spacer);
  }

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  const images = [];

  let loadedImageCount = 0;
  const totalImages = 6;

  function loadImages() {
    for (let i = 1; i <= totalImages; i++) {
      const img = new Image();
      img.onload = () => {
        images.push(img);
        loadedImageCount++;

        if (loadedImageCount === totalImages) {
          init();
        }
      };
      img.onerror = () => {
        loadedImageCount++;
        if (loadedImageCount === totalImages) {
          init();
        }
      };
      img.src = `/images/img${i}.png`;
    }
  }

  function init() {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("canvas"),
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000);

    const parentWidth = 20;
    const parentHeight = 20;
    const curvature = 35;
    const segmentsX = 200;
    const segmentsY = 200;

    const parentGeometry = new THREE.PlaneGeometry(
      parentWidth,
      parentHeight,
      segmentsX,
      segmentsY,
    );

    const positions = parentGeometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      const distanceFromCenter = Math.abs(y / (parentHeight / 2));
      positions[i + 2] = Math.pow(distanceFromCenter, 2) * curvature;
    }
    parentGeometry.computeVertexNormals();

    const totalSlides = images.length;
    const slideHeight = 15;
    const gap = 0.5;
    const cycleHeight = totalSlides * (slideHeight + gap);

    const textureCanvas = document.createElement("canvas");
    const ctx = textureCanvas.getContext("2d", {
      alpha: false,
      willReadFrequently: true,
    });
    textureCanvas.width = 2048;
    textureCanvas.height = 8192;

    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

    const parentMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    const parentMesh = new THREE.Mesh(parentGeometry, parentMaterial);
    parentMesh.position.set(0, 0, 0);
    parentMesh.rotation.x = THREE.MathUtils.degToRad(-20);
    parentMesh.rotation.y = THREE.MathUtils.degToRad(20);
    scene.add(parentMesh);

    const distance = 17.5;
    const heightOffset = 5;
    const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(20));
    const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(20));
    camera.position.set(offsetX, heightOffset, offsetZ);
    camera.lookAt(0, -2, 0);
    camera.rotation.z = THREE.MathUtils.degToRad(-5);

    const slideTitles = [
      "Field Unit",
      "Astral Convergence",
      "Neon Mirage",
      "Eclipse Protocol",
      "Quantum Drift",
      "Celestial Nexus",
    ];

    function updateTexture(offset = 0) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
      const fontSize = 180;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const extrsSlides = 2;

      for (let i = -extrsSlides; i < totalSlides + extrsSlides; i++) {
        let slideY = -i * (slideHeight + gap);
        slideY += offset * cycleHeight;

        const textureY = (slideY / cycleHeight) * textureCanvas.height;
        let wrappedY = textureY % textureCanvas.height;
        if (wrappedY < 0) wrappedY += textureCanvas.height;

        let slideIndex = ((-i % totalSlides) + totalSlides) % totalSlides;
        let slideNumber = slideIndex + 1;

        const slideRect = {
          x: textureCanvas.width * 0.05,
          y: wrappedY,
          width: textureCanvas.width * 0.9,
          height: (slideHeight / cycleHeight) * textureCanvas.height,
        };

        const img = images[slideIndex];
        if (img) {
          const imgAspect = img.width / img.height;
          const rectAspect = slideRect.width / slideRect.height;
          let drawWidth, drawHeight, drawX, drawY;

          if (imgAspect > rectAspect) {
            drawWidth = slideRect.height * imgAspect;
            drawHeight = slideRect.height;
            drawX = slideRect.x + (slideRect.width - drawWidth) / 2;
            drawY = slideRect.y;
          } else {
            drawWidth = slideRect.width;
            drawHeight = slideRect.width / imgAspect;
            drawX = slideRect.x;
            drawY = slideRect.y + (slideRect.height - drawHeight) / 2;
          }

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(
            slideRect.x,
            slideRect.y,
            slideRect.width,
            slideRect.height,
          );
          ctx.clip();
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          ctx.restore();

          ctx.fillStyle = "white";
          ctx.fillText(
            slideTitles[slideIndex],
            textureCanvas.width / 2,
            wrappedY + slideRect.height / 2,
          );
        }
      }
      texture.needsUpdate = true;
    }
    let currentScroll = 0;
    lenis.on("scroll", ({ scroll, limit }) => {
      const fallbackLimit = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      const safeLimit = limit > 0 ? limit : fallbackLimit;

      currentScroll = scroll / safeLimit;
      updateTexture(-currentScroll);
      renderer.render(scene, camera);
    });

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateTexture(-currentScroll);
        renderer.render(scene, camera);
      }, 200);
    });

    updateTexture(0);
    renderer.render(scene, camera);
  }

  loadImages();
});
