"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function MatcapBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const isWebGLAvailable = () => {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
      } catch (e) {
        return false;
      }
    };

    if (!isWebGLAvailable()) {
      container.style.backgroundColor = "#444";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "100vw";
      container.style.height = "100vh";
      return;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (e) {
      container.style.backgroundColor = "#444";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "100vw";
      container.style.height = "100vh";
      return;
    }
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100vw";
    renderer.domElement.style.height = "100vh";
    renderer.domElement.style.zIndex = "-1";

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const textureLoader = new THREE.TextureLoader();
    const matcap = textureLoader.load("/metal_matcap.jpg");
    const dispMap = textureLoader.load("/vicus.png");

    dispMap.wrapS = dispMap.wrapT = THREE.ClampToEdgeWrapping;

    const geometry = new THREE.PlaneGeometry(2, 2);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMatcap: { value: matcap },
        uDisplacementMap: { value: dispMap },
        uTime: { value: 0 },
        uRotation: { value: 0 },
        uDispStrength: { value: 0.4 },
        uZoomLevel: { value: 1.5 },
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
        uniform sampler2D uDisplacementMap;
        uniform vec2 uResolution;
        uniform float uRotation;
        uniform float uTime;
        uniform float uDispStrength;
        uniform float uZoomLevel;

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
          float aspect = uResolution.x / uResolution.y;
          vec2 texUv = vUv;

          if (aspect > 1.0) {
            texUv.x = (texUv.x - 0.5) * aspect + 0.5;
          } else {
            texUv.y = (texUv.y - 0.5) / aspect + 0.5;
          }

          texUv = (texUv - 0.5) * uZoomLevel + 0.5;

          vec2 noisePos = texUv * 3.0 + uTime * 0.2;
          float n1 = fbm(noisePos);
          float n2 = fbm(noisePos + vec2(100.0, 0.0));
          float n3 = fbm(noisePos + vec2(0.0, 100.0));
          
          vec3 tangentNormal = normalize(vec3(n1 - n2, n1 - n3, 1.0) * 2.0 - 1.0);

          float noise1 = sin(texUv.x * 4.0 + uTime * 0.3);
          float noise2 = cos(texUv.y * 3.0 + uTime * 0.25);
          float noise3 = sin((texUv.x + texUv.y) * 2.0 + uTime * 0.1);
          tangentNormal = normalize(tangentNormal + vec3(noise1, noise2, noise3) * 0.8);

          vec3 viewNormal = normalize(vec3(tangentNormal.xy, tangentNormal.z));

          vec2 mc = viewNormal.xy;
          float s = sin(uRotation);
          float c = cos(uRotation);
          mc = mat2(c, -s, s, c) * mc;

          float disp = texture2D(uDisplacementMap, texUv).r;

          mc = mc * 0.5 + 0.5;
          vec3 matcapColor = texture2D(uMatcap, mc).rgb;

          gl_FragColor = vec4(matcapColor, 1.0);
        }
      `
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      material.uniforms.uResolution.value.set(width, height);
    };

    resize();
    window.addEventListener("resize", resize);

    let frameId;
    const animate = () => {
      const time = performance.now() * 0.001;
      material.uniforms.uTime.value = time;
      frameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} />;
}
