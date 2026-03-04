import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find the landing page
  const page = await prisma.page.findUnique({
    where: { slug: '/' }
  });

  if (!page) {
    console.log('Landing page not found!');
    return;
  }

  // Get all sections for landing page
  const sections = await prisma.section.findMany({
    where: { pageId: page.id },
    orderBy: { order: 'asc' }
  });

  console.log(`\n📄 Landing Page Sections (${sections.length} total):\n`);

  sections.forEach((section, index) => {
    console.log(`${index + 1}. ${section.displayName || 'Untitled'}`);
    console.log(`   ID: ${section.id}`);
    console.log(`   Type: ${section.type}`);
    console.log(`   Order: ${section.order}`);
    console.log(`   Enabled: ${section.enabled ? '✅' : '❌'}`);
    console.log(`   Triangle Enabled: ${section.triangleEnabled ? '✅' : '❌'}`);
    if (section.triangleEnabled) {
      console.log(`   Triangle Side: ${section.triangleSide}`);
      console.log(`   Triangle Shape: ${section.triangleShape}`);
      console.log(`   Triangle Height: ${section.triangleHeight}px`);
      console.log(`   Hover Text: ${section.hoverTextEnabled ? `"${section.hoverText}"` : 'No'}`);
    }
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
