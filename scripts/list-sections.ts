import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sections = await prisma.section.findMany({
    orderBy: { order: 'asc' }
  });

  console.log('Total sections:', sections.length);
  console.log('\nSections by type:');
  const byType = sections.reduce((acc: Record<string, number>, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify(byType, null, 2));

  console.log('\nAll sections:');
  sections.forEach((s, i) => {
    console.log(`${i + 1}. [${s.type}] ${s.displayName || 'Untitled'} (order: ${s.order})`);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
