"use client";

import { useEffect, useRef } from "react";
import type { CalcType, CalcResult } from "@/lib/concrete-calculator";

interface ConcreteViz3DProps {
  calcType: CalcType;
  dimensions: Record<string, number>;
  result: CalcResult | null;
}

// Ease-out-back for scale-in animation
function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export default function ConcreteViz3D({ calcType, dimensions, result: _result }: ConcreteViz3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    let destroyed = false;

    async function initScene() {
      const THREE = await import("three");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js" as any);

      if (destroyed || !mountRef.current) return;

      const W = mountRef.current.clientWidth || 400;
      const H = Math.min(W * 0.6, 500);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.shadowMap.enabled = true;
      mountRef.current.appendChild(renderer.domElement);

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf8f9fa);

      // Camera
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
      camera.position.set(3, 3, 5);
      camera.lookAt(0, 0, 0);

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambient);
      const sun = new THREE.DirectionalLight(0xfff5e0, 1.5);
      sun.position.set(5, 8, 5);
      sun.castShadow = true;
      scene.add(sun);
      scene.add(new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.4));

      // Ground grid
      scene.add(new THREE.GridHelper(10, 20, 0xcccccc, 0xdddddd));

      // Concrete material
      const material = new THREE.MeshStandardMaterial({
        color: 0x9e9e9e,
        roughness: 0.9,
        metalness: 0.0,
      });

      // Geometry based on calc type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let geometry: any;
      const L = Math.max(0.1, Math.min((dimensions.length ?? 1000) / 1000, 5));
      const W3 = Math.max(0.1, Math.min((dimensions.width ?? 1000) / 1000, 5));
      const D = Math.max(0.05, Math.min((dimensions.depth ?? dimensions.height ?? 200) / 1000, 3));

      if (calcType === "column") {
        const r = Math.max(0.05, Math.min((dimensions.diameter ?? 300) / 2000, 1));
        const h = Math.max(0.1, Math.min((dimensions.height ?? 3000) / 1000, 5));
        geometry = new THREE.CylinderGeometry(r, r, h, 32);
      } else {
        geometry = new THREE.BoxGeometry(L, D, W3);
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.y = D / 2;
      scene.add(mesh);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;

      // Render loop — use shouldStop flag so we can reliably stop from cleanup
      // (storing frameId is unreliable: it changes every frame, staleRef would have old ID)
      let shouldStop = false;
      let isVisible = true;
      let frameId = 0;
      const scaleStart = performance.now();
      const scaleDuration = 900;

      function renderLoop() {
        if (shouldStop) return;
        frameId = requestAnimationFrame(renderLoop);

        // Skip rendering when off-screen (saves GPU cost)
        if (!isVisible) return;

        // Scale-in animation via inline tween (avoids animejs + THREE.Vector3 compatibility risk)
        const elapsed = performance.now() - scaleStart;
        if (elapsed < scaleDuration) {
          const s = Math.max(0.001, easeOutBack(Math.min(elapsed / scaleDuration, 1)));
          mesh.scale.setScalar(s);
        }

        controls.update();
        renderer.render(scene, camera);
      }
      renderLoop();

      // Pause render loop when component scrolls out of view
      const observer = new IntersectionObserver(
        (entries) => { isVisible = entries[0]?.isIntersecting ?? true; },
        { threshold: 0 }
      );
      if (mountRef.current) observer.observe(mountRef.current);

      // Store cleanup in ref so the useEffect return can always reach it
      cleanupRef.current = () => {
        shouldStop = true;
        cancelAnimationFrame(frameId);
        observer.disconnect();
        renderer.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.remove();
        }
      };
    }

    initScene().catch(console.error);

    return () => {
      destroyed = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [calcType, dimensions]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", minHeight: "280px", borderRadius: "12px", overflow: "hidden", background: "#f8f9fa" }}
    />
  );
}
