import * as THREE from "three";
import { vertexShader, fragmentShader } from "./particleShaders";
import logoSrc from "../../assets/logo_white.png";

const ALPHA_THRESHOLD = 128;
const GRID_SIZE = 130;
const SCALE = 9;
const BRAND_BLUE = new THREE.Color("#3aa7de");
// Our shader writes straight to the canvas without three's linear->sRGB step, so on a light background the
// converted colour above renders too dark. This keeps the exact #3aa7de numbers.
const BRAND_BLUE_ON_LIGHT = new THREE.Color().setRGB(58 / 255, 167 / 255, 222 / 255, THREE.LinearSRGBColorSpace);
const DRAG_RESPONSE = 0.02;
const RELEASE_DECAY = 1.1;

function sampleImageToGrid(image: HTMLImageElement): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const cells: number[] = [];
  for (let gy = 0; gy < GRID_SIZE; gy++) {
    for (let gx = 0; gx < GRID_SIZE; gx++) {
      const px = Math.floor(((gx + 0.5) / GRID_SIZE) * width);
      const py = Math.floor(((gy + 0.5) / GRID_SIZE) * height);
      const i = (py * width + px) * 4;
      if (data[i + 3] > ALPHA_THRESHOLD) {
        cells.push((gx / GRID_SIZE - 0.5) * SCALE, -((gy / GRID_SIZE - 0.5) * SCALE));
      }
    }
  }
  return new Float32Array(cells);
}

export type ParticleLogo = {
  dispose: () => void;
  /** 0..1 — the lock-screen slide. The particles scatter and orbit as it rises and fade out near 1. */
  setUnlockProgress: (p: number) => void;
};

export type ParticleLogoOptions = {
  reducedMotion: boolean;
  /** Draw for a light background (default). false = additive glow for a dark background. */
  light?: boolean;
};

// A direct, imperative Three.js mount (mirroring the CodePen reference's structure
export function mountParticleLogo(container: HTMLDivElement, { reducedMotion, light = true }: ParticleLogoOptions): ParticleLogo {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 13);

  // On tall/narrow containers (a phone) the logo would be cropped at the sides, so back the camera off
  // until its width fits. On landscape containers this stays at the original distance (13).
  function fitCamera() {
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const distanceForWidth = ((SCALE / 2) * 1.15) / (Math.tan(halfFov) * camera.aspect);
    camera.position.z = Math.max(13, distanceForWidth);
  }
  fitCamera();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  const canvas = renderer.domElement;

  const uniforms = {
    uTime: { value: 0 },
    uChaos: { value: 0 },
    // Normal blending stacks overlapping points into a solid mass, so light mode uses smaller dots.
    uSize: { value: light ? 2.2 : 3.6 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uColor: { value: light ? BRAND_BLUE_ON_LIGHT : BRAND_BLUE },
    uLight: { value: light ? 1 : 0 },
    uFade: { value: 1 },
  };

  let points: THREE.Points | null = null;
  let cancelled = false;
  let unlockProgress = 0;

  const image = new Image();
  image.src = logoSrc;
  image.onload = () => {
    if (cancelled) return;
    const grid = sampleImageToGrid(image);
    const count = grid.length / 2;
    const homePositions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      homePositions[i * 3] = grid[i * 2];
      homePositions[i * 3 + 1] = grid[i * 2 + 1];
      homePositions[i * 3 + 2] = 0;
      seeds[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(homePositions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: light ? THREE.NormalBlending : THREE.AdditiveBlending,
    });

    points = new THREE.Points(geometry, material);
    scene.add(points);
  };

  // Drag interaction — listeners live on the exact canvas element we created,
  // so there's no ambiguity about wrapper divs or which node receives events.
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let dragVelocity = 0;
  let chaosTarget = 0;

  function onDown(e: PointerEvent) {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    chaosTarget = Math.max(chaosTarget, 0.3);
  }
  function onMove(e: PointerEvent) {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    dragVelocity += Math.sqrt(dx * dx + dy * dy);
    lastX = e.clientX;
    lastY = e.clientY;
  }
  function onUp() {
    isDragging = false;
  }

  if (!reducedMotion) {
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onUp);
  }

  function onResize() {
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / clientHeight;
    fitCamera();
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  }
  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();
  let rafId = 0;
  function animate() {
    rafId = requestAnimationFrame(animate);
    const delta = clock.getDelta();
    uniforms.uTime.value = clock.elapsedTime;

    if (!reducedMotion) {
      if (isDragging && dragVelocity > 0) {
        chaosTarget = Math.min(1, chaosTarget + dragVelocity * DRAG_RESPONSE);
        dragVelocity = 0;
      } else {
        chaosTarget = Math.max(0, chaosTarget - delta * RELEASE_DECAY);
      }
      // The lock-screen slide drives the same scatter/orbit as a drag on the logo does.
      const slideChaos = THREE.MathUtils.smoothstep(unlockProgress, 0, 0.85);
      uniforms.uChaos.value = THREE.MathUtils.lerp(uniforms.uChaos.value, Math.max(chaosTarget, slideChaos), 0.15);
    }
    uniforms.uFade.value = 1 - THREE.MathUtils.smoothstep(unlockProgress, 0.6, 1);

    renderer.render(scene, camera);
  }
  animate();

  function dispose() {
    cancelled = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointerleave", onUp);
    if (points) {
      points.geometry.dispose();
      (points.material as THREE.Material).dispose();
    }
    renderer.dispose();
    if (container.contains(canvas)) {
      container.removeChild(canvas);
    }
  }

  return {
    dispose,
    setUnlockProgress: (p) => {
      unlockProgress = p;
    },
  };
}
