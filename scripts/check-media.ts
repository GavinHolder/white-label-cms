import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMedia() {
  const media = await prisma.mediaAsset.findMany();
  console.log(`Found ${media.length} media records in database`);

  if (media.length === 0) {
    console.log('❌ No media records found!');
  } else {
    media.forEach(m => {
      console.log(`- ${m.filename}`);
      console.log(`  URL: ${m.url}`);
      console.log(`  Created: ${m.createdAt}`);
    });
  }

  await prisma.$disconnect();
}

checkMedia();
