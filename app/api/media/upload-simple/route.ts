import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import sharp from "sharp";

/**
 * Simple Media Upload API (No Database)
 *
 * Handles image/video uploads with automatic optimization
 * Saves to public/images/uploads/
 */

const UPLOAD_DIR = join(process.cwd(), "public", "images", "uploads");
const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1080;
const WEBP_QUALITY = 85;
const JPEG_QUALITY = 85;

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isVideo && !isPdf) {
      return NextResponse.json(
        { error: "Only images, videos, and PDFs allowed" },
        { status: 400 }
      );
    }

    await ensureUploadDir();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const baseName = sanitized.split(".")[0];

    if (isImage) {
      // Optimize image with Sharp
      const webpFilename = `${baseName}-${timestamp}.webp`;
      const webpPath = join(UPLOAD_DIR, webpFilename);

      await sharp(buffer)
        .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_QUALITY })
        .toFile(webpPath);

      // JPEG fallback
      const jpegFilename = `${baseName}-${timestamp}.jpg`;
      const jpegPath = join(UPLOAD_DIR, jpegFilename);

      await sharp(buffer)
        .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(jpegPath);

      return NextResponse.json({
        success: true,
        url: `/images/uploads/${webpFilename}`,
        fallbackUrl: `/images/uploads/${jpegFilename}`,
        type: "image",
      });
    } else if (isPdf) {
      // Save PDF as-is
      const pdfFilename = `${baseName}-${timestamp}.pdf`;
      const pdfPath = join(UPLOAD_DIR, pdfFilename);

      await writeFile(pdfPath, buffer);

      return NextResponse.json({
        success: true,
        url: `/images/uploads/${pdfFilename}`,
        type: "pdf",
      });
    } else {
      // Save video as-is
      const ext = file.name.split(".").pop();
      const videoFilename = `${baseName}-${timestamp}.${ext}`;
      const videoPath = join(UPLOAD_DIR, videoFilename);

      await writeFile(videoPath, buffer);

      return NextResponse.json({
        success: true,
        url: `/images/uploads/${videoFilename}`,
        type: "video",
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
