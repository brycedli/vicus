"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function MatcapAscii() {
  const containerRef = useRef(null);
  const asciiRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const asciiDiv = asciiRef.current;
    if (!container || !asciiDiv) return;

    const density = "        .:░▒▓█";

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(256, 192);
    renderer.domElement.style.display = "none";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const textureLoader = new THREE.TextureLoader();
    const matcap = textureLoader.load("/matcap2.jpeg");
    const normalMap = textureLoader.load("/normal.png");
    const dispMap = textureLoader.load("/vicus.png");

    normalMap.wrapS = normalMap.wrapT = THREE.ClampToEdgeWrapping;
    dispMap.wrapS = dispMap.wrapT = THREE.ClampToEdgeWrapping;

    const geometry = new THREE.PlaneGeometry(2, 2);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMatcap: { value: matcap },
        uNormalMap: { value: normalMap },
        uDisplacementMap: { value: dispMap },
        uTime: { value: 0 },
        uZoomLevel: { value: 1.5 },
        uDispStrength: { value: 0.4 },
        uNoiseStrength: { value: 0.05 },
        uResolution: { value: new THREE.Vector2(1, 1) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;

        uniform sampler2D uMatcap;
        uniform sampler2D uNormalMap;
        uniform sampler2D uDisplacementMap;
        uniform float uTime;
        uniform float uZoomLevel;
        uniform float uDispStrength;
        uniform float uNoiseStrength;
        uniform vec2 uResolution;

        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }
        
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          for (int i = 0; i < 4; i++) {
            value += amplitude * noise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          return value;
        }

        void main() {
          vec2 uv = vUv;

          vec4 disp = texture2D(uDisplacementMap, uv);
          float logoMask = disp.r;
          
          if (logoMask > 0.1) {
            float noiseValue = fbm(uv * 4.0 + uTime * 0.3);
            float luminosity = 0.6 + 0.4 * noiseValue;
            gl_FragColor = vec4(vec3(luminosity), 1.0);
          } else {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          }
        }
      `
    });

    const logoMesh = new THREE.Mesh(geometry, material);
    scene.add(logoMesh);

    const width = 64;
    const height = 48;
    const pixels = new Uint8Array(256 * 192 * 4);

    let frameId;

    const animate = () => {
      const time = performance.now() * 0.001;
      material.uniforms.uTime.value = time;
      material.uniforms.uResolution.value.set(256.0, 192.0);

      renderer.render(scene, camera);

      const gl = renderer.getContext();
      gl.readPixels(0, 0, 256, 192, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

      let asciiImage = "";

      for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
          const srcX = Math.floor(i * 4);
          const srcY = Math.floor(j * 4);
          const flippedSrcY = 191 - srcY;
          const pixelIndex = (srcX + flippedSrcY * 256) * 4;
          const r = pixels[pixelIndex + 0];
          const g = pixels[pixelIndex + 1];
          const b = pixels[pixelIndex + 2];
          const avg = (r + g + b) / 3;

          const len = density.length;
          const charIndex = Math.floor((avg / 255) * (len - 1));
          const c = density.charAt(charIndex);

          if (c === " ") {
            asciiImage += "&nbsp;";
          } else {
            asciiImage += c;
          }
        }
        asciiImage += "<br/>";
      }

      asciiDiv.innerHTML = asciiImage;

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef}>
      <div ref={asciiRef} />
    </div>
  );
}
