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
      const L = Math.max(0.1, Math.min((dimensions.length ?? 1000) / 1000, 5));
      const W3 = Math.max(0.1, Math.min((dimensions.width ?? 1000) / 1000, 5));
      const D = Math.max(0.05, Math.min((dimensions.depth ?? dimensions.height ?? 200) / 1000, 3));

      if (calcType === "column") {
        const r = Math.max(0.05, Math.min((dimensions.diameter ?? 300) / 2000, 1));
        const h = Math.max(0.1, Math.min((dimensions.height ?? 3000) / 1000, 5));
        const geo = new THREE.CylinderGeometry(r, r, h, 32);
        const mesh = new THREE.Mesh(geo, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.y = h / 2;
        scene.add(mesh);
      } else if (calcType === "staircase") {
        // Build stepped staircase: N independent boxes, each taller by one rise
        const numSteps = Math.max(2, Math.min(Math.round(dimensions.steps ?? 12), 20));
        const riseM = Math.max(0.05, Math.min((dimensions.rise ?? 180) / 1000, 0.5));
        const runM  = Math.max(0.05, Math.min((dimensions.run  ?? 250) / 1000, 0.6));
        const widM  = Math.max(0.1,  Math.min((dimensions.width ?? 1200) / 1000, 3));

        const group = new THREE.Group();
        for (let i = 0; i < numSteps; i++) {
          const stepHeight = riseM * (i + 1);
          const geo = new THREE.BoxGeometry(runM, stepHeight, widM);
          const stepMesh = new THREE.Mesh(geo, material);
          stepMesh.castShadow = true;
          stepMesh.receiveShadow = true;
          // Each step sits on the ground, positioned left→right in X
          stepMesh.position.set(runM * i, stepHeight / 2, 0);
          group.add(stepMesh);
        }
        // Center the group
        const totalWidth = runM * numSteps;
        const totalHeight = riseM * numSteps;
        group.position.set(-totalWidth / 2, 0, 0);
        // Adjust camera for staircase proportions
        camera.position.set(totalWidth, totalHeight * 1.2, totalWidth * 1.5);
        camera.lookAt(0, totalHeight / 2, 0);
        scene.add(group);
      } else {
        const geo = new THREE.BoxGeometry(L, D, W3);
        const mesh = new THREE.Mesh(geo, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.y = D / 2;
        scene.add(mesh);
      }

      // Collect all meshes for the scale-in animation
      const animTargets: import("three").Object3D[] = [];
      scene.traverse((obj) => { if ((obj as any).isMesh) animTargets.push(obj); });

      // Controls — user-driven (no auto-rotate)
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.autoRotate = false;

      // Render loop — use shouldStop flag so we can reliably stop from cleanup
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

        // Scale-in animation
        const elapsed = performance.now() - scaleStart;
        if (elapsed < scaleDuration) {
          const s = Math.max(0.001, easeOutBack(Math.min(elapsed / scaleDuration, 1)));
          animTargets.forEach((obj) => obj.scale.setScalar(s));
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
    <div>
      <div
        ref={mountRef}
        style={{ width: "100%", minHeight: "280px", borderRadius: "12px", overflow: "hidden", background: "#f8f9fa" }}
      />
      <div className="text-center text-muted mt-1" style={{ fontSize: "0.75rem", letterSpacing: "0.03em" }}>
        <i className="bi bi-arrow-clockwise me-1" />Drag to rotate
        <span className="mx-2">·</span>
        <i className="bi bi-zoom-in me-1" />Scroll to zoom
        <span className="mx-2">·</span>
        <i className="bi bi-arrows-move me-1" />Right-drag to pan
      </div>
    </div>
  );
}
