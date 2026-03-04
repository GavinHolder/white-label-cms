/**
 * Import Existing Uploads to Database
 *
 * This script scans the public/uploads folder and adds all images
 * to the database so they appear in the Browse Media window.
 *
 * Usage: npx tsx scripts/import-uploads.ts
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UPLOAD_DIR = './public/uploads';
const MEDIA_URL = process.env.MEDIA_URL || 'http://localhost:3000/uploads';

// Get the admin user ID (first user in database)
async function getAdminUserId(): Promise<string> {
  const user = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (!user) {
    throw new Error('No admin user found. Please create an admin user first.');
  }

  return user.id;
}

// Get mime type from extension
function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

async function importUploads() {
  try {
    console.log('🔍 Scanning uploads folder...');

    // Get admin user
    const adminUserId = await getAdminUserId();
    console.log(`✅ Using admin user ID: ${adminUserId}`);

    // Read uploads directory
    const files = readdirSync(UPLOAD_DIR);
    const imageFiles = files.filter(f => {
      const mime = getMimeType(f);
      return mime.startsWith('image/') && !f.startsWith('thumb-');
    });

    console.log(`📁 Found ${imageFiles.length} image files to import`);

    let imported = 0;
    let skipped = 0;

    for (const filename of imageFiles) {
      try {
        // Check if already in database
        const existing = await prisma.mediaAsset.findFirst({
          where: { filename },
        });

        if (existing) {
          console.log(`⏭️  Skipped ${filename} (already in database)`);
          skipped++;
          continue;
        }

        // Get file info
        const filePath = join(UPLOAD_DIR, filename);
        const stats = statSync(filePath);
        const mimeType = getMimeType(filename);

        let width: number | null = null;
        let height: number | null = null;

        // Get image dimensions
        if (mimeType.startsWith('image/')) {
          try {
            const metadata = await sharp(filePath).metadata();
            width = metadata.width || null;
            height = metadata.height || null;
          } catch (error) {
            console.warn(`⚠️  Could not read dimensions for ${filename}`);
          }
        }

        // Add to database
        await prisma.mediaAsset.create({
          data: {
            filename,
            originalName: filename,
            mimeType,
            fileSize: stats.size,
            width,
            height,
            url: `${MEDIA_URL}/${filename}`,
            thumbnailUrl: null,
            uploadedBy: adminUserId,
          },
        });

        console.log(`✅ Imported ${filename} (${width}x${height}, ${(stats.size / 1024).toFixed(0)}KB)`);
        imported++;
      } catch (error) {
        console.error(`❌ Error importing ${filename}:`, error);
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Imported: ${imported}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📁 Total: ${imageFiles.length}`);

    if (imported > 0) {
      console.log('\n✨ Success! Uploaded files will now appear in Browse Media window.');
    }

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run import
importUploads();
