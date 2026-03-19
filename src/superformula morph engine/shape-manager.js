import * as THREE from "three";

export class ShapeManager {
  constructor(SHAPES, CONFIG, material, geometry, superShape) {
    this.SHAPES = SHAPES;
    this.CONFIG = CONFIG;
    this.material = material;
    this.geometry = geometry;
    this.superShape = superShape;
    this.currentIndex = 0;
    this.nextIndex = 1;
    this.transitionStartTime = 0;
    this.isTransitioning = false;
    this.duration = 2000;
    this.holdTime = 3000;
    this.lastSwitchTime = Date.now();
    this.currentParams = { ...this.SHAPES[0].params };
    this.currentScaleMult = this.SHAPES[0].scaleMultiplier;
    this.setInitialState();
  }
  setInitialState() {
    const s = this.SHAPES[this.currentIndex];
    this.material.uniforms.uColorA1.value.setHex(s.accent[0]);
    this.material.uniforms.uColorA2.value.setHex(s.accent[1]);
    this.material.uniforms.uColorA3.value.setHex(s.accent[2]);
    this.material.uniforms.uColorB1.value.setHex(s.accent[0]);
    this.material.uniforms.uColorB2.value.setHex(s.accent[1]);
    this.material.uniforms.uColorB3.value.setHex(s.accent[2]);
    this.currentParams = { ...s.params };
    this.currentScaleMult = s.scaleMultiplier;
    this.updateGeometry();
    this.updateUI(s.name, s.accent[1]);
  }
  updateUI(name, colorHex) {
    const el = document.getElementById("current-theme-name");
    const valM = document.getElementById("val-m");
    const valN1 = document.getElementById("val-n1");
    const valN2 = document.getElementById("val-n2");
    const valN3 = document.getElementById("val-n3");
    const infoPanel = document.getElementById("info");
    const musicPanel = document.getElementById("music-player");

    const c = new THREE.Color(colorHex);
    const cssColor = `rgb(${Math.floor(c.r * 255)}, ${Math.floor(c.g * 255)}, ${Math.floor(c.b * 255)})`;
    infoPanel.style.setProperty("--accent-color", cssColor);
    musicPanel.style.setProperty("--accent-color", cssColor);
    el.textContent = name;
    valM.textContent = this.currentParams.m.toFixed(1);
    valN1.textContent = this.currentParams.n1.toFixed(1);
    valN2.textContent = this.currentParams.n2.toFixed(1);
    valN3.textContent = this.currentParams.n3.toFixed(1);
  }

  updateGeometry() {
    const posAttribute = this.geometry.attributes.position;
    const arr = posAttribute.array;
    const p = this.currentParams;
    const finalScale = this.CONFIG.baseScale * this.currentScaleMult;
    let idx = 0;
    const totalPoints = this.CONFIG.points;
    const revolutions = 200;
    for (let i = 0; i < totalPoints; i++) {
      const progress = i / totalPoints;
      const phi = progress * Math.PI * 2 * revolutions;
      const theta = progress * Math.PI - Math.PI / 2;
      const r1 = this.superShape(phi, p.m, p.n1, p.n2, p.n3, p.a, p.b);
      const r2 = this.superShape(theta, p.m, p.n1, p.n2, p.n3, p.a, p.b);
      const x = finalScale * r1 * Math.cos(phi) * r2 * Math.cos(theta);
      const y = finalScale * r1 * Math.sin(phi) * r2 * Math.cos(theta);
      const z = finalScale * r2 * Math.sin(theta);
      arr[idx++] = x;
      arr[idx++] = y;
      arr[idx++] = z;
    }
    posAttribute.needsUpdate = true;
  }
  update() {
    const now = Date.now();
    if (!this.isTransitioning) {
      if (now - this.lastSwitchTime > this.holdTime) {
        this.startTransition(now);
      }
    } else {
      const elapsed = now - this.transitionStartTime;
      const rawProgress = Math.min(elapsed / this.duration, 1.0);
      const progress =
        rawProgress < 0.5
          ? 2 * rawProgress * rawProgress
          : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
      this.material.uniforms.uTransition.value = progress;
      const startS = this.SHAPES[this.currentIndex];
      const endS = this.SHAPES[this.nextIndex];
      this.currentParams.m = THREE.MathUtils.lerp(
        startS.params.m,
        endS.params.m,
        progress,
      );
      this.currentParams.n1 = THREE.MathUtils.lerp(
        startS.params.n1,
        endS.params.n1,
        progress,
      );
      this.currentParams.n2 = THREE.MathUtils.lerp(
        startS.params.n2,
        endS.params.n2,
        progress,
      );
      this.currentParams.n3 = THREE.MathUtils.lerp(
        startS.params.n3,
        endS.params.n3,
        progress,
      );
      this.currentScaleMult = THREE.MathUtils.lerp(
        startS.scaleMultiplier,
        endS.scaleMultiplier,
        progress,
      );
      this.updateGeometry();
      document.getElementById("val-m").textContent =
        this.currentParams.m.toFixed(1);
      document.getElementById("val-n1").textContent =
        this.currentParams.n1.toFixed(1);
      document.getElementById("val-n2").textContent =
        this.currentParams.n2.toFixed(1);
      document.getElementById("val-n3").textContent =
        this.currentParams.n3.toFixed(1);
      if (rawProgress >= 1.0) {
        this.completeTransition(now);
      }
    }
  }
  startTransition(now) {
    this.isTransitioning = true;
    this.transitionStartTime = now;
    const nextTheme = this.SHAPES[this.nextIndex];
    this.material.uniforms.uColorB1.value.setHex(nextTheme.accent[0]);
    this.material.uniforms.uColorB2.value.setHex(nextTheme.accent[1]);
    this.material.uniforms.uColorB3.value.setHex(nextTheme.accent[2]);
    this.updateUI(nextTheme.name, nextTheme.accent[1]);
  }

  completeTransition(now) {
    this.isTransitioning = false;
    this.lastSwitchTime = now;
    this.material.uniforms.uTransition.value = 0.0;
    this.material.uniforms.uColorA1.value.copy(
      this.material.uniforms.uColorB1.value,
    );
    this.material.uniforms.uColorA2.value.copy(
      this.material.uniforms.uColorB2.value,
    );
    this.material.uniforms.uColorA3.value.copy(
      this.material.uniforms.uColorB3.value,
    );
    this.currentIndex = this.nextIndex;
    this.nextIndex = (this.nextIndex + 1) % this.SHAPES.length;
  }
}
