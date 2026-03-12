'use client';

import { useEffect, useRef } from 'react';
import type { ScrollStageZoneThreeConfig } from './types';

interface Props {
  zone: ScrollStageZoneThreeConfig;
  opacity: number;
  sectionTopRef: React.RefObject<number>;
}

export default function ScrollStageThreeScene({ zone, opacity, sectionTopRef }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const meshRef = useRef<any>(null);
  const scrollYRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      const THREE = await import('three');
      if (cancelled || !mountRef.current) return;

      const mount = mountRef.current;
      const w = mount.clientWidth || 400;
      const h = mount.clientHeight || 600;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
      renderer.setClearColor(0x000000, 0);
      if (zone.bgColor) {
        renderer.setClearColor(new THREE.Color(zone.bgColor), 1);
      }
      mount.appendChild(renderer.domElement);

      // Scene & camera — narrow FOV + far camera keeps object contained within canvas
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
      camera.position.set(0, 0, 9);

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, zone.ambientIntensity ?? 0.6);
      scene.add(ambient);
      const point = new THREE.PointLight(0xffffff, zone.pointIntensity ?? 2.5);
      point.position.set(3, 3, 5);
      scene.add(point);
      const point2 = new THREE.PointLight(new THREE.Color(zone.color ?? '#6366f1'), 1.5);
      point2.position.set(-3, -2, 2);
      scene.add(point2);

      // Geometry
      const shape = zone.shape ?? 'torusKnot';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let geometry: any;
      if (shape === 'sphere') {
        geometry = new THREE.SphereGeometry(1.4, 64, 64);
      } else if (shape === 'torus') {
        geometry = new THREE.TorusGeometry(1.1, 0.4, 32, 100);
      } else if (shape === 'box') {
        geometry = new THREE.BoxGeometry(2, 2, 2);
      } else if (shape === 'icosahedron') {
        geometry = new THREE.IcosahedronGeometry(1.5, 1);
      } else {
        // torusKnot — default
        geometry = new THREE.TorusKnotGeometry(0.9, 0.3, 200, 32);
      }

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(zone.color ?? '#6366f1'),
        emissive: new THREE.Color(zone.emissive ?? '#1e1b4b'),
        metalness: 0.3,
        roughness: 0.4,
        wireframe: zone.wireframe ?? false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      meshRef.current = mesh;

      // Scroll handler — track scroll for spin effect
      const scroller = document.getElementById('snap-container');
      const getScrollTop = () => scroller ? scroller.scrollTop : window.scrollY;
      const onScroll = () => { scrollYRef.current = getScrollTop(); };
      const target: EventTarget = scroller ?? window;
      target.addEventListener('scroll', onScroll, { passive: true });
      scrollYRef.current = getScrollTop();

      // Resize observer
      const resizeObs = new ResizeObserver(() => {
        if (!mount) return;
        const nw = mount.clientWidth;
        const nh = mount.clientHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      });
      resizeObs.observe(mount);

      // Render loop
      const speed = zone.rotationSpeed ?? 1;
      const scrollSpin = zone.scrollSpin ?? 2;
      let lastTime = performance.now();

      function tick(now: number) {
        if (cancelled) return;
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        // Auto-rotate
        mesh.rotation.x += 0.3 * speed * dt;
        mesh.rotation.y += 0.5 * speed * dt;

        // Scroll-driven spin: extra Y rotation proportional to scroll from section top
        const sectionTop = sectionTopRef.current ?? 0;
        const relScroll = scrollYRef.current - sectionTop;
        const scrollRadians = (relScroll / 100) * scrollSpin * 0.1;
        mesh.rotation.y = mesh.rotation.y % (Math.PI * 2);
        // Blend in the scroll spin as an extra offset (smooth, doesn't fight auto-rotate)
        mesh.position.y = Math.sin(relScroll * 0.002) * 0.3;

        renderer.render(scene, camera);
        rafRef.current = requestAnimationFrame(tick);
      }

      rafRef.current = requestAnimationFrame(tick);

      return () => {
        target.removeEventListener('scroll', onScroll);
        resizeObs.disconnect();
      };
    }

    const cleanupPromise = setup();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      cleanupPromise.then(fn => fn?.());
      // Remove canvas
      if (mountRef.current) {
        const canvas = mountRef.current.querySelector('canvas');
        if (canvas) mountRef.current.removeChild(canvas);
      }
    };
  }, [zone.shape, zone.color, zone.emissive, zone.wireframe, zone.rotationSpeed, zone.scrollSpin, zone.bgColor, zone.ambientIntensity, zone.pointIntensity]);

  const snapDuration = zone.transitionDuration ?? 400;

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        transition: `opacity ${snapDuration / 2}ms ease`,
        willChange: 'opacity',
      }}
    />
  );
}
