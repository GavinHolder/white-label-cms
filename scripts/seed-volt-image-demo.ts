// @ts-nocheck
/**
 * seed-volt-image-demo — Additive (does NOT wipe DB).
 *
 * Creates a "Product Image Card" Volt element with:
 *   • Background layer            (vector, animated opacity entrance)
 *   • Top image zone              (image layer — swappable placeholder)
 *   • Accent corner shape         (vector, animated scale entrance)
 *   • Badge highlight bar         (vector, animated opacity)
 *   • Title / Body / Action slots
 *   • Hover state                 (accent shifts +translate, card lifts)
 *
 * Then adds a FLEXIBLE demo section to the home page that shows the card (×3).
 *
 * Run: npx tsx scripts/seed-volt-image-demo.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
function j(obj: object): Prisma.InputJsonValue { return obj as Prisma.InputJsonValue; }
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

function roundRectPath(x: number, y: number, w: number, h: number, r = 4): string {
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
    'Z',
  ].join(' ');
}

function circlePath(cx: number, cy: number, r: number): string {
  const k = 0.5523;
  return [
    `M${cx},${cy - r}`,
    `C${cx + r * k},${cy - r} ${cx + r},${cy - r * k} ${cx + r},${cy}`,
    `C${cx + r},${cy + r * k} ${cx + r * k},${cy + r} ${cx},${cy + r}`,
    `C${cx - r * k},${cy + r} ${cx - r},${cy + r * k} ${cx - r},${cy}`,
    `C${cx - r},${cy - r * k} ${cx - r * k},${cy - r} ${cx},${cy - r}`,
    'Z',
  ].join(' ');
}

function defaultAnim(overrides = {}) {
  return {
    character: 50, speed: 55, style: 60, delay: 0,
    animates: { opacity: false, scale: false, position: false, rotation: false, fill: false },
    ...overrides,
  };
}

function buildProductCard() {
  const bgId     = uid();
  const imgId    = uid();
  const accentId = uid();
  const dotId    = uid();
  const divId    = uid();
  const badgeId  = uid();
  const titleId  = uid();
  const bodyId   = uid();
  const actionId = uid();

  const CW = 320, CH = 420;

  // ── Layers ────────────────────────────────────────────────────────────────
  const layers = [
    // 0 — Card background (white rounded rect)
    {
      id: bgId, name: 'Card Background', type: 'vector', role: 'structure',
      x: 0, y: 0, width: 100, height: 100, rotation: 0, zIndex: 0,
      visible: true, locked: false, opacity: 1, blendMode: 'normal',
      vectorData: {
        pathData: roundRectPath(0, 0, 100, 100, 5),
        fills: [{ id: uid(), type: 'solid', color: '#ffffff', opacity: 1, blendMode: 'normal' }],
        closed: true,
      },
      animation: defaultAnim({ animates: { opacity: true, scale: false, position: false, rotation: false, fill: false } }),
    },
    // 1 — Image zone (image layer — shows a real placeholder photo)
    {
      id: imgId, name: 'Product Image', type: 'image', role: 'background',
      x: 0, y: 0, width: 100, height: 52, rotation: 0, zIndex: 1,
      visible: true, locked: false, opacity: 1, blendMode: 'normal',
      imageData: {
        url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=640&h=560&fit=crop',
        alt: 'Product showcase image',
        mode: 'fill',
        opacity: 1,
      },
      animation: defaultAnim({ animates: { opacity: true, scale: false, position: false, rotation: false, fill: false } }),
    },
    // 2 — Image overlay fade at bottom (structure)
    {
      id: divId, name: 'Image Gradient', type: 'vector', role: 'overlay',
      x: 0, y: 38, width: 100, height: 18, rotation: 0, zIndex: 2,
      visible: true, locked: false, opacity: 1, blendMode: 'normal',
      vectorData: {
        pathData: 'M0,38 H100 V56 H0 Z',
        fills: [{
          id: uid(), type: 'linear-gradient', opacity: 1, blendMode: 'normal',
          gradient: { stops: [{ color: '#ffffff', opacity: 0, position: 0 }, { color: '#ffffff', opacity: 1, position: 100 }], angle: 180 },
        }],
        closed: true,
      },
      animation: defaultAnim(),
    },
    // 3 — Corner accent circle (top-right)
    {
      id: accentId, name: 'Accent Circle', type: 'vector', role: 'accent',
      x: 72, y: -8, width: 32, height: 28, rotation: 0, zIndex: 3,
      visible: true, locked: false, opacity: 0.7, blendMode: 'normal',
      vectorData: {
        pathData: circlePath(88, 6, 16),
        fills: [{ id: uid(), type: 'solid', color: '#6366f1', opacity: 1, blendMode: 'normal' }],
        closed: true,
      },
      animation: defaultAnim({ animates: { opacity: true, scale: true, position: false, rotation: false, fill: false } }),
    },
    // 4 — Bottom dot (structural accent)
    {
      id: dotId, name: 'Bottom Dot', type: 'vector', role: 'accent',
      x: -2, y: 86, width: 14, height: 14, rotation: 0, zIndex: 3,
      visible: true, locked: false, opacity: 0.5, blendMode: 'normal',
      vectorData: {
        pathData: circlePath(5, 93, 7),
        fills: [{ id: uid(), type: 'solid', color: '#a5b4fc', opacity: 1, blendMode: 'normal' }],
        closed: true,
      },
      animation: defaultAnim({ delay: 15 }),
    },
    // 5 — Badge bar (green label)
    {
      id: badgeId, name: 'Badge', type: 'slot', role: 'content',
      x: 5, y: 56, width: 38, height: 8, rotation: 0, zIndex: 10,
      visible: true, locked: false, opacity: 1, blendMode: 'normal',
      slotData: { slotType: 'badge', slotLabel: 'Badge', contentFieldHint: 'badge', fontSize: '0.65rem', fontWeight: 700, color: '#ffffff', textAlign: 'center' },
      animation: defaultAnim({ animates: { opacity: true, scale: false, position: false, rotation: false, fill: false }, delay: 10 }),
    },
    // 6 — Title slot
    {
      id: titleId, name: 'Title', type: 'slot', role: 'content',
      x: 5, y: 67, width: 90, height: 12, rotation: 0, zIndex: 10,
      visible: true, locked: false, opacity: 1, blendMode: 'normal',
      slotData: { slotType: 'title', slotLabel: 'Title', contentFieldHint: 'title', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', textAlign: 'left' },
      animation: defaultAnim({ animates: { opacity: true, scale: false, position: true, rotation: false, fill: false }, delay: 15 }),
    },
    // 7 — Body slot
    {
      id: bodyId, name: 'Body', type: 'slot', role: 'content',
      x: 5, y: 80, width: 90, height: 10, rotation: 0, zIndex: 10,
      visible: true, locked: false, opacity: 1, blendMode: 'normal',
      slotData: { slotType: 'body', slotLabel: 'Body', contentFieldHint: 'body', fontSize: '0.78rem', fontWeight: 400, color: '#64748b', textAlign: 'left' },
      animation: defaultAnim({ animates: { opacity: true, scale: false, position: false, rotation: false, fill: false }, delay: 20 }),
    },
    // 8 — Action slot
    {
      id: actionId, name: 'Action', type: 'slot', role: 'content',
      x: 5, y: 91, width: 42, height: 7, rotation: 0, zIndex: 10,
      visible: true, locked: false, opacity: 1, blendMode: 'normal',
      slotData: { slotType: 'action', slotLabel: 'Action', contentFieldHint: 'action', fontSize: '0.8rem', color: '#ffffff', textAlign: 'center', buttonVariant: 'filled' },
      animation: defaultAnim({ animates: { opacity: true, scale: false, position: false, rotation: false, fill: false }, delay: 25 }),
    },
  ];

  // ── Hover state — card lifts, accent scales up ────────────────────────────
  const states = [
    {
      id: uid(),
      name: 'hover',
      trigger: 'mouseenter',
      layerOverrides: {
        [bgId]:     { opacity: 1 },
        [accentId]: { scale: 1.25, translateX: 4, translateY: -4, opacity: 1 },
        [dotId]:    { scale: 1.4, opacity: 0.8 },
        [imgId]:    { scale: 1.04, opacity: 1 },
      },
    },
  ];

  return { layers, states, canvasWidth: CW, canvasHeight: CH };
}

async function main() {
  console.log('🌱  Seeding product image card demo...');

  // Find or use first user as author
  const admin = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!admin) { console.error('❌  No users found. Run the main seed first.'); process.exit(1); }

  // ── Create Volt element ───────────────────────────────────────────────────
  const cardData = buildProductCard();
  const voltEl = await prisma.voltElement.create({
    data: {
      name: 'Product Image Card',
      description: 'Card with swappable image layer, animated entrance, hover lift effect. Demonstrates image layers.',
      elementType: 'product-card',
      isPublic: true,
      authorId: admin.id,
      layers: j(cardData.layers),
      states: j(cardData.states),
      canvasWidth: cardData.canvasWidth,
      canvasHeight: cardData.canvasHeight,
      tags: ['card', 'product', 'image', 'hover', 'demo'],
    },
  });
  console.log(`✅  Volt element created: ${voltEl.id} — "${voltEl.name}"`);

  // ── Find or create home page ──────────────────────────────────────────────
  let page = await prisma.page.findFirst({ where: { slug: '/' } });
  if (!page) {
    page = await prisma.page.create({
      data: {
        slug: '/', title: 'Home', type: 'LANDING', status: 'PUBLISHED',
        createdBy: admin.id, publishedAt: new Date(),
      },
    });
    console.log('📄  Created home page');
  }

  // ── Find largest order value in existing sections ─────────────────────────
  const lastSection = await prisma.section.findFirst({
    where: { pageId: page.id },
    orderBy: { order: 'desc' },
  });
  const nextOrder = (lastSection?.order ?? 0) + 1;

  // ── Create FLEXIBLE section with 3 product cards ──────────────────────────
  const section = await prisma.section.create({
    data: {
      pageId: page.id,
      type: 'FLEXIBLE',
      displayName: 'Product Showcase',
      order: nextOrder,
      enabled: true,
      createdBy: admin.id,
      background: '#f8fafc',
      paddingTop: 80, paddingBottom: 80,
      content: j({
        designerData: {
          layoutType: 'grid',
          grid: { cols: 3, rows: 2, gap: 24 },
          blocks: [
            {
              id: 1, type: 'text',
              position: { row: 1, col: 1, colSpan: 3 },
              props: { textAlign: 'center', paddingTop: 20, paddingBottom: 8 },
              subElements: [
                { type: 'heading', props: { text: 'PRODUCT SHOWCASE', fontSize: 11, fontWeight: '700', color: '#6366f1', letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 } },
                { type: 'heading', props: { text: 'Image layers + hover animations in Volt Studio', fontSize: 32, fontWeight: '800', color: '#1e293b', lineHeight: 1.2, textAlign: 'center' } },
              ],
            },
            {
              id: 2, type: 'volt',
              position: { row: 2, col: 1 },
              props: {
                voltId: voltEl.id,
                slots: { title: 'Product One', body: 'High quality product with excellent features.', actionLabel: 'Learn More', actionHref: '#', badge: 'NEW' },
              },
            },
            {
              id: 3, type: 'volt',
              position: { row: 2, col: 2 },
              props: {
                voltId: voltEl.id,
                slots: { title: 'Product Two', body: 'Designed for performance and reliability.', actionLabel: 'View Details', actionHref: '#', badge: 'POPULAR' },
              },
            },
            {
              id: 4, type: 'volt',
              position: { row: 2, col: 3 },
              props: {
                voltId: voltEl.id,
                slots: { title: 'Product Three', body: 'The best solution for your workflow.', actionLabel: 'Get Started', actionHref: '#', badge: 'PRO' },
              },
            },
          ],
        },
      }),
    },
  });

  console.log(`✅  Section created (order ${nextOrder}): ${section.id}`);
  console.log('');
  console.log('🎉  Done! Open http://localhost:3000 and scroll to the "Product Showcase" section.');
  console.log(`🔗  Edit card in designer: http://localhost:3000/admin/volt/designer?id=${voltEl.id}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
