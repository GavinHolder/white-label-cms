/**
 * Enable test triangle on About Us section to finalize migration
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update the "About Us - Centered" section with triangle configuration
  const updated = await prisma.section.update({
    where: {
      id: '68d25c50-6335-4d3f-a715-191acb8c69ce',
    },
    data: {
      triangleEnabled: true,
      triangleSide: 'bottom',
      triangleShape: 'modern',
      triangleHeight: 150,
      triangleTargetId: null,
      triangleGradientType: 'linear',
      triangleColor1: '#4ecdc4',
      triangleColor2: '#6a82fb',
      triangleAlpha1: 100,
      triangleAlpha2: 100,
      triangleAngle: 45,
      triangleImageUrl: null,
      triangleImageSize: 'cover',
      triangleImagePos: 'center',
      triangleImageOpacity: 100,
      hoverTextEnabled: true,
      hoverText: 'Scroll for more',
      hoverTextStyle: 1,
      hoverFontSize: 18,
      hoverFontFamily: 'Arial',
      hoverAnimationType: 'slide',
      hoverAnimateBehind: true,
      hoverAlwaysShow: false,
      hoverOffsetX: 0,
      bgImageUrl: null,
      bgImageSize: 'cover',
      bgImagePosition: 'center',
      bgImageRepeat: 'no-repeat',
      bgImageOpacity: 100,
      bgParallax: false,
    },
  });

  console.log('✅ Triangle enabled on About Us section:');
  console.log('   - Section ID:', updated.id);
  console.log('   - Triangle Side:', updated.triangleSide);
  console.log('   - Triangle Shape:', updated.triangleShape);
  console.log('   - Triangle Height:', updated.triangleHeight);
  console.log('   - Gradient:', `${updated.triangleColor1} → ${updated.triangleColor2}`);
  console.log('   - Hover Text:', updated.hoverText);
  console.log('\n✅ Migration finalized! View at http://localhost:3000');
}

main()
  .catch((e) => {
    console.error('Error enabling triangle:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
