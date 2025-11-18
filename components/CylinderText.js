"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ======= TWEAKABLE CONSTANTS =======
const TEXT = "VICUS VENTURES";
const TEXT_CANVAS_WIDTH = 4096;
const TEXT_CANVAS_HEIGHT = 1024;
const LETTER_SPACING_FACTOR = 1.4;

// make it big so it downsamples sharply
const FONT_SIZE = 360; // (you can tune this)
const CYLINDER_RADIUS = 3.0;
const CYLINDER_HEIGHT = 3.0;

const ROTATION_SPEED = 0.25;
const GLOBAL_SCALE = 1.4;

// Multi-row behavior
const ROW_COUNT = 2; // 2 rows
const ROW_VERTICAL_OFFSET = 0.9; // separation in Y between rows
const ROW_DEPTH_OFFSET = 0.35; // slight Z depth difference (currently unused)
const ANGULAR_OFFSET_DEG = 18; // how far "ahead" row 2 is (in degrees)

export default function CylinderText() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const RENDER_WIDTH = 348;
    const RENDER_HEIGHT = 272;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT);
    renderer.setClearColor(0x000000, 0); // FULL TRANSPARENT BG

    // --- Scene + Camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      35,
      RENDER_WIDTH / RENDER_HEIGHT,
      0.1,
      100
    );
    camera.position.set(0, 0, 16);
    camera.lookAt(0, 0, 0);

    // two-level group: tilt (static) + root (spins)
    const tiltGroup = new THREE.Group();
    scene.add(tiltGroup);

    const root = new THREE.Group();
    root.scale.setScalar(GLOBAL_SCALE);
    tiltGroup.add(root);

    // static tilt
    tiltGroup.rotation.set(
      THREE.MathUtils.degToRad(0),
      THREE.MathUtils.degToRad(35),
      THREE.MathUtils.degToRad(-25)
    );

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(4, 6, 8);
    scene.add(light);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    // --- TEXT TEXTURE ---
    const texCanvas = document.createElement("canvas");
    texCanvas.width = TEXT_CANVAS_WIDTH;
    texCanvas.height = TEXT_CANVAS_HEIGHT;

    const ctx = texCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, texCanvas.width, texCanvas.height);

    ctx.font = `200 ${FONT_SIZE}px "IBM Plex Sans", system-ui`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const advances = [];
    let naturalWidth = 0;

    for (const ch of TEXT) {
      const w = ctx.measureText(ch).width;
      const adjusted = w * LETTER_SPACING_FACTOR;
      advances.push(adjusted);
      naturalWidth += adjusted;
    }

    const targetWidth = texCanvas.width * 0.9;
    const scaleX = targetWidth / naturalWidth;

    ctx.save();
    ctx.translate(texCanvas.width / 2, texCanvas.height / 2);
    ctx.scale(scaleX, 1);

    ctx.fillStyle = "#ffffff";

    let x = -naturalWidth / 2;
    for (let i = 0; i < TEXT.length; i++) {
      const ch = TEXT[i];
      ctx.fillText(ch, x, 0);
      x += advances[i];
    }

    ctx.restore();

    const texture = new THREE.CanvasTexture(texCanvas);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;

    // --- CYLINDER GEOMETRY ---
    const geometry = new THREE.CylinderGeometry(
      CYLINDER_RADIUS,
      CYLINDER_RADIUS,
      CYLINDER_HEIGHT,
      256,
      1,
      true
    );

    const material = new THREE.MeshPhysicalMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      color: new THREE.Color(0xffffff),
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.12,
    });

    material.depthWrite = false;
    material.needsUpdate = true;

    const meshes = [];
    const half = (ROW_COUNT - 1) / 2;
    const angularOffsetRad = THREE.MathUtils.degToRad(ANGULAR_OFFSET_DEG);

    for (let i = 0; i < ROW_COUNT; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      const yOffset = (i - half) * ROW_VERTICAL_OFFSET;
      const zOffset = 0; // ROW_DEPTH_OFFSET currently not used
      mesh.position.set(0, yOffset, zOffset);
      mesh.rotation.y = (i - half) * angularOffsetRad;
      root.add(mesh);
      meshes.push(mesh);
    }

    let animationId;
    let lastTime = performance.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      root.rotation.y += ROTATION_SPEED * dt;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      meshes.forEach((m) => m.geometry.dispose());
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
