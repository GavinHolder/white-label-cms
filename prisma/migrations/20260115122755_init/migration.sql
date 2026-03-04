-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'PUBLISHER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('LANDING', 'TAB_PAGE', 'FULL_PAGE');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('HERO_CAROUSEL', 'TEXT_IMAGE', 'STATS_GRID', 'CARD_GRID', 'BANNER', 'TABLE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ElementType" AS ENUM ('TEXT', 'HEADING', 'PARAGRAPH', 'IMAGE', 'VIDEO', 'ICON', 'BUTTON', 'LINK', 'CONTAINER', 'ROW', 'COLUMN', 'SPACER', 'DIVIDER', 'HTML');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PageType" NOT NULL DEFAULT 'LANDING',
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "config" JSONB,
    "configDraft" JSONB,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "spacing" JSONB,
    "background" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_elements" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "parentId" TEXT,
    "type" "ElementType" NOT NULL,
    "order" INTEGER NOT NULL,
    "content" JSONB,
    "position" JSONB,
    "spacing" JSONB NOT NULL,
    "styles" JSONB,
    "responsiveStyles" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "altText" TEXT,
    "caption" TEXT,
    "tags" TEXT[],
    "uploadedBy" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_versions" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "section_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_slug_idx" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_status_idx" ON "pages"("status");

-- CreateIndex
CREATE INDEX "sections_pageId_order_idx" ON "sections"("pageId", "order");

-- CreateIndex
CREATE INDEX "sections_enabled_idx" ON "sections"("enabled");

-- CreateIndex
CREATE INDEX "custom_elements_sectionId_order_idx" ON "custom_elements"("sectionId", "order");

-- CreateIndex
CREATE INDEX "custom_elements_parentId_idx" ON "custom_elements"("parentId");

-- CreateIndex
CREATE INDEX "media_assets_mimeType_idx" ON "media_assets"("mimeType");

-- CreateIndex
CREATE INDEX "media_assets_tags_idx" ON "media_assets"("tags");

-- CreateIndex
CREATE INDEX "section_versions_sectionId_idx" ON "section_versions"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "section_versions_sectionId_version_key" ON "section_versions"("sectionId", "version");

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_elements" ADD CONSTRAINT "custom_elements_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_elements" ADD CONSTRAINT "custom_elements_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "custom_elements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_versions" ADD CONSTRAINT "section_versions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
