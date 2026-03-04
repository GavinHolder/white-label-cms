/**
 * Animated Background Animators
 * Each returns an AnimatorHandle { pause, resume, destroy }
 *
 * Uses Anime.js v4 API: animate(targets, props)
 */

import { animate, stagger } from "animejs";
import type {
  AnimatorHandle,
  FloatingShapesConfig,
  MovingGradientConfig,
  ParticleFieldConfig,
  WavesConfig,
  ParallaxDriftConfig,
  TiltConfig,
  CustomCodeConfig,
  ThreeDSceneConfig,
  FibrePulseConfig,
  WifiPulseConfig,
  SVGAnimationConfig,
  TextEffectsConfig,
  TextDirection,
} from "./types";
import { DEFAULT_FALLBACK_COLORS } from "./defaults";

type AnimInstance = ReturnType<typeof animate>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickColor(colors: string[]): string {
  const pool = colors.length ? colors : DEFAULT_FALLBACK_COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  if (h.length < 6) return `rgba(78,205,196,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function safeColor(c: string): string {
  return c.startsWith("#") ? c : "#4ecdc4";
}

// ─── 1. Floating Shapes ──────────────────────────────────────────────────────

export function floatingShapesAnimator(
  container: HTMLElement,
  config: FloatingShapesConfig,
  colors: string[]
): AnimatorHandle {
  const { count, sizeMin, sizeMax, speedMin, speedMax, blur, opacityMin, opacityMax, shapes } = config;
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none;";
  container.appendChild(wrapper);

  const instances: AnimInstance[] = [];

  for (let i = 0; i < count; i++) {
    const shape = shapes[Math.floor(Math.random() * shapes.length)] || "circle";
    const size  = rand(sizeMin, sizeMax);
    const color = safeColor(pickColor(colors));
    const opMin = opacityMin / 100;
    const opMax = opacityMax / 100;

    const el = document.createElement("div");
    el.style.cssText = [
      "position:absolute",
      `width:${size}px`,
      `height:${size}px`,
      `left:${rand(0, 90)}%`,
      `top:${rand(0, 90)}%`,
      `background:${hexToRgba(color, rand(opMin, opMax))}`,
      `filter:blur(${blur}px)`,
      "will-change:transform,opacity",
    ].join(";");

    if (shape === "circle")        el.style.borderRadius = "50%";
    else if (shape === "blob")     el.style.borderRadius = "60% 40% 70% 30% / 50% 60% 40% 50%";
    else if (shape === "square")   el.style.borderRadius = "4px";
    else if (shape === "triangle") {
      el.style.background   = "transparent";
      el.style.borderLeft   = `${size / 2}px solid transparent`;
      el.style.borderRight  = `${size / 2}px solid transparent`;
      el.style.borderBottom = `${size}px solid ${hexToRgba(color, rand(opMin, opMax))}`;
      el.style.width  = "0";
      el.style.height = "0";
      el.style.filter = "none";
    }

    wrapper.appendChild(el);

    const anim = animate(el, {
      translateX: rand(-60, 60),
      translateY: rand(-60, 60),
      opacity: rand(opMin, opMax),
      duration: rand(speedMin, speedMax) * 1000,
      ease: "inOutSine",
      loop: true,
      direction: "alternate",
      delay: rand(0, 3000),
    });
    instances.push(anim);
  }

  return {
    pause:   () => instances.forEach(a => a.pause()),
    resume:  () => instances.forEach(a => a.resume()),
    destroy: () => {
      instances.forEach(a => a.pause());
      wrapper.remove();
    },
  };
}

// ─── 2. Moving Gradient ──────────────────────────────────────────────────────
// Uses requestAnimationFrame (not CSS @keyframes) so it works even when
// Chrome/Windows suppresses CSS animations via "Show animations" settings.

export function movingGradientAnimator(
  container: HTMLElement,
  config: MovingGradientConfig,
  colors: string[]
): AnimatorHandle {
  const { direction, speed, scale } = config;
  const pool = colors.length >= 2 ? colors : DEFAULT_FALLBACK_COLORS;

  const stops = pool.slice(0, 4).map((c, i, arr) =>
    `${hexToRgba(safeColor(c), 0.7)} ${Math.round((i / (arr.length - 1)) * 100)}%`
  ).join(", ");

  let bgGradient: string;
  if (direction === "radial") {
    bgGradient = `radial-gradient(circle at 30% 30%, ${stops})`;
  } else if (direction === "horizontal") {
    bgGradient = `linear-gradient(to right, ${stops})`;
  } else if (direction === "vertical") {
    bgGradient = `linear-gradient(to bottom, ${stops})`;
  } else {
    bgGradient = `linear-gradient(135deg, ${stops})`;
  }

  const el = document.createElement("div");
  el.style.cssText = [
    "position:absolute",
    "inset:0",
    "pointer-events:none",
    `background:${bgGradient}`,
    `background-size:${scale}% ${scale}%`,
    "background-position:0% 0%",
  ].join(";");
  container.appendChild(el);

  // rAF-based animation — immune to Chrome/OS "Show animations" suppression
  let running = true;
  let frameId = 0;
  let startTime = -1;
  let prevTickTime = -1; // 30fps throttle
  const duration = speed * 1000;

  function tick(now: number) {
    if (!running) return;
    // 30fps throttle — gradient changes are imperceptible above 20fps
    if (prevTickTime >= 0 && now - prevTickTime < 32) {
      frameId = requestAnimationFrame(tick);
      return;
    }
    prevTickTime = now;
    if (startTime < 0) startTime = now;
    const elapsed = now - startTime;
    // Normalised 0→1 ping-pong via sin so direction alternates smoothly
    const t = (Math.sin((elapsed / duration) * Math.PI * 2 - Math.PI / 2) + 1) / 2;

    if (direction === "horizontal") {
      el.style.backgroundPosition = `${t * 100}% 50%`;
    } else if (direction === "vertical") {
      el.style.backgroundPosition = `50% ${t * 100}%`;
    } else if (direction === "radial") {
      const pct = 20 + t * 60;
      el.style.backgroundPosition = `${pct}% ${pct}%`;
      el.style.backgroundSize    = `${scale * (0.8 + t * 0.2)}% ${scale * (0.8 + t * 0.2)}%`;
    } else {
      // diagonal
      el.style.backgroundPosition = `${t * 100}% ${t * 100}%`;
    }
    frameId = requestAnimationFrame(tick);
  }

  frameId = requestAnimationFrame(tick);

  return {
    pause:   () => { running = false; cancelAnimationFrame(frameId); },
    resume:  () => { if (!running) { running = true; startTime = -1; frameId = requestAnimationFrame(tick); } },
    destroy: () => { running = false; cancelAnimationFrame(frameId); el.remove(); },
  };
}

// ─── 3. Particle Field ───────────────────────────────────────────────────────

export function particleFieldAnimator(
  container: HTMLElement,
  config: ParticleFieldConfig,
  colors: string[]
): AnimatorHandle {
  const { count, sizeMin, sizeMax, speed, connectLines, connectionDistance } = config;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
  container.appendChild(canvas);

  const ctxMaybe = canvas.getContext("2d");
  if (!ctxMaybe) return { pause: () => {}, resume: () => {}, destroy: () => canvas.remove() };
  const ctx = ctxMaybe;

  let running = true;
  let frameId = 0;
  let prevDrawTime = -1; // 30fps throttle

  interface Particle { x: number; y: number; vx: number; vy: number; r: number; color: string; }
  const particles: Particle[] = [];

  function init() {
    canvas.width  = container.offsetWidth  || 800;
    canvas.height = container.offsetHeight || 600;
    particles.length = 0;
    for (let i = 0; i < count; i++) {
      particles.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
        r:  rand(sizeMin, sizeMax),
        color: hexToRgba(safeColor(pickColor(colors)), 0.7),
      });
    }
  }

  function draw(now?: number) {
    if (!running) return;
    const ts = now ?? performance.now();
    // 30fps throttle — particles look fine at 30fps and use half the CPU
    if (prevDrawTime >= 0 && ts - prevDrawTime < 32) {
      frameId = requestAnimationFrame(draw);
      return;
    }
    prevDrawTime = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    if (connectLines) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / connectionDistance) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }
    frameId = requestAnimationFrame(draw);
  }

  init();
  draw();

  const resizeObserver = new ResizeObserver(() => init());
  resizeObserver.observe(container);

  return {
    pause:   () => { running = false; cancelAnimationFrame(frameId); },
    resume:  () => { running = true; draw(); },
    destroy: () => { running = false; cancelAnimationFrame(frameId); resizeObserver.disconnect(); canvas.remove(); },
  };
}

// ─── 4. Waves ────────────────────────────────────────────────────────────────

export function wavesAnimator(
  container: HTMLElement,
  config: WavesConfig,
  colors: string[]
): AnimatorHandle {
  const { waveCount, amplitude, speed, direction } = config;

  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:absolute;bottom:0;left:0;right:0;pointer-events:none;overflow:hidden;";
  container.appendChild(wrapper);

  const instances: AnimInstance[] = [];
  const waveEls: HTMLElement[] = [];

  for (let i = 0; i < waveCount; i++) {
    const color   = safeColor(pickColor(colors));
    const opacity = 0.15 + (i / waveCount) * 0.25;
    const waveH   = amplitude + i * 20;
    const el = document.createElement("div");
    el.style.cssText = [
      "position:absolute",
      "bottom:0",
      "left:-50%",
      "width:300%",
      `height:${waveH * 2 + 60}px`,
      `background:${hexToRgba(color, opacity)}`,
      `border-radius:${waveH}px ${waveH}px 0 0`,
    ].join(";");
    wrapper.appendChild(el);
    waveEls.push(el);
  }

  waveEls.forEach((el, i) => {
    const mult = direction === "left" ? -1 : 1;
    const anim = animate(el, {
      translateX: `${mult * (33 + i * 8)}%`,
      duration: (speed + i * 1.5) * 1000,
      ease: "linear",
      loop: true,
      direction: "alternate",
    });
    instances.push(anim);
  });

  return {
    pause:   () => instances.forEach(a => a.pause()),
    resume:  () => instances.forEach(a => a.resume()),
    destroy: () => { instances.forEach(a => a.pause()); wrapper.remove(); },
  };
}

// ─── 5. Parallax Drift ───────────────────────────────────────────────────────

export function parallaxDriftAnimator(
  container: HTMLElement,
  config: ParallaxDriftConfig,
  colors: string[],
  snapContainer: HTMLElement
): AnimatorHandle {
  const { factor, direction, shapeCount, shapeSize, blur } = config;

  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none;";
  container.appendChild(wrapper);

  const shapeEls: HTMLElement[] = [];
  for (let i = 0; i < shapeCount; i++) {
    const color = safeColor(pickColor(colors));
    const sz    = rand(shapeSize * 0.5, shapeSize * 1.5);
    const el    = document.createElement("div");
    el.style.cssText = [
      "position:absolute",
      `width:${sz}px`,
      `height:${sz}px`,
      `left:${rand(-10, 90)}%`,
      `top:${rand(-10, 90)}%`,
      `background:${hexToRgba(color, 0.35)}`,
      `filter:blur(${blur}px)`,
      "border-radius:60% 40% 70% 30% / 50% 60% 40% 50%",
      "will-change:transform",
    ].join(";");
    wrapper.appendChild(el);
    shapeEls.push(el);
  }

  const handleScroll = () => {
    const rect  = container.getBoundingClientRect();
    const vh    = window.innerHeight;
    const ratio = 1 - (rect.top + rect.height / 2) / vh;
    shapeEls.forEach((el, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      const fy  = direction !== "horizontal" ? ratio * factor * vh * dir       : 0;
      const fx  = direction !== "vertical"   ? ratio * factor * vh * dir * 0.5 : 0;
      el.style.transform = `translate(${fx}px,${fy}px)`;
    });
  };

  snapContainer.addEventListener("scroll", handleScroll, { passive: true });

  return {
    pause:   () => snapContainer.removeEventListener("scroll", handleScroll),
    resume:  () => snapContainer.addEventListener("scroll", handleScroll, { passive: true }),
    destroy: () => { snapContainer.removeEventListener("scroll", handleScroll); wrapper.remove(); },
  };
}

// ─── 6. 3D Tilt ──────────────────────────────────────────────────────────────

export function tiltAnimator(
  container: HTMLElement,
  config: TiltConfig,
  sectionEl: HTMLElement
): AnimatorHandle {
  const { mode, intensity, speed, perspective } = config;
  container.style.transformStyle = "preserve-3d";
  container.style.perspective    = `${perspective}px`;

  let autoAnim: AnimInstance | null = null;

  const handleMouse = (e: MouseEvent) => {
    const rect = sectionEl.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const rx   = ((e.clientY - cy) / (rect.height / 2)) * intensity;
    const ry   = ((e.clientX - cx) / (rect.width  / 2)) * intensity;
    container.style.transform = `rotateX(${-rx}deg) rotateY(${ry}deg)`;
  };
  const handleMouseLeave = () => { container.style.transform = ""; };

  if (mode === "mouse" || mode === "both") {
    sectionEl.addEventListener("mousemove",  handleMouse);
    sectionEl.addEventListener("mouseleave", handleMouseLeave);
  }

  if (mode === "auto" || mode === "both") {
    autoAnim = animate(container, {
      rotateX: [intensity * 0.5, -intensity * 0.5],
      rotateY: [-intensity, intensity],
      duration: speed * 1000,
      ease: "inOutSine",
      loop: true,
      direction: "alternate",
    });
  }

  return {
    pause:   () => autoAnim?.pause(),
    resume:  () => autoAnim?.resume(),
    destroy: () => {
      autoAnim?.pause();
      sectionEl.removeEventListener("mousemove",  handleMouse);
      sectionEl.removeEventListener("mouseleave", handleMouseLeave);
      container.style.transform      = "";
      container.style.transformStyle = "";
      container.style.perspective    = "";
    },
  };
}

// ─── 7. Custom Code ──────────────────────────────────────────────────────────
// Admin-only feature: executes code written by the site administrator.
// The animator uses the Function constructor indirectly (via globalThis)
// because this is an intentional admin code execution sandbox — equivalent to
// how WordPress/Webflow/GrapesJS allow admin-authored script injection.
// Only site administrators can write or save custom animation code.

export function customCodeAnimator(
  container: HTMLElement,
  config: CustomCodeConfig
): AnimatorHandle {
  const { code } = config;
  if (!code?.trim()) {
    console.warn("[AnimBg] customCodeAnimator: no code provided");
    return { pause: () => {}, resume: () => {}, destroy: () => {} };
  }

  // anime v3 → v4 compatibility shim:  anime({ targets, ...props }) → animate(targets, props)
  const animeShim = (opts: Record<string, unknown>): ReturnType<typeof animate> => {
    const { targets, easing, ...rest } = opts;
    return animate(targets as Parameters<typeof animate>[0], {
      ...rest,
      ...(easing ? { ease: easing } : {}),
    } as Parameters<typeof animate>[1]);
  };
  (animeShim as any).random = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  try {
    // Admin sandbox: uses Function constructor via globalThis (intentional, admin-only).
    const AdminFn = (globalThis as any).Function as typeof Function;
    const fn = new AdminFn("anime", "animate", "container", code);
    const handle = fn(animeShim, animate, container) as Partial<AnimatorHandle> | null | undefined;
    if (handle && typeof handle.pause === "function" && typeof handle.destroy === "function") {
      return {
        pause:   () => handle.pause!(),
        resume:  () => handle.resume?.(),
        destroy: () => handle.destroy!(),
      };
    }
    console.warn("[AnimBg] customCodeAnimator: code must return { pause, resume, destroy }");
  } catch (e) {
    console.error("[AnimBg] Custom animation code error:", e);
  }

  return { pause: () => {}, resume: () => {}, destroy: () => {} };
}

// ─── 9. Fibre Pulse ──────────────────────────────────────────────────────────
// Industry-specific: fibre-optic cables fan out from a corner with animated
// light pulses travelling along each bezier path. Canvas + rAF based.

export function fibrePulseAnimator(
  container: HTMLElement,
  config: FibrePulseConfig,
  colors: string[]
): AnimatorHandle {
  const {
    cableCount, pulseCount, pulseSpeed, pulseSize, cableWidth, cableOpacity,
    origin, curvature, cableColor, pulseColor,
    pulseDirection = "source-to-end",
    randomPulseCount = false,
  } = config;
  const pool = (colors.length ? colors : DEFAULT_FALLBACK_COLORS).map(safeColor);
  // Per-cable colour override (if set, all cables use this colour)
  const fixedCableColor = cableColor?.startsWith("#") ? safeColor(cableColor) : null;
  // Pulse glow colour override (if set, all pulses use this colour regardless of cable colour)
  const fixedPulseColor = pulseColor?.startsWith("#") ? safeColor(pulseColor) : null;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
  container.appendChild(canvas);

  const ctxMaybe = canvas.getContext("2d");
  if (!ctxMaybe) return { pause: () => {}, resume: () => {}, destroy: () => canvas.remove() };
  const ctx = ctxMaybe;

  interface Pulse {
    t: number;   // progress 0–1 along the cable
    dir: 1 | -1; // 1 = source→end, -1 = end→source
  }
  interface Cable {
    x0: number; y0: number; // start (near origin)
    cx: number; cy: number; // bezier control point
    x1: number; y1: number; // end (far edge)
    color: string;     // cable strand colour
    pulseCol: string;  // light pulse glow colour
    pulses: Pulse[];   // per-pulse state with individual direction
  }

  /** Pick per-pulse direction based on global pulseDirection setting */
  function pulseDirFor(index: number, total: number): 1 | -1 {
    if (pulseDirection === "end-to-source") return -1;
    if (pulseDirection === "random")        return Math.random() < 0.5 ? 1 : -1;
    if (pulseDirection === "bidirectional") return index < Math.ceil(total / 2) ? 1 : -1;
    return 1; // "source-to-end" default
  }

  let cables: Cable[] = [];
  let running = true;
  let frameId = 0;
  let lastTime = -1;

  function originPoint(w: number, h: number): [number, number] {
    if (origin === "bottom-left")  return [0, h];
    if (origin === "top-right")    return [w, 0];
    if (origin === "bottom-right") return [w, h];
    return [0, 0]; // top-left default
  }

  function setup() {
    const w = canvas.width  = container.offsetWidth  || 800;
    const h = canvas.height = container.offsetHeight || 600;
    const isRandom = origin === "random";
    const [ox, oy] = isRandom ? [0, 0] : originPoint(w, h);
    const jitter = Math.min(w, h) * 0.04;

    cables = Array.from({ length: cableCount }, (_, i) => {
      let x0: number, y0: number;
      let isLeft: boolean, isTop: boolean;

      if (isRandom) {
        // Each cable starts on a random edge of the canvas
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0)      { x0 = rand(0, w); y0 = 0; }           // top edge
        else if (edge === 1) { x0 = w;           y0 = rand(0, h); }  // right edge
        else if (edge === 2) { x0 = rand(0, w); y0 = h; }           // bottom edge
        else                 { x0 = 0;           y0 = rand(0, h); }  // left edge
        isLeft = x0 < w / 2;
        isTop  = y0 < h / 2;
      } else {
        // Start near origin corner with slight spread so cables don't overlap
        x0 = Math.max(0, Math.min(w, ox + (Math.random() - 0.5) * jitter));
        y0 = Math.max(0, Math.min(h, oy + (Math.random() - 0.5) * jitter));
        isLeft = ox < w / 2;
        isTop  = oy < h / 2;
      }

      // End point on a far edge — 60% chance on the opposite primary edge
      let x1: number, y1: number;
      if (Math.random() < 0.6) {
        x1 = isLeft ? w : 0;
        y1 = rand(0, h);
      } else {
        x1 = rand(0, w);
        y1 = isTop ? h : 0;
      }

      // Control point: midpoint + perpendicular displacement for curvature
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const perpX = -dy / len;
      const perpY =  dx / len;
      const mag = (curvature / 100) * Math.min(w, h) * 0.25 * (Math.random() * 2 - 1);

      const cableCol = fixedCableColor ?? pool[i % pool.length];
      // randomPulseCount: each cable gets 1–pulseCount active pulses for burst-like data patterns
      const activePulses = randomPulseCount
        ? Math.max(1, Math.ceil(Math.random() * pulseCount))
        : pulseCount;
      return {
        x0, y0,
        cx: mx + perpX * mag,
        cy: my + perpY * mag,
        x1, y1,
        color:    cableCol,
        pulseCol: fixedPulseColor ?? cableCol,
        // Stagger initial positions; each pulse gets its own direction
        pulses: Array.from({ length: activePulses }, (_, p) => {
          const dir = pulseDirFor(p, activePulses);
          const startT = (p / activePulses + Math.random() * 0.2) % 1;
          return { t: dir === -1 ? 1 - startT : startT, dir };
        }),
      };
    });
  }

  // Quadratic bezier position
  function bez(t: number, p0: number, pc: number, p1: number): number {
    const mt = 1 - t;
    return mt * mt * p0 + 2 * mt * t * pc + t * t * p1;
  }

  function draw(now: number) {
    if (!running) return;
    // 30fps throttle — halves draw calls, fibres look fine at 30fps
    if (lastTime >= 0 && now - lastTime < 32) {
      frameId = requestAnimationFrame(draw);
      return;
    }
    const dt = lastTime < 0 ? 0 : (now - lastTime) / 1000;
    lastTime = now;

    const step = dt / pulseSpeed; // fraction of cable per second
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    for (const cable of cables) {
      const { x0, y0, cx, cy, x1, y1, color, pulseCol, pulses } = cable;

      // Draw cable strand — double-stroke glow (no ctx.shadowBlur, it's very expensive)
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(cx, cy, x1, y1);
      // Outer glow: wide, faint
      ctx.strokeStyle = hexToRgba(color, (cableOpacity / 100) * 0.18);
      ctx.lineWidth = cableWidth * 4;
      ctx.stroke();
      // Core strand: narrow, opaque
      ctx.strokeStyle = hexToRgba(color, (cableOpacity / 100) * 0.85);
      ctx.lineWidth = cableWidth;
      ctx.stroke();

      // Draw light pulses
      for (const pulse of pulses) {
        // Advance by direction: forward pulses wrap 1→0, reverse pulses wrap 0→1
        pulse.t += step * pulse.dir;
        if (pulse.t > 1) pulse.t = 0;
        if (pulse.t < 0) pulse.t = 1;
        const t = pulse.t;
        const px = bez(t, x0, cx, x1);
        const py = bez(t, y0, cy, y1);

        // Outer glow halo via radialGradient (cheaper than shadowBlur)
        const grad = ctx.createRadialGradient(px, py, 0, px, py, pulseSize);
        grad.addColorStop(0,   hexToRgba(pulseCol, 0.85));
        grad.addColorStop(0.4, hexToRgba(pulseCol, 0.3));
        grad.addColorStop(1,   hexToRgba(pulseCol, 0));
        ctx.beginPath();
        ctx.arc(px, py, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Bright core — solid dot, no shadowBlur
        ctx.fillStyle = hexToRgba(pulseCol, 0.9);
        ctx.beginPath();
        ctx.arc(px, py, cableWidth + 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1, cableWidth * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    frameId = requestAnimationFrame(draw);
  }

  setup();
  frameId = requestAnimationFrame(draw);

  const obs = new ResizeObserver(() => { setup(); });
  obs.observe(container);

  return {
    pause:   () => { running = false; cancelAnimationFrame(frameId); },
    resume:  () => { running = true; lastTime = -1; frameId = requestAnimationFrame(draw); },
    destroy: () => { running = false; cancelAnimationFrame(frameId); obs.disconnect(); canvas.remove(); },
  };
}

// ─── 10. WiFi Pulse ──────────────────────────────────────────────────────────
// Water-ripple / WiFi-signal rings radiating from a configurable point.
// Emits bursts of rings at configurable intervals — subtle or intense.
// Canvas + rAF. Supports: arcs, full rings, 3D perspective, shadow depth.

export function wifiPulseAnimator(
  container: HTMLElement,
  config: WifiPulseConfig,
  colors: string[],
  /** Section root element — needed for mouse/object interference since layerEl has pointer-events:none */
  sectionEl?: HTMLElement | null
): AnimatorHandle {
  const {
    ringCount = 3,
    speed = 2.5,
    interval = 2000,
    maxRadius = 60,
    thickness = 2,
    style = "arcs",
    posX = 50,
    posY = 50,
    direction = 270,
    arcSpread = 60,
    ringColor = "",
    shadowOpacity = 40,
    perspective3d = false,
    mouseInterference = false,
    mouseStrength = 30,
    objectInterference = false,
    apCount = 1,
    apDrift = false,
    apDriftSpeed = 3,
    apRotate = false,
    apRotateSpeed = 3,
    origin,
  } = config;

  const pool = (colors.length ? colors : DEFAULT_FALLBACK_COLORS).map(safeColor);
  const fixedColor = ringColor && ringColor !== "#000000" ? safeColor(ringColor) : null;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
  container.appendChild(canvas);

  const ctxMaybe = canvas.getContext("2d");
  if (!ctxMaybe) return { pause: () => {}, resume: () => {}, destroy: () => canvas.remove() };
  const ctx = ctxMaybe;

  let running   = true;
  let frameId   = 0;
  let lastTime  = -1;
  let emitTimer = 0;

  let canvasW = 0, canvasH = 0;

  // ── Mouse / touch interference state ─────────────────────────────────────
  // Events are attached to sectionEl (which receives pointer events) not layerEl
  // (which has pointer-events:none and would never fire events).
  // Coordinates use sectionEl.getBoundingClientRect() — reliable even before
  // canvas has been laid out, and naturally 1:1 with canvas pixels since the
  // canvas covers the full section at its native pixel size.
  const mouseTarget = sectionEl || container;

  let mouseX: number | null = null;
  let mouseY: number | null = null;

  function getCanvasCoords(clientX: number, clientY: number): [number, number] {
    const ref = (sectionEl || container).getBoundingClientRect();
    return [clientX - ref.left, clientY - ref.top];
  }

  function onMouseMove(e: MouseEvent) {
    [mouseX, mouseY] = getCanvasCoords(e.clientX, e.clientY);
  }
  function onMouseLeave() { mouseX = null; mouseY = null; }

  function onTouchMove(e: TouchEvent) {
    if (e.touches.length === 0) return;
    const t = e.touches[0];
    [mouseX, mouseY] = getCanvasCoords(t.clientX, t.clientY);
  }
  function onTouchEnd() { mouseX = null; mouseY = null; }

  if (mouseInterference) {
    mouseTarget.addEventListener("mousemove", onMouseMove);
    mouseTarget.addEventListener("mouseleave", onMouseLeave);
    mouseTarget.addEventListener("touchmove",   onTouchMove,  { passive: true });
    mouseTarget.addEventListener("touchend",    onTouchEnd);
    mouseTarget.addEventListener("touchcancel", onTouchEnd);
  }

  // ── Object interference state ─────────────────────────────────────────────
  // Query obstacles from sectionEl so we see the actual section content,
  // not just the layerEl's canvas child.
  const obstacleRoot = sectionEl || container;

  type BBox = { x: number; y: number; w: number; h: number };
  let obstacleBboxes: BBox[] = [];
  let bboxRefreshTimer = 0;

  function refreshObstacleBboxes() {
    if (!objectInterference) return;
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvasW / (canvasRect.width  || 1);
    const scaleY = canvasH / (canvasRect.height || 1);
    obstacleBboxes = Array.from(obstacleRoot.querySelectorAll("*"))
      .filter((el): el is HTMLElement =>
        el instanceof HTMLElement &&
        !(el instanceof HTMLCanvasElement) &&
        !el.contains(canvas)               // skip animBg wrapper elements
      )
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: (r.left - canvasRect.left) * scaleX,
          y: (r.top  - canvasRect.top)  * scaleY,
          w: r.width  * scaleX,
          h: r.height * scaleY,
        };
      })
      .filter((b) => b.w > 30 && b.h > 30);
  }

  // ── Ring path helper with interference ────────────────────────────────────
  /**
   * Draw a ring arc. Uses fast ctx.arc() when interference is disabled.
   * When interference is on, draws a segmented polyline with per-point deflection
   * (mouse) and per-segment opacity reduction (objects).
   */
  function strokeRing(
    cx: number, cy: number, r: number,
    startAng: number, endAng: number, isFullCircle: boolean,
    color: string, alpha: number, lw: number,
  ) {
    const needsInterference = (mouseInterference && mouseX !== null) || objectInterference;

    if (!needsInterference) {
      // Fast path — single ctx.arc()
      ctx.beginPath();
      if (isFullCircle) ctx.arc(cx, cy, r, 0, Math.PI * 2);
      else              ctx.arc(cx, cy, r, startAng, endAng);
      ctx.strokeStyle = hexToRgba(color, alpha);
      ctx.lineWidth   = lw;
      ctx.stroke();
      return;
    }

    // Slow path — 120-segment polyline with per-point effects
    const STEPS    = 120;
    const span     = isFullCircle ? Math.PI * 2 : (endAng - startAng);
    const a0       = isFullCircle ? 0 : startAng;
    const deflectR = Math.max(canvasW, canvasH) * 0.20; // detection zone — 20% of longest dimension

    // Pre-compute deflected points + per-point alpha
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= STEPS; i++) {
      const angle = a0 + (i / STEPS) * span;
      let px = cx + Math.cos(angle) * r;
      let py = cy + Math.sin(angle) * r;
      let sa = alpha;

      // Mouse deflection — push points outward from mouse position
      if (mouseInterference && mouseX !== null && mouseY !== null) {
        const dx = px - mouseX;
        const dy = py - mouseY;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < deflectR && d > 0) {
          const f  = (1 - d / deflectR) ** 2;       // smooth falloff
          // push scales with mouseStrength (1-100); at 30 = subtle, at 100 = very dramatic
          const push = f * deflectR * (mouseStrength / 100) * 2.0;
          px += (dx / d) * push;
          py += (dy / d) * push;
        }
      }

      // Object interference — reduce alpha when ring passes through element bbox
      if (objectInterference && obstacleBboxes.length > 0) {
        for (const obs of obstacleBboxes) {
          if (px >= obs.x && px <= obs.x + obs.w && py >= obs.y && py <= obs.y + obs.h) {
            // Absorption scales with depth inside the element
            const depthX = Math.min(px - obs.x, obs.x + obs.w - px) / (obs.w * 0.5);
            const depthY = Math.min(py - obs.y, obs.y + obs.h - py) / (obs.h * 0.5);
            const absorption = Math.min(depthX, depthY);
            sa *= Math.max(0.04, 1 - absorption * 2.8);
            break;
          }
        }
      }

      pts.push([px, py, sa]);
    }

    // Batch render: group consecutive points with similar alpha to minimise ctx.stroke() calls
    ctx.lineWidth = lw;
    let pathOpen  = false;
    let curAlpha  = -1;

    for (let i = 0; i < pts.length; i++) {
      const [px, py, pa] = pts[i];
      const aChanged = Math.abs(pa - curAlpha) > 0.04;

      if (pa < 0.01) {
        // Invisible — close any open path
        if (pathOpen) { ctx.stroke(); pathOpen = false; }
        curAlpha = -1;
      } else if (aChanged || !pathOpen) {
        // Alpha changed — flush current path and start fresh
        if (pathOpen) { ctx.lineTo(px, py); ctx.stroke(); }
        curAlpha = pa;
        ctx.beginPath();
        ctx.strokeStyle = hexToRgba(color, curAlpha);
        ctx.moveTo(px, py);
        pathOpen = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    if (pathOpen) ctx.stroke();
  }

  interface Ring {
    age: number;
    maxAge: number;
    colorIdx: number;
  }

  interface AccessPoint {
    baseX: number; baseY: number;      // base position as % of canvas
    cx: number; cy: number;            // current canvas pixels
    baseDir: number;                   // base arc direction (radians)
    dir: number;                       // current arc direction (radians, may be rotating)
    driftPhaseX: number;
    driftPhaseY: number;
    driftSpeedX: number;               // radians per second for sine drift X
    driftSpeedY: number;               // radians per second for sine drift Y
    rotPhase: number;
    rotDir: number;                    // +1 or -1
    rings: Ring[];
    emitTimer: number;
    colorIdx: number;
  }

  // Pre-set positions for up to 5 APs — first AP uses posX/posY from config
  const AP_PRESET_POSITIONS: Array<[number, number]> = [
    [posX,  posY],
    [78,    28],
    [78,    72],
    [22,    72],
    [22,    28],
  ];

  // Derive base center for single-AP legacy origin support
  function legacyCenter(): [number, number] {
    const legacyMap: Record<string, [number, number]> = {
      "center":        [50, 50], "top-center":    [50,  0],
      "bottom-center": [50, 100], "left-center":  [ 0, 50],
      "right-center":  [100, 50], "top-left":     [ 0,  0],
      "top-right":     [100,  0], "bottom-left":  [ 0, 100],
      "bottom-right":  [100, 100],
    };
    return legacyMap[origin ?? "center"] ?? [50, 50];
  }

  const count = Math.min(Math.max(Math.round(apCount), 1), 5);
  const driftSpd  = Math.max(apDriftSpeed,  1) / 10;  // 0.1 – 1.0
  const rotSpd    = Math.max(apRotateSpeed, 1) / 10;  // 0.1 – 1.0

  const aps: AccessPoint[] = [];
  for (let i = 0; i < count; i++) {
    let bx: number, by: number;
    if (i === 0) {
      // First AP: use posX/posY (or legacy origin)
      [bx, by] = (posX !== undefined && posY !== undefined)
        ? [posX, posY]
        : legacyCenter();
    } else {
      [bx, by] = AP_PRESET_POSITIONS[i];
    }
    const baseDirRad = direction * (Math.PI / 180);
    aps.push({
      baseX: bx, baseY: by, cx: 0, cy: 0,
      baseDir: baseDirRad, dir: baseDirRad,
      driftPhaseX: Math.random() * Math.PI * 2,
      driftPhaseY: Math.random() * Math.PI * 2,
      driftSpeedX: (0.08 + Math.random() * 0.06) * driftSpd * 8,
      driftSpeedY: (0.06 + Math.random() * 0.05) * driftSpd * 8,
      rotPhase:    Math.random() * Math.PI * 2,
      rotDir:      Math.random() > 0.5 ? 1 : -1,
      rings:       [],
      emitTimer:   i * (interval / count),   // stagger first bursts across APs
      colorIdx:    i % pool.length,
    });
  }

  function emitBurstFor(ap: AccessPoint) {
    const staggerGap = speed / Math.max(ringCount, 1) * 0.35;
    for (let i = 0; i < ringCount; i++) {
      ap.rings.push({ age: -(i * staggerGap), maxAge: speed, colorIdx: ap.colorIdx });
    }
  }

  // Emit first burst immediately for AP0; others fire naturally via staggered emitTimer
  emitBurstFor(aps[0]);

  function setup() {
    const sz = sectionEl || container;
    const szW = sz.offsetWidth  || canvas.getBoundingClientRect().width  || 800;
    const szH = sz.offsetHeight || canvas.getBoundingClientRect().height || 600;
    canvasW = canvas.width  = szW;
    canvasH = canvas.height = szH;
    refreshObstacleBboxes();
  }

  function draw(now: number) {
    if (!running) return;
    if (lastTime >= 0 && now - lastTime < 32) {
      frameId = requestAnimationFrame(draw);
      return;
    }

    const dt = lastTime < 0 ? 0 : (now - lastTime) / 1000;
    lastTime = now;

    bboxRefreshTimer += dt * 1000;
    if (bboxRefreshTimer > 1500) { refreshObstacleBboxes(); bboxRefreshTimer = 0; }

    ctx.clearRect(0, 0, canvasW, canvasH);

    const maxR        = (maxRadius / 100) * Math.max(canvasW, canvasH) * 0.55;
    // Cap arcSpread at 120° — values above that look like semicircles, not WiFi arcs.
    // Old configs may have stored values up to 360 before the slider max was capped.
    const arcSpreadCapped = Math.min(arcSpread, 120);
    const spreadRad   = (arcSpreadCapped / 2) * (Math.PI / 180);
    const shadowAlpha = shadowOpacity / 100;
    const isFullCircle = style === "rings";
    const driftAmt    = Math.min(canvasW, canvasH) * 0.10;  // max 10% of canvas
    const rotRange    = Math.PI * 0.5;                       // ±90° rotation swing

    // Lighter compositing for multi-AP: overlapping rings add together (visible interference)
    // "lighter" = additive blending — where arcs cross they become noticeably brighter
    if (count > 1) ctx.globalCompositeOperation = "lighter";

    for (const ap of aps) {
      // ── Update AP position (drift) ──────────────────────────────────────────
      if (apDrift) {
        ap.driftPhaseX += ap.driftSpeedX * dt;
        ap.driftPhaseY += ap.driftSpeedY * dt;
        ap.cx = (ap.baseX / 100) * canvasW + Math.sin(ap.driftPhaseX) * driftAmt;
        ap.cy = (ap.baseY / 100) * canvasH + Math.cos(ap.driftPhaseY) * driftAmt;
      } else {
        ap.cx = (ap.baseX / 100) * canvasW;
        ap.cy = (ap.baseY / 100) * canvasH;
      }

      // ── Update AP arc direction (rotation) ──────────────────────────────────
      if (apRotate) {
        ap.rotPhase += rotSpd * 0.6 * dt;
        ap.dir = ap.baseDir + Math.sin(ap.rotPhase * ap.rotDir) * rotRange;
      } else {
        ap.dir = ap.baseDir;
      }

      // ── Emit timer ──────────────────────────────────────────────────────────
      ap.emitTimer += dt * 1000;
      if (ap.emitTimer >= interval) { emitBurstFor(ap); ap.emitTimer %= interval; }

      // ── Draw rings for this AP ───────────────────────────────────────────────
      const { cx, cy, dir } = ap;
      for (let i = ap.rings.length - 1; i >= 0; i--) {
        ap.rings[i].age += dt;
        const ring = ap.rings[i];

        if (ring.age < 0) continue;
        if (ring.age > ring.maxAge) { ap.rings.splice(i, 1); continue; }

        const p     = ring.age / ring.maxAge;
        const r     = p * maxR;
        // When multiple APs active: reduce per-ring alpha so individual rings don't
        // saturate, but overlapping rings (lighter compositing) visibly add together
        const alphaScale = count > 1 ? 0.55 : 0.85;
        const alpha = Math.sin(p * Math.PI) * alphaScale;
        if (alpha < 0.01 || r < 1) continue;

        const color = fixedColor ?? pool[ring.colorIdx % pool.length];

        ctx.save();
        if (perspective3d) {
          ctx.translate(cx, cy);
          ctx.scale(1, 0.45);
          ctx.translate(-cx, -cy);
        }
        if (shadowAlpha > 0) {
          strokeRing(cx, cy, r, dir - spreadRad, dir + spreadRad, isFullCircle,
            color, alpha * shadowAlpha * 0.3, thickness * 5);
        }
        strokeRing(cx, cy, r, dir - spreadRad, dir + spreadRad, isFullCircle,
          color, alpha, thickness);
        ctx.restore();
      }

      // ── Source dot (arcs style) ─────────────────────────────────────────────
      if (style === "arcs") {
        ctx.save();
        const dotColor = fixedColor ?? pool[ap.colorIdx % pool.length];
        ctx.fillStyle = hexToRgba(dotColor, 0.25);
        ctx.beginPath();
        ctx.arc(cx, cy, thickness * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = hexToRgba(dotColor, 0.85);
        ctx.beginPath();
        ctx.arc(cx, cy, thickness * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    if (count > 1) ctx.globalCompositeOperation = "source-over";

    frameId = requestAnimationFrame(draw);
  }

  setup();
  frameId = requestAnimationFrame(draw);

  const obs = new ResizeObserver(() => setup());
  obs.observe(container);

  return {
    pause:   () => { running = false; cancelAnimationFrame(frameId); },
    resume:  () => { running = true; lastTime = -1; frameId = requestAnimationFrame(draw); },
    destroy: () => {
      running = false;
      cancelAnimationFrame(frameId);
      obs.disconnect();
      canvas.remove();
      if (mouseInterference) {
        mouseTarget.removeEventListener("mousemove",   onMouseMove);
        mouseTarget.removeEventListener("mouseleave",  onMouseLeave);
        mouseTarget.removeEventListener("touchmove",   onTouchMove);
        mouseTarget.removeEventListener("touchend",    onTouchEnd);
        mouseTarget.removeEventListener("touchcancel", onTouchEnd);
      }
    },
  };
}

// ─── 8. 3D Scene ─────────────────────────────────────────────────────────────

export function threeDSceneAnimator(
  container: HTMLElement,
  config: ThreeDSceneConfig
): AnimatorHandle {
  let frameId = 0;
  let running  = true;
  let renderer: any = null;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
  container.appendChild(canvas);

  Promise.all([
    import("three"),
    import("three/examples/jsm/loaders/GLTFLoader.js"),
  ]).then(([THREE, { GLTFLoader }]) => {
    if (!running) return;

    const w = container.offsetWidth  || 800;
    const h = container.offsetHeight || 600;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.z = config.cameraDistance;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    canvas.style.opacity = String(config.envOpacity / 100);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(new THREE.Color(config.lightColor), config.lightIntensity);
    light.position.set(5, 5, 5);
    scene.add(light);

    let model: import("three").Object3D | null = null;

    if (config.modelUrl) {
      const loader = new GLTFLoader();
      loader.load(
        config.modelUrl,
        (gltf) => { model = gltf.scene; scene.add(model!); },
        undefined,
        (err) => { console.warn("[AnimBg] GLTF error:", err); }
      );
    } else {
      const geo = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
      const mat = new THREE.MeshStandardMaterial({ color: 0x4ecdc4, metalness: 0.3, roughness: 0.5 });
      model = new THREE.Mesh(geo, mat);
      scene.add(model);
    }

    const tick = () => {
      if (!running) return;
      if (model && config.autoRotate) {
        model.rotation.y += 0.005 * config.rotationSpeed;
        model.rotation.x += 0.002 * config.rotationSpeed;
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };
    tick();

    const obs = new ResizeObserver(() => {
      const nw = container.offsetWidth;
      const nh = container.offsetHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    obs.observe(container);
    (canvas as any).__resizeObs = obs;
  }).catch((e) => {
    console.warn("[AnimBg] Three.js load error:", e);
  });

  return {
    pause:   () => { running = false; cancelAnimationFrame(frameId); },
    resume:  () => { running = true; },
    destroy: () => {
      running = false;
      cancelAnimationFrame(frameId);
      (canvas as any).__resizeObs?.disconnect();
      renderer?.dispose();
      canvas.remove();
    },
  };
}

// ─── 11. SVG Animation ───────────────────────────────────────────────────────
// Renders an SVG (supplied as markup) into a container div and applies
// optional Anime.js-powered overlay animations (float, pulse, spin, draw-on).
// The SVG's own <animate> / <animateTransform> tags continue to run as-is.

export function svgAnimationAnimator(
  container: HTMLElement,
  config: SVGAnimationConfig,
  colors: string[]
): AnimatorHandle {
  const {
    svgCode   = "",
    animation = "float",
    speed     = 4,
    loop      = true,
    scale     = 60,
    posX      = 50,
    posY      = 50,
    colorize  = true,
  } = config;

  const pool = (colors.length ? colors : DEFAULT_FALLBACK_COLORS).map(safeColor);

  // Wrapper — positions the SVG via CSS
  const wrapper = document.createElement("div");
  wrapper.style.cssText = [
    "position:absolute",
    "pointer-events:none",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    `left:${posX}%`,
    `top:${posY}%`,
    "transform:translate(-50%,-50%)",
    `width:${scale}%`,
    `height:${scale}%`,
  ].join(";");
  container.appendChild(wrapper);

  // Parse and inject SVG
  const parser  = new DOMParser();
  const svgDoc  = parser.parseFromString(svgCode || "<svg xmlns='http://www.w3.org/2000/svg'/>", "image/svg+xml");
  const svgEl   = svgDoc.documentElement as unknown as SVGSVGElement;
  svgEl.style.cssText = "width:100%;height:100%;overflow:visible;";
  svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
  wrapper.appendChild(svgEl);

  // Apply colourize filter — tint strokes/fills using the first palette colour
  if (colorize && pool.length) {
    const tintColor = pool[0];
    // Only override elements that don't have an explicit inline color
    svgEl.querySelectorAll<SVGElement>("[stroke]").forEach(el => {
      const s = el.getAttribute("stroke");
      if (!s || s === "currentColor") el.setAttribute("stroke", tintColor);
    });
    svgEl.querySelectorAll<SVGElement>("[fill]").forEach(el => {
      const f = el.getAttribute("fill");
      if (!f || f === "currentColor") el.setAttribute("fill", tintColor);
    });
    svgEl.style.color = tintColor; // currentColor fallback
  }

  let anims: AnimInstance[] = [];
  let running = true;

  function applyAnimation() {
    if (!running) return;
    const dur = (speed || 4) * 1000;
    const loopVal = loop ? Infinity : 1;

    if (animation === "float") {
      anims.push(animate(wrapper, {
        translateY: ["-6%", "6%"],
        duration: dur,
        direction: "alternate",
        ease: "inOutSine",
        loop: loopVal,
      }));
    } else if (animation === "pulse") {
      anims.push(animate(wrapper, {
        scale: [1, 1.08, 1],
        opacity: [0.7, 1, 0.7],
        duration: dur,
        ease: "inOutSine",
        loop: loopVal,
      }));
    } else if (animation === "spin") {
      anims.push(animate(svgEl, {
        rotate: "360deg",
        duration: dur,
        ease: "linear",
        loop: loopVal,
      }));
    } else if (animation === "draw-on") {
      // Animate stroke-dashoffset on all path/circle/rect/polygon/line elements
      const els = Array.from(svgEl.querySelectorAll<SVGGeometryElement>(
        "path,circle,rect,ellipse,polyline,polygon,line"
      ));
      els.forEach(el => {
        let len: number;
        try { len = (el as SVGGeometryElement).getTotalLength?.() ?? 500; } catch { len = 500; }
        el.style.strokeDasharray  = String(len);
        el.style.strokeDashoffset = String(len);
      });
      anims.push(animate(els, {
        strokeDashoffset: ["inherit", "0"],
        duration: dur,
        ease: "inOutCubic",
        loop: loopVal,
      }));
    } else if (animation === "morph") {
      // Gentle morph: slight skew oscillation
      anims.push(animate(wrapper, {
        skewX: ["0deg", "3deg", "0deg", "-3deg", "0deg"],
        skewY: ["0deg", "2deg", "0deg", "-2deg", "0deg"],
        duration: dur,
        ease: "inOutSine",
        loop: loopVal,
      }));
    }
    // animation === "none" → no Anime.js, SVG's own animations run naturally
  }

  applyAnimation();

  const obs = new ResizeObserver(() => {
    // Reposition if container resizes (posX/posY are %, CSS handles it)
  });
  obs.observe(container);

  return {
    pause:   () => { running = false; anims.forEach(a => a.pause()); },
    resume:  () => { running = true;  anims.forEach(a => a.play()); },
    destroy: () => {
      running = false;
      anims.forEach(a => a.pause());
      obs.disconnect();
      wrapper.remove();
    },
  };
}

// ─── 12. Text Effects ─────────────────────────────────────────────────────────

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&";

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

/**
 * Build a CSS string for the text fill.
 * Returns { color, background, webkitBackgroundClip, backgroundClip } props as an inline style fragment.
 */
function buildFillStyle(
  fillType: TextEffectsConfig["fillType"],
  fillColor: string,
  fillGradient: string,
  colors: string[]
): React.CSSProperties {
  const primaryColor = fillColor || colors[0] || "#4ecdc4";

  if (fillType === "gradient") {
    const gradient = fillGradient || `linear-gradient(135deg, ${colors[0] || "#4ecdc4"}, ${colors[1] || "#6a82fb"})`;
    return {
      background: gradient,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent",
    };
  }
  // solid (or fallback)
  return { color: primaryColor };
}

/**
 * Directional stagger order for cascade/wave animations.
 * Returns an array of indices sorted by travel order.
 */
function staggerOrder(count: number, dir: TextDirection): number[] {
  const indices = Array.from({ length: count }, (_, i) => i);
  if (dir === "right") return [...indices].reverse();
  if (dir === "up" || dir === "down") return indices; // top→bottom natural
  if (dir === "center") {
    // sort by distance from centre outward
    const mid = (count - 1) / 2;
    return [...indices].sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
  }
  if (dir === "random") return [...indices].sort(() => Math.random() - 0.5);
  return indices; // left → right default
}

function getCharEnterTransform(dir: TextDirection): { translateX?: string[]; translateY?: string[] } {
  const dist = "0.6em";
  if (dir === "left")   return { translateX: [`-${dist}`, "0em"] };
  if (dir === "right")  return { translateX: [dist, "0em"] };
  if (dir === "up")     return { translateY: [dist, "0em"] };
  if (dir === "down")   return { translateY: [`-${dist}`, "0em"] };
  if (dir === "center") return { translateX: ["0em", "0em"] };
  return { translateY: [`-${dist}`, "0em"] }; // random default
}

export function textEffectsAnimator(
  container: HTMLElement,
  config: TextEffectsConfig,
  colors: string[],
  /** Section root element — used for intro mode (z-index must escape container) */
  sectionEl?: HTMLElement | null,
  /** Called when intro mode animation completes (naturally or via skip) */
  onDone?: () => void
): AnimatorHandle {
  const {
    text, animation, direction, fontSize, fontWeight, letterSpacing,
    posX, posY, fillType, fillColor, fillGradient, fillMediaUrl,
    speed, stagger: staggerMs, loop, loopDelay, mode,
    exitEffect, holdDuration, customCode, lineSpacing,
    introBgColor, sequenceEntries,
  } = { ...config };

  // ── Parse multi-line text ─────────────────────────────────────────────────
  const lines = text.split("\n").map(l => l.trimEnd()).filter(l => l.length > 0);
  if (lines.length === 0) lines.push(text || "");
  const lineGap = (lineSpacing != null ? lineSpacing : fontSize * 1.3);

  const speedFactor = Math.max(0.1, speed);
  const charDelay   = staggerMs / speedFactor;

  // ── Intro mode: mount on section root so it escapes overflow:hidden ──────
  const mountTarget = (mode === "intro" && sectionEl) ? sectionEl : container;

  let running = false; // starts paused — resume() starts the animation
  let cycleGen = 0;    // incremented on every resume() to cancel stale async chains
  let loopTimer: ReturnType<typeof setTimeout> | null = null;
  const anims: ReturnType<typeof animate>[] = [];

  // ── Outer wrapper ─────────────────────────────────────────────────────────
  const wrapper = document.createElement("div");
  const wrapperBg = mode === "intro" ? (introBgColor || "#000000") : "";
  wrapper.style.cssText = [
    "position:absolute",
    "inset:0",
    "pointer-events:none",
    "overflow:hidden",
    `z-index:${mode === "intro" ? 20 : 0}`,
    wrapperBg ? `background:${wrapperBg}` : "",
  ].filter(Boolean).join(";");
  mountTarget.appendChild(wrapper);

  // ── Video element (video-clip fill) ──────────────────────────────────────
  let videoEl: HTMLVideoElement | null = null;
  if (fillType === "video-clip" && fillMediaUrl) {
    videoEl = document.createElement("video");
    videoEl.src = fillMediaUrl;
    videoEl.autoplay = true;
    videoEl.muted = true;
    videoEl.loop = true;
    videoEl.playsInline = true;
    videoEl.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;pointer-events:none;";
    wrapper.appendChild(videoEl);
    videoEl.play().catch(() => {});
  }

  // ── Text group — positioned at (posX%, posY%) ──────────────────────────
  // Uses position:absolute + transform to reliably center the text block at the given coords.
  const primaryColor = fillColor || colors[0] || "#4ecdc4";

  const textGroup = document.createElement("div");
  textGroup.style.cssText = [
    "position:absolute",
    `left:${posX}%`,
    `top:${posY}%`,
    "transform:translate(-50%,-50%)",
    "pointer-events:none",
    "display:flex",
    "flex-direction:column",
    "align-items:center",
    `gap:${lineGap}vw`,
  ].join(";");
  wrapper.appendChild(textGroup);

  // ── Helper: apply fill style to a line element ──────────────────────────
  function applyFill(el: HTMLElement) {
    if (fillType === "gradient") {
      const grad = fillGradient || `linear-gradient(135deg, ${colors[0] || "#4ecdc4"}, ${colors[1] || "#6a82fb"})`;
      el.style.background = grad;
      el.style.webkitBackgroundClip = "text";
      el.style.backgroundClip = "text";
      el.style.webkitTextFillColor = "transparent";
      el.style.color = "transparent";
    } else if (fillType === "image-clip" && fillMediaUrl) {
      el.style.backgroundImage = `url(${fillMediaUrl})`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.style.webkitBackgroundClip = "text";
      el.style.backgroundClip = "text";
      el.style.webkitTextFillColor = "transparent";
      el.style.color = "transparent";
    } else if (fillType === "video-clip") {
      el.style.color = primaryColor; // fallback while canvas loads
    } else {
      el.style.color = primaryColor;
    }
  }

  // ── Create one line element per text line ─────────────────────────────────
  const lineEls: HTMLElement[] = lines.map(() => {
    const el = document.createElement("div");
    el.style.cssText = [
      `font-size:${fontSize}vw`,
      `font-weight:${fontWeight}`,
      `letter-spacing:${letterSpacing}em`,
      "white-space:nowrap",
      "user-select:none",
      "pointer-events:none",
      "line-height:1",
    ].join(";");
    applyFill(el);
    textGroup.appendChild(el);
    return el;
  });

  // Convenience alias — used by non-multi-line paths (canvas, custom-code)
  const textEl = lineEls[0];

  // ── Canvas for video-clip compositing ─────────────────────────────────────
  let canvasEl: HTMLCanvasElement | null = null;
  let canvasCtx: CanvasRenderingContext2D | null = null;
  let videoFrameId = 0;

  if (fillType === "video-clip" && videoEl) {
    canvasEl = document.createElement("canvas");
    canvasEl.style.cssText = "position:absolute;inset:0;pointer-events:none;";
    wrapper.appendChild(canvasEl);

    const drawVideoFrame = () => {
      if (!running || !canvasEl || !canvasCtx || !videoEl) return;
      const w = wrapper.offsetWidth;
      const h = wrapper.offsetHeight;
      if (canvasEl.width !== w || canvasEl.height !== h) {
        canvasEl.width  = w;
        canvasEl.height = h;
      }
      canvasCtx.clearRect(0, 0, w, h);
      // Draw text path as mask (supports multi-line)
      const fSize = parseFloat(fontSize + "") * w / 100 * (fontSize / 10);
      canvasCtx.save();
      canvasCtx.font = `${fontWeight} ${fSize}px sans-serif`;
      canvasCtx.textAlign    = "center";
      canvasCtx.textBaseline = "middle";
      canvasCtx.fillStyle = "#fff";
      const lineSpacingPx = lineGap * w / 100;
      const totalH = (lines.length - 1) * lineSpacingPx;
      lines.forEach((lineText, idx) => {
        const ly = h * (posY / 100) - totalH / 2 + idx * lineSpacingPx;
        canvasCtx!.fillText(lineText, w * (posX / 100), ly);
      });
      canvasCtx.globalCompositeOperation = "source-in";
      canvasCtx.drawImage(videoEl, 0, 0, w, h);
      canvasCtx.restore();
      canvasCtx.globalCompositeOperation = "source-over";
      videoFrameId = requestAnimationFrame(drawVideoFrame);
    };

    const initCanvas = () => {
      if (!canvasEl) return;
      canvasCtx = canvasEl.getContext("2d");
      textEl.style.opacity = "0"; // hide DOM text, canvas draws it
      drawVideoFrame();
    };
    if (videoEl.readyState >= 2) initCanvas();
    else videoEl.addEventListener("canplay", initCanvas, { once: true });
  }

  // ── Custom code path ──────────────────────────────────────────────────────
  if (animation === "custom-code") {
    let customHandle: AnimatorHandle | null = null;
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function("container", "colors", "config", customCode || "return { pause:()=>{}, resume:()=>{}, destroy:()=>{} };");
      customHandle = fn(wrapper, colors, config) as AnimatorHandle;
    } catch (e) {
      console.warn("[TextEffects custom-code error]", e);
    }
    return {
      pause:   () => { running = false; customHandle?.pause(); },
      resume:  () => { running = true;  customHandle?.resume(); },
      destroy: () => {
        running = false;
        customHandle?.destroy();
        cancelAnimationFrame(videoFrameId);
        videoEl?.pause();
        wrapper.remove();
      },
    };
  }

  // ── Split chars helper ────────────────────────────────────────────────────
  function buildCharSpans(el: HTMLElement, lineText: string): HTMLElement[] {
    while (el.firstChild) el.removeChild(el.firstChild);
    // If the parent line element uses background-clip:text (gradient or image-clip fill),
    // each span must inherit the background and re-apply the clip so the fill shows through.
    const needsClipInherit =
      (el.style as any).webkitBackgroundClip === "text" ||
      el.style.backgroundClip === "text";
    return lineText.split("").map((ch) => {
      const span = document.createElement("span");
      if (needsClipInherit) {
        span.style.cssText = "display:inline-block;background:inherit;background-size:inherit;background-position:inherit;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;";
      } else {
        span.style.cssText = "display:inline-block;";
      }
      span.textContent = ch === " " ? "\u00a0" : ch;
      el.appendChild(span);
      return span;
    });
  }

  // ── Exit animation (intro mode) ───────────────────────────────────────────
  function runExit(): Promise<void> {
    return new Promise((resolve) => {
      if (exitEffect === "instant") { wrapper.style.display = "none"; resolve(); return; }

      if (exitEffect === "wipe") {
        wrapper.style.clipPath = "inset(0 0% 0 0)";
        const a = animate(wrapper, {
          clipPath: ["inset(0 0% 0 0)", "inset(0 100% 0 0)"],
          duration: 600 / speedFactor,
          ease: "inOutCubic",
        });
        anims.push(a);
        setTimeout(() => { wrapper.style.display = "none"; resolve(); }, 650 / speedFactor);
        return;
      }

      if (exitEffect === "glitch") {
        let flickers = 0;
        const flicker = () => {
          if (flickers >= 6) { wrapper.style.display = "none"; resolve(); return; }
          wrapper.style.opacity = flickers % 2 === 0 ? "0" : "1";
          wrapper.style.transform = `translateX(${(Math.random() - 0.5) * 12}px)`;
          flickers++;
          setTimeout(flicker, 60 + Math.random() * 80);
        };
        flicker();
        return;
      }

      // fade (default)
      const a = animate(wrapper, {
        opacity: [1, 0],
        duration: 700 / speedFactor,
        ease: "outCubic",
      });
      anims.push(a);
      setTimeout(() => { wrapper.style.display = "none"; resolve(); }, 720 / speedFactor);
    });
  }

  // ── Loop orchestrator ─────────────────────────────────────────────────────
  async function runCycle(gen: number) {
    if (!running || cycleGen !== gen) return;
    wrapper.style.opacity   = "1";
    wrapper.style.display   = "";
    wrapper.style.transform = "";
    wrapper.style.clipPath  = "";

    await runAnimation();

    if (!running || cycleGen !== gen) return;

    if (mode === "intro") {
      await new Promise<void>(r => setTimeout(r, holdDuration));
      if (!running || cycleGen !== gen) return;
      await runExit();
      if (cycleGen === gen) onDone?.();
      return; // intro plays once
    }

    if (loop && running && cycleGen === gen) {
      loopTimer = setTimeout(() => runCycle(gen), loopDelay);
    }
  }

  // ── Single-line animation dispatcher ─────────────────────────────────────
  async function runLineAnimation(lineEl: HTMLElement, lineText: string, lineDelay: number, animOverride?: string): Promise<void> {
    if (lineDelay > 0) {
      await new Promise<void>(r => setTimeout(r, lineDelay));
      if (!running) return;
    }
    return new Promise<void>((resolve) => {
      const activeAnim = animOverride ?? animation;
      const chars = buildCharSpans(lineEl, lineText);
      const count = chars.length;
      if (count === 0) { resolve(); return; }

      const dur       = (300 / speedFactor);
      const totalTime = dur + charDelay * count;

      // ── typewriter ──────────────────────────────────────────────────────
      if (activeAnim === "typewriter") {
        chars.forEach((s) => { s.style.opacity = "0"; });
        const cursor = document.createElement("span");
        cursor.textContent = "|";
        cursor.style.cssText = `display:inline-block;opacity:1;color:${primaryColor};`;
        lineEl.appendChild(cursor);
        const cursorAnim = animate(cursor, {
          opacity: [1, 0],
          duration: 500,
          ease: "steps(1)",
          loop: true,
        });
        anims.push(cursorAnim);

        const order = staggerOrder(count, direction);
        order.forEach((i, tick) => {
          setTimeout(() => {
            if (!running) return;
            chars[i].style.opacity = "1";
          }, tick * charDelay);
        });

        setTimeout(() => {
          cursorAnim.pause();
          cursor.remove();
          resolve();
        }, totalTime + 200);
        return;
      }

      // ── scramble ────────────────────────────────────────────────────────
      if (activeAnim === "scramble") {
        const targets = lineText.split("");
        const resolved = new Array(count).fill(false);
        // Use multi-color scramble when palette has >1 color
        const multiColor = colors.length > 1;

        chars.forEach((s) => {
          s.textContent = randomChar();
          if (multiColor) s.style.color = pickColor(colors);
        });

        let tick = 0;
        const shuffleInterval = setInterval(() => {
          if (!running) { clearInterval(shuffleInterval); resolve(); return; }
          chars.forEach((s, i) => {
            if (!resolved[i]) {
              s.textContent = randomChar();
              if (multiColor) s.style.color = pickColor(colors);
            }
          });
          tick++;
        }, 40);

        const order = staggerOrder(count, direction);
        order.forEach((i, idx) => {
          setTimeout(() => {
            resolved[i] = true;
            chars[i].textContent = targets[i] === " " ? "\u00a0" : targets[i];
            chars[i].style.color = ""; // restore parent fill
          }, idx * charDelay * 1.5);
        });

        setTimeout(() => {
          clearInterval(shuffleInterval);
          chars.forEach((s, i) => {
            s.textContent = targets[i] === " " ? "\u00a0" : targets[i];
            s.style.color = "";
          });
          resolve();
        }, totalTime * 1.5 + 200);
        return;
      }

      // ── glitch ──────────────────────────────────────────────────────────
      if (activeAnim === "glitch") {
        const intensity = Math.max(1, speedFactor);
        const dx = 6 * intensity;
        const sk = 4 * intensity;
        const glitchAnim = animate(lineEl, {
          translateX: ["0px", `${dx}px`, `${-dx}px`, `${dx*0.5}px`, `${-dx*0.3}px`, `${dx*0.8}px`, "0px"],
          translateY: ["0px", `${-intensity*2}px`, `${intensity*2}px`, `${-intensity}px`, `${intensity}px`, "0px"],
          skewX: ["0deg", `${sk}deg`, `${-sk}deg`, `${sk*0.5}deg`, "0deg"],
          opacity: [0.2, 1, 0.6, 1, 0.4, 1, 0.8, 1],
          duration: 1000 / speedFactor,
          ease: "steps(6)",
        });
        anims.push(glitchAnim);

        // Pseudo-element color flash using an overlay div
        const flashEl = document.createElement("div");
        flashEl.style.cssText = "position:absolute;inset:0;pointer-events:none;mix-blend-mode:overlay;opacity:0;";
        if (colors.length > 1) flashEl.style.background = pickColor(colors);
        wrapper.appendChild(flashEl);

        const targets = lineText.split("");
        let glitchTick = 0;
        const gi = setInterval(() => {
          if (!running) { clearInterval(gi); flashEl.remove(); return; }
          // Glitch chars with 50% probability; color-flash during scramble
          chars.forEach((s, i) => {
            if (Math.random() < 0.5) {
              s.textContent = randomChar();
              if (colors.length > 1 && Math.random() < 0.4) s.style.color = pickColor(colors);
            } else {
              s.textContent = targets[i] === " " ? "\u00a0" : targets[i];
              s.style.color = "";
            }
          });
          // Random color flash overlay
          if (colors.length > 1) {
            flashEl.style.background = pickColor(colors);
            flashEl.style.opacity = Math.random() < 0.3 ? "0.35" : "0";
          }
          glitchTick++;
          if (glitchTick > 18) {
            clearInterval(gi);
            flashEl.remove();
            chars.forEach((s, i) => { s.textContent = targets[i] === " " ? "\u00a0" : targets[i]; s.style.color = ""; });
          }
        }, 45);

        setTimeout(resolve, 1100 / speedFactor);
        return;
      }

      // ── cascade ─────────────────────────────────────────────────────────
      if (activeAnim === "cascade") {
        const order = staggerOrder(count, direction);
        const transform = getCharEnterTransform(direction);
        chars.forEach((s) => { s.style.opacity = "0"; });

        order.forEach((i, tick) => {
          setTimeout(() => {
            if (!running) return;
            const a = animate(chars[i], {
              opacity:     [0, 1],
              translateX:  transform.translateX ?? ["0em", "0em"],
              translateY:  transform.translateY ?? ["0em", "0em"],
              duration:    dur,
              ease:        "outBack",
            });
            anims.push(a);
          }, tick * charDelay);
        });

        setTimeout(resolve, totalTime + 100);
        return;
      }

      // ── wave ────────────────────────────────────────────────────────────
      if (activeAnim === "wave") {
        const loopVal = loop && mode === "background";
        // Wave needs a full smooth cycle — enforce minimums to prevent strobe
        // regardless of how high speedFactor is (e.g. speed:60 → dur=5ms = strobe)
        const waveCycleDur = Math.max(400, dur);
        const waveStagger  = Math.max(50, charDelay);
        const a = animate(chars, {
          translateY: [
            { value: "-0.38em", duration: waveCycleDur / 2, ease: "outSine" },
            { value:  "0em",    duration: waveCycleDur / 2, ease: "inSine"  },
          ],
          delay: stagger(waveStagger),
          duration: waveCycleDur,
          loop: loopVal,
        });
        anims.push(a);
        if (!loopVal) setTimeout(resolve, waveCycleDur + waveStagger * count + 100);
        else resolve();
        return;
      }

      // ── reveal ──────────────────────────────────────────────────────────
      if (activeAnim === "reveal") {
        // "random" direction: reveal individual characters in random order
        if (direction === "random") {
          chars.forEach(s => { s.style.opacity = "0"; s.style.transform = "translateY(-0.4em) scale(0.8)"; });
          const order = staggerOrder(count, "random");
          order.forEach((i, tick) => {
            setTimeout(() => {
              if (!running) return;
              const a = animate(chars[i], {
                opacity:    [0, 1],
                translateY: ["-0.4em", "0em"],
                scale:      [0.8, 1],
                duration:   dur * 1.2,
                ease:       "outBack",
              });
              anims.push(a);
            }, tick * charDelay * 0.8);
          });
          setTimeout(resolve, totalTime + 100);
          return;
        }
        const clipStart: Record<TextDirection, string> = {
          left:   "inset(0 100% 0 0)",
          right:  "inset(0 0 0 100%)",
          up:     "inset(100% 0 0 0)",
          down:   "inset(0 0 100% 0)",
          center: "inset(0 50% 0 50%)",
          random: "inset(0 100% 0 0)",
        };
        lineEl.style.clipPath = clipStart[direction] || clipStart.left;
        const a = animate(lineEl, {
          clipPath: [clipStart[direction] || clipStart.left, "inset(0 0% 0 0%)"],
          duration: 700 / speedFactor,
          ease: "inOutCubic",
        });
        anims.push(a);
        setTimeout(resolve, 750 / speedFactor);
        return;
      }

      // ── blur-in ─────────────────────────────────────────────────────────
      if (activeAnim === "blur-in") {
        lineEl.style.opacity = "0";
        lineEl.style.filter  = "blur(20px)";
        const a = animate(lineEl, {
          opacity: [0, 1],
          filter:  ["blur(20px)", "blur(0px)"],
          duration: 900 / speedFactor,
          ease: "outCubic",
        });
        anims.push(a);
        setTimeout(resolve, 950 / speedFactor);
        return;
      }

      // ── word-by-word ────────────────────────────────────────────────────
      if (activeAnim === "word-by-word") {
        while (lineEl.firstChild) lineEl.removeChild(lineEl.firstChild);
        const words = lineText.split(" ");
        const wordSpans = words.map((w) => {
          const s = document.createElement("span");
          s.style.cssText = "display:inline-block;opacity:0;margin-right:0.25em;";
          s.textContent = w;
          lineEl.appendChild(s);
          return s;
        });

        const wordDur = 400 / speedFactor;
        const wordDelay = charDelay * 3;

        wordSpans.forEach((s, i) => {
          setTimeout(() => {
            if (!running) return;
            animate(s, {
              opacity:    [0, 1],
              translateY: ["0.3em", "0em"],
              duration:   wordDur,
              ease:       "outBack",
            });
          }, i * wordDelay);
        });

        setTimeout(resolve, wordSpans.length * wordDelay + wordDur + 100);
        return;
      }

      resolve();
    });
  }

  // ── Per-entry exit (used by sequence) ────────────────────────────────────
  function runElementExit(el: HTMLElement, effect: string): Promise<void> {
    return new Promise(resolve => {
      if (effect === "instant") { el.style.opacity = "0"; resolve(); return; }
      if (effect === "wipe") {
        el.style.clipPath = "inset(0 0% 0 0)";
        const a = animate(el, { clipPath: ["inset(0 0% 0 0)", "inset(0 100% 0 0)"], duration: 450 / speedFactor, ease: "inOutCubic" });
        anims.push(a);
        setTimeout(resolve, 480 / speedFactor);
        return;
      }
      if (effect === "glitch") {
        let n = 0;
        const tick = () => {
          if (n >= 6) { el.style.opacity = "0"; resolve(); return; }
          el.style.opacity = n % 2 === 0 ? "0" : "1";
          el.style.transform = `translateX(${(Math.random() - 0.5) * 10}px)`;
          n++;
          setTimeout(tick, 55 + Math.random() * 70);
        };
        tick();
        return;
      }
      // fade
      const a = animate(el, { opacity: [1, 0], duration: 400 / speedFactor, ease: "outCubic" });
      anims.push(a);
      setTimeout(resolve, 430 / speedFactor);
    });
  }

  // ── Sequence handler ──────────────────────────────────────────────────────
  async function runSequence(): Promise<void> {
    const entries = (sequenceEntries || []) as import("@/lib/anim-bg/types").SequenceEntry[];
    if (entries.length === 0) return;

    // Clear default line elements — sequence creates its own
    while (textGroup.firstChild) textGroup.removeChild(textGroup.firstChild);

    for (const entry of entries) {
      if (!running) break;

      let currentEl: HTMLElement | null = null;

      if (entry.type === "text" && entry.text) {
        // ── Text entry ──────────────────────────────────────────────────────
        const el = document.createElement("div");
        el.style.cssText = [
          `font-size:${fontSize}vw`,
          `font-weight:${fontWeight}`,
          `letter-spacing:${letterSpacing}em`,
          "white-space:nowrap",
          "user-select:none",
          "pointer-events:none",
          "line-height:1",
          "opacity:1",
        ].join(";");
        applyFill(el);
        textGroup.appendChild(el);
        currentEl = el;

        if (!entry.animationType || entry.animationType === "none") {
          // Instant reveal — just show it
          el.textContent = entry.text;
        } else {
          await runLineAnimation(el, entry.text, 0, entry.animationType);
        }

      } else if ((entry.type === "image" || entry.type === "video") && entry.mediaUrl) {
        // ── Media flash entry ───────────────────────────────────────────────
        let mediaEl: HTMLElement;
        if (entry.type === "video") {
          const vid = document.createElement("video");
          vid.src = entry.mediaUrl;
          vid.autoplay = true;
          vid.muted = true;
          vid.loop = true;
          vid.playsInline = true;
          vid.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;pointer-events:none;";
          vid.play().catch(() => {});
          mediaEl = vid;
        } else {
          const img = document.createElement("img");
          img.src = entry.mediaUrl;
          img.alt = "";
          img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;pointer-events:none;";
          mediaEl = img;
        }
        wrapper.appendChild(mediaEl);
        currentEl = mediaEl;

        // Fade in media
        const fadeIn = animate(mediaEl, { opacity: [0, 1], duration: 350, ease: "outCubic" });
        anims.push(fadeIn);
        await new Promise<void>(r => setTimeout(r, 380));
      }

      if (!running) { currentEl?.remove(); break; }

      // Hold
      const hold = entry.holdMs ?? 1200;
      if (hold > 0) await new Promise<void>(r => setTimeout(r, hold));

      if (!running) { currentEl?.remove(); break; }

      // Exit
      if (currentEl) {
        await runElementExit(currentEl, entry.exitEffect || "fade");
        currentEl.remove();
      }
    }
  }

  // ── Multi-line orchestrator ────────────────────────────────────────────────
  // Each line animates with a small stagger so they cascade into view.
  async function runAnimation(): Promise<void> {
    if (animation === "sequence") {
      await runSequence();
      return;
    }
    const lineStagger = lines.length > 1 ? staggerMs * 3 : 0;
    await Promise.all(
      lineEls.map((lineEl, idx) => runLineAnimation(lineEl, lines[idx], idx * lineStagger))
    );
  }

  // Animation starts when resume() is first called (triggered by IntersectionObserver in AnimBgRenderer)

  return {
    pause:  () => {
      running = false;
      if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
      anims.forEach(a => a.pause());
      if (videoEl) videoEl.pause();
      cancelAnimationFrame(videoFrameId);
    },
    resume: () => {
      if (running) return;
      running = true;
      // Increment generation — any stale async chain from a previous cycle will
      // check `cycleGen !== gen` and exit without side effects.
      cycleGen++;
      const myGen = cycleGen;
      // Clear stale anime.js instances (they belong to the previous cycle)
      anims.length = 0;
      if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
      if (videoEl) videoEl.play().catch(() => {});
      if (fillType === "video-clip" && canvasCtx) {
        const drawVideoFrame = () => {
          if (!running || !canvasEl || !canvasCtx || !videoEl) return;
          const w = wrapper.offsetWidth;
          const h = wrapper.offsetHeight;
          canvasCtx.clearRect(0, 0, w, h);
          const fSize = parseFloat(fontSize + "") * w / 100 * (fontSize / 10);
          canvasCtx.save();
          canvasCtx.font = `${fontWeight} ${fSize}px sans-serif`;
          canvasCtx.textAlign = "center";
          canvasCtx.textBaseline = "middle";
          canvasCtx.fillStyle = "#fff";
          const lspPx = lineGap * w / 100;
          const totH = (lines.length - 1) * lspPx;
          lines.forEach((lt, idx) => {
            const ly = h * (posY / 100) - totH / 2 + idx * lspPx;
            canvasCtx!.fillText(lt, w * (posX / 100), ly);
          });
          canvasCtx.globalCompositeOperation = "source-in";
          canvasCtx.drawImage(videoEl, 0, 0, w, h);
          canvasCtx.restore();
          canvasCtx.globalCompositeOperation = "source-over";
          videoFrameId = requestAnimationFrame(drawVideoFrame);
        };
        drawVideoFrame();
      }
      // Restart the animation cycle from the beginning
      runCycle(myGen);
    },
    skip: () => {
      if (mode !== "intro" || !running) return;
      running = false;
      if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
      anims.forEach(a => a.pause());
      cancelAnimationFrame(videoFrameId);
      wrapper.style.transition = "opacity 0.3s ease";
      wrapper.style.opacity = "0";
      setTimeout(() => { wrapper.style.display = "none"; }, 300);
      onDone?.();
    },
    destroy: () => {
      running = false;
      if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
      anims.forEach(a => a.pause());
      cancelAnimationFrame(videoFrameId);
      videoEl?.pause();
      wrapper.remove();
    },
  };
}
