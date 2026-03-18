// @ts-nocheck
/**
 * seed-scroll-story-demo — Creates a "Scroll Story" demo FLEXIBLE section on the home page.
 *
 * The section:
 *   • Uses contentMode: "multi" + multiLimit: 5  →  section is 500vh tall
 *   • Contains ONE scroll-story block that spans all rows
 *   • Three.js GLB model (NASA Astronaut) rotates as user scrolls
 *   • 3 text overlays fade in/out at different scroll progress thresholds
 *   • Progress sidebar indicator on the right edge
 *
 * Run: npx tsx scripts/seed-scroll-story-demo.ts
 */

import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()
function j(o: object): Prisma.InputJsonValue { return o as Prisma.InputJsonValue }

async function main() {
  const homePageId = '1d6673e2-a315-41a7-8806-16fe116f0d25'
  const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } })
  if (!admin) throw new Error('No admin user found')

  // Find the footer to determine safe insertion order
  const footer = await prisma.section.findFirst({
    where: { type: 'FOOTER', pageId: homePageId },
    orderBy: { order: 'desc' },
  })
  if (!footer) throw new Error('Footer not found on home page')

  // Check if a scroll story section already exists — update instead of duplicate
  const existing = await prisma.section.findFirst({
    where: { displayName: { contains: 'Scroll Story' }, pageId: homePageId },
  })

  // Place it just before the footer
  const targetOrder = footer.order - 0.5

  const sectionData = {
    displayName: 'Scroll Story Demo',
    type: 'FLEXIBLE' as const,
    page:          { connect: { id: homePageId } },
    createdByUser: { connect: { id: admin.id } },
    order: existing ? existing.order : targetOrder,
    background: '#060612',
    content: j({
      // These tell FlexibleSectionRenderer the section can grow beyond 100vh
      contentMode: 'multi',
      designerData: {
        contentMode: 'multi',
        multiLimit: 5,           // 500vh total height
        layoutType: 'grid',
        grid: {
          cols: 1,
          rows: 1,
          gap: 0,
          rowHeights: ['1fr'],   // single row that fills the 500vh
        },
        blocks: [
          {
            id: 1,
            type: 'scroll-story',
            position: { row: 1, col: 1, colSpan: 1, rowSpan: 1 },
            props: {
              // GLB model — NASA Astronaut (public, CORS-safe)
              modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
              modelScale: 1.1,
              bgColor: '#060612',
              accentColor: '#818cf8',
              showProgress: true,

              // Keyframes: rotateY + camera pull-in as you scroll
              keyframes: [
                { progress: 0,    rotateY: 0,   rotateX: 0,   cameraZ: 6.0 },
                { progress: 0.25, rotateY: 90,  rotateX: 5,   cameraZ: 4.8 },
                { progress: 0.5,  rotateY: 180, rotateX: -5,  cameraZ: 3.8 },
                { progress: 0.75, rotateY: 270, rotateX: 5,   cameraZ: 4.5 },
                { progress: 1,    rotateY: 360, rotateX: 0,   cameraZ: 5.5 },
              ],

              // Text overlays — each appears in a different phase of the scroll
              textOverlays: [
                {
                  subtext: 'CHAPTER 01',
                  text: 'Born to Explore',
                  entryProgress: 0.02,
                  exitProgress: 0.22,
                  position: 'left',
                  color: '#818cf8',
                },
                {
                  subtext: 'CHAPTER 02',
                  text: 'Designed for\nZero Gravity',
                  entryProgress: 0.28,
                  exitProgress: 0.48,
                  position: 'right',
                  color: '#34d399',
                },
                {
                  subtext: 'CHAPTER 03',
                  text: 'Every Mission\nBegins Here',
                  entryProgress: 0.55,
                  exitProgress: 0.75,
                  position: 'left',
                  color: '#f472b6',
                },
                {
                  subtext: 'FINAL',
                  text: 'The Journey\nNever Ends',
                  entryProgress: 0.82,
                  exitProgress: 0.99,
                  position: 'center',
                  color: '#fbbf24',
                },
              ],
            },
          },
        ],
      },
    }),
  }

  if (existing) {
    await prisma.section.update({ where: { id: existing.id }, data: sectionData })
    console.log(`✅  Updated existing Scroll Story section (${existing.id})`)
  } else {
    const created = await prisma.section.create({ data: sectionData })
    // Fix ordering: ensure footer stays last
    await prisma.section.update({
      where: { id: footer.id },
      data: { order: footer.order }, // keep footer order
    })
    console.log(`✅  Created Scroll Story section (${created.id}) at order ${targetOrder}`)
  }

  console.log(`\n🔗  Live: http://localhost:3000`)
  console.log(`    Scroll down to the "Scroll Story Demo" section (second-to-last before footer).`)
  console.log(`    The section is 500vh tall — the astronaut rotates 360° as you scroll through it.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
