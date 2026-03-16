/**
 * seed-volt-cards.mjs
 * Creates 3 layered Volt card designs in the database with hover animations.
 *
 * Usage: node scripts/seed-volt-cards.mjs
 *
 * Card designs:
 *  1. "Neo Card"       — Dark navy, indigo accent circles, peek-on-hover
 *  2. "Stripe Card"    — Light card, colored left stripe, slide-on-hover
 *  3. "Glow Card"      — Dark card, spotlight glow circle, fade-on-hover
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/** Approximate circle path in % space (0-100 coords) */
function circlePath(cx, cy, r) {
  const k = 0.5523;
  return [
    `M${cx},${cy - r}`,
    `C${cx + r * k},${cy - r} ${cx + r},${cy - r * k} ${cx + r},${cy}`,
    `C${cx + r},${cy + r * k} ${cx + r * k},${cy + r} ${cx},${cy + r}`,
    `C${cx - r * k},${cy + r} ${cx - r},${cy + r * k} ${cx - r},${cy}`,
    `C${cx - r},${cy - r * k} ${cx - r * k},${cy - r} ${cx},${cy - r}`,
    "Z",
  ].join(" ");
}

/** Rounded rect path in % space */
function roundRectPath(x, y, w, h, r = 3) {
  return [
    `M${x + r},${y}`,
    `H${x + w - r}`,
    `Q${x + w},${y} ${x + w},${y + r}`,
    `V${y + h - r}`,
    `Q${x + w},${y + h} ${x + w - r},${y + h}`,
    `H${x + r}`,
    `Q${x},${y + h} ${x},${y + h - r}`,
    `V${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    "Z",
  ].join(" ");
}

/** Default animation personality (medium speed, spring ease) */
function defaultAnim(overrides = {}) {
  return {
    character: 50,
    speed: 55,
    style: 60,
    delay: 0,
    animates: { opacity: false, scale: false, position: false, rotation: false, fill: false },
    ...overrides,
  };
}

/** Create a vector layer */
function vectorLayer({ id, name, role, x, y, w, h, zIndex, pathData, color, opacity = 1, blendMode = "normal", animation }) {
  return {
    id,
    name,
    type: "vector",
    role,
    x, y,
    width: w,
    height: h,
    rotation: 0,
    zIndex,
    visible: true,
    locked: false,
    opacity,
    blendMode,
    vectorData: {
      pathData,
      fills: [{ id: uid(), type: "solid", color, opacity: 1, blendMode: "normal" }],
      closed: true,
    },
    animation: defaultAnim(animation),
  };
}

/** Create a slot layer */
function slotLayer({ id, name, slotType, x, y, w, h, zIndex, fontFamily, fontSize, fontWeight, color, textAlign, buttonVariant, animation }) {
  return {
    id,
    name,
    type: "slot",
    role: "content",
    x, y,
    width: w,
    height: h,
    rotation: 0,
    zIndex,
    visible: true,
    locked: false,
    opacity: 1,
    blendMode: "normal",
    slotData: {
      slotType,
      slotLabel: name,
      contentFieldHint: slotType,
      fontFamily: fontFamily || undefined,
      fontSize: fontSize || undefined,
      fontWeight: fontWeight || undefined,
      color: color || undefined,
      textAlign: textAlign || "left",
      buttonVariant: buttonVariant || undefined,
    },
    animation: defaultAnim(animation),
  };
}

// ─────────────────────────────────────────────
// CARD 1: Neo Card
// Dark navy background, indigo accent circles
// Hover: accent circle scales + slides, icon scales up
// Canvas: 300×380 (portrait)
// ─────────────────────────────────────────────

function buildNeoCard() {
  const bgId     = uid();
  const circle1Id = uid();
  const circle2Id = uid();
  const iconId   = uid();
  const titleId  = uid();
  const bodyId   = uid();
  const actionId = uid();

  const layers = [
    // Background: dark navy full rect
    vectorLayer({
      id: bgId, name: "Background", role: "structure",
      x: 0, y: 0, w: 100, h: 100, zIndex: 0,
      pathData: roundRectPath(0, 0, 100, 100, 4),
      color: "#1a1f3a",
      animation: {},
    }),
    // Large accent circle — top-right, partially off-canvas
    vectorLayer({
      id: circle1Id, name: "Accent Circle Large", role: "accent",
      x: 55, y: -15, w: 60, h: 50, zIndex: 1,
      pathData: circlePath(75, 5, 30),
      color: "#6366f1",
      opacity: 0.18,
      animation: { animates: { opacity: false, scale: true, position: true, rotation: false, fill: false } },
    }),
    // Small accent circle — lower-left
    vectorLayer({
      id: circle2Id, name: "Accent Circle Small", role: "accent",
      x: -5, y: 60, w: 30, h: 30, zIndex: 1,
      pathData: circlePath(5, 75, 15),
      color: "#a78bfa",
      opacity: 0.12,
      animation: { animates: { opacity: false, scale: true, position: false, rotation: false, fill: false } },
    }),
    // Slot: icon
    slotLayer({
      id: iconId, name: "Icon", slotType: "icon",
      x: 35, y: 8, w: 30, h: 18, zIndex: 10,
      fontSize: "2.2rem", color: "#a78bfa", textAlign: "center",
      animation: { animates: { opacity: false, scale: true, position: false, rotation: false, fill: false } },
    }),
    // Slot: title
    slotLayer({
      id: titleId, name: "Title", slotType: "title",
      x: 8, y: 30, w: 84, h: 14, zIndex: 10,
      fontFamily: "inherit", fontSize: "1.1rem", fontWeight: 700,
      color: "#ffffff", textAlign: "center",
      animation: {},
    }),
    // Slot: body
    slotLayer({
      id: bodyId, name: "Body", slotType: "body",
      x: 8, y: 47, w: 84, h: 28, zIndex: 10,
      fontSize: "0.82rem", fontWeight: 400,
      color: "rgba(255,255,255,0.65)", textAlign: "center",
      animation: {},
    }),
    // Slot: action button
    slotLayer({
      id: actionId, name: "Action", slotType: "action",
      x: 20, y: 80, w: 60, h: 12, zIndex: 10,
      buttonVariant: "outline",
      animation: {},
    }),
  ];

  const hoverOverrides = {
    [circle1Id]: { scale: 1.15, translateX: -6, translateY: 6 },
    [circle2Id]: { scale: 1.1 },
    [iconId]:    { scale: 1.12 },
  };

  const states = [
    {
      id: uid(),
      name: "hover",
      trigger: "mouseenter",
      layerOverrides: hoverOverrides,
    },
    {
      id: uid(),
      name: "rest",
      trigger: "mouseleave",
      layerOverrides: {},
    },
  ];

  return { layers, states, canvasWidth: 300, canvasHeight: 380 };
}

// ─────────────────────────────────────────────
// CARD 2: Stripe Card
// Light background, colored left accent stripe
// Hover: stripe slides out slightly, top dot scales
// Canvas: 380×260 (landscape)
// ─────────────────────────────────────────────

function buildStripeCard() {
  const bgId      = uid();
  const stripeId  = uid();
  const dotTopId  = uid();
  const dotBotId  = uid();
  const iconId    = uid();
  const titleId   = uid();
  const bodyId    = uid();
  const actionId  = uid();

  const layers = [
    // Background: light
    vectorLayer({
      id: bgId, name: "Background", role: "structure",
      x: 0, y: 0, w: 100, h: 100, zIndex: 0,
      pathData: roundRectPath(0, 0, 100, 100, 3),
      color: "#f0f4ff",
      animation: {},
    }),
    // Left accent stripe
    vectorLayer({
      id: stripeId, name: "Accent Stripe", role: "accent",
      x: 0, y: 0, w: 5, h: 100, zIndex: 2,
      pathData: roundRectPath(0, 0, 5, 100, 2),
      color: "#6366f1",
      opacity: 1,
      animation: { animates: { opacity: false, scale: false, position: true, rotation: false, fill: false } },
    }),
    // Top-right decorative dot
    vectorLayer({
      id: dotTopId, name: "Dot Top", role: "accent",
      x: 82, y: 5, w: 12, h: 16, zIndex: 2,
      pathData: circlePath(88, 12, 6),
      color: "#6366f1",
      opacity: 0.2,
      animation: { animates: { opacity: false, scale: true, position: false, rotation: false, fill: false } },
    }),
    // Bottom-right small dot
    vectorLayer({
      id: dotBotId, name: "Dot Bottom", role: "accent",
      x: 88, y: 80, w: 8, h: 12, zIndex: 2,
      pathData: circlePath(92, 87, 4),
      color: "#a78bfa",
      opacity: 0.15,
      animation: { animates: { opacity: false, scale: true, position: false, rotation: false, fill: false } },
    }),
    // Slot: icon
    slotLayer({
      id: iconId, name: "Icon", slotType: "icon",
      x: 9, y: 12, w: 20, h: 30, zIndex: 10,
      fontSize: "2rem", color: "#6366f1", textAlign: "left",
      animation: {},
    }),
    // Slot: title
    slotLayer({
      id: titleId, name: "Title", slotType: "title",
      x: 9, y: 45, w: 82, h: 16, zIndex: 10,
      fontSize: "1rem", fontWeight: 700, color: "#1e1b4b", textAlign: "left",
      animation: {},
    }),
    // Slot: body
    slotLayer({
      id: bodyId, name: "Body", slotType: "body",
      x: 9, y: 63, w: 82, h: 22, zIndex: 10,
      fontSize: "0.8rem", fontWeight: 400, color: "#4b5563", textAlign: "left",
      animation: {},
    }),
    // Slot: action
    slotLayer({
      id: actionId, name: "Action", slotType: "action",
      x: 9, y: 86, w: 42, h: 10, zIndex: 10,
      buttonVariant: "filled",
      animation: {},
    }),
  ];

  const hoverOverrides = {
    [stripeId]: { translateX: -2, scale: 1 },
    [dotTopId]: { scale: 1.4 },
    [dotBotId]: { scale: 1.3 },
  };

  const states = [
    { id: uid(), name: "hover", trigger: "mouseenter", layerOverrides: hoverOverrides },
    { id: uid(), name: "rest",  trigger: "mouseleave", layerOverrides: {} },
  ];

  return { layers, states, canvasWidth: 380, canvasHeight: 260 };
}

// ─────────────────────────────────────────────
// CARD 3: Glow Card
// Dark card with spotlight glow circle on hover
// Canvas: 300×320 (portrait)
// ─────────────────────────────────────────────

function buildGlowCard() {
  const bgId       = uid();
  const glowId     = uid();
  const innerGlowId = uid();
  const iconId     = uid();
  const titleId    = uid();
  const bodyId     = uid();
  const actionId   = uid();

  const layers = [
    // Background: deep dark
    vectorLayer({
      id: bgId, name: "Background", role: "structure",
      x: 0, y: 0, w: 100, h: 100, zIndex: 0,
      pathData: roundRectPath(0, 0, 100, 100, 4),
      color: "#0f0e17",
      animation: {},
    }),
    // Large spotlight glow circle (initially very faint)
    vectorLayer({
      id: glowId, name: "Glow Spot", role: "accent",
      x: 15, y: 15, w: 70, h: 55, zIndex: 1,
      pathData: circlePath(50, 38, 35),
      color: "#7c3aed",
      opacity: 0.04,
      animation: { animates: { opacity: true, scale: true, position: false, rotation: false, fill: false } },
    }),
    // Inner glow core (starts at scale 0.5)
    vectorLayer({
      id: innerGlowId, name: "Glow Core", role: "accent",
      x: 30, y: 22, w: 40, h: 30, zIndex: 2,
      pathData: circlePath(50, 35, 18),
      color: "#a78bfa",
      opacity: 0.0,
      animation: { animates: { opacity: true, scale: true, position: false, rotation: false, fill: false } },
    }),
    // Slot: icon
    slotLayer({
      id: iconId, name: "Icon", slotType: "icon",
      x: 35, y: 10, w: 30, h: 22, zIndex: 10,
      fontSize: "2rem", color: "#a78bfa", textAlign: "center",
      animation: { animates: { opacity: false, scale: true, position: false, rotation: false, fill: false } },
    }),
    // Slot: title
    slotLayer({
      id: titleId, name: "Title", slotType: "title",
      x: 8, y: 36, w: 84, h: 14, zIndex: 10,
      fontSize: "1.05rem", fontWeight: 700, color: "#ffffff", textAlign: "center",
      animation: {},
    }),
    // Slot: body
    slotLayer({
      id: bodyId, name: "Body", slotType: "body",
      x: 8, y: 53, w: 84, h: 28, zIndex: 10,
      fontSize: "0.82rem", fontWeight: 400, color: "rgba(255,255,255,0.6)", textAlign: "center",
      animation: {},
    }),
    // Slot: action
    slotLayer({
      id: actionId, name: "Action", slotType: "action",
      x: 22, y: 83, w: 56, h: 12, zIndex: 10,
      buttonVariant: "outline",
      animation: {},
    }),
  ];

  const hoverOverrides = {
    [glowId]:      { opacity: 0.32, scale: 1.15 },
    [innerGlowId]: { opacity: 0.22, scale: 1.08 },
    [iconId]:      { scale: 1.1 },
  };

  const states = [
    { id: uid(), name: "hover", trigger: "mouseenter", layerOverrides: hoverOverrides },
    { id: uid(), name: "rest",  trigger: "mouseleave", layerOverrides: {} },
  ];

  return { layers, states, canvasWidth: 300, canvasHeight: 320 };
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function main() {
  // Find the admin user
  const admin = await prisma.user.findFirst({ where: { username: "admin" } });
  if (!admin) throw new Error("Admin user not found — run db:seed first");

  const cards = [
    {
      name: "Neo Card",
      description: "Dark navy card with indigo accent circles. Accent circles scale and slide on hover.",
      elementType: "service-card",
      ...buildNeoCard(),
    },
    {
      name: "Stripe Card",
      description: "Light card with colored left accent stripe. Stripe slides and dots scale on hover.",
      elementType: "service-card",
      ...buildStripeCard(),
    },
    {
      name: "Glow Card",
      description: "Dark card with spotlight glow effect. Glow circle fades and scales in on hover.",
      elementType: "service-card",
      ...buildGlowCard(),
    },
  ];

  for (const card of cards) {
    // Upsert by name so re-running the script is idempotent
    const existing = await prisma.voltElement.findFirst({ where: { name: card.name, authorId: admin.id } });

    if (existing) {
      await prisma.voltElement.update({
        where: { id: existing.id },
        data: {
          layers:      card.layers,
          states:      card.states,
          canvasWidth: card.canvasWidth,
          canvasHeight: card.canvasHeight,
          isPublic:    true,
          elementType: card.elementType,
          description: card.description,
        },
      });
      console.log(`Updated: ${card.name} (${existing.id})`);
    } else {
      const created = await prisma.voltElement.create({
        data: {
          name:        card.name,
          description: card.description,
          elementType: card.elementType,
          isPublic:    true,
          authorId:    admin.id,
          layers:      card.layers,
          states:      card.states,
          canvasWidth: card.canvasWidth,
          canvasHeight: card.canvasHeight,
          tags:        ["card", "service", "layered"],
        },
      });
      console.log(`Created: ${card.name} (${created.id})`);
    }
  }

  console.log("\nDone! 3 Volt card designs seeded.");
  console.log("Open Volt Designer to inspect them, then place them in the Flexible Designer.");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
