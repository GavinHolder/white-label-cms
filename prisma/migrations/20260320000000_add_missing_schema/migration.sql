-- Migration: Add all schema additions since 20260303
-- Covers: site_config, client_features, volt_elements, volt_assets,
--         api_keys, volt_3d_assets, volt_3d_versions, coverage_maps,
--         coverage_regions, coverage_labels, projects, form_submissions,
--         missing columns on pages + sections, new enum values.

-- ─── Enum additions ────────────────────────────────────────────────────────────
ALTER TYPE "PageType" ADD VALUE IF NOT EXISTS 'FORM';
ALTER TYPE "PageType" ADD VALUE IF NOT EXISTS 'PDF';
ALTER TYPE "PageType" ADD VALUE IF NOT EXISTS 'DESIGNER';
ALTER TYPE "SectionType" ADD VALUE IF NOT EXISTS 'FLEXIBLE';

-- ─── pages: missing columns ────────────────────────────────────────────────────
ALTER TABLE "pages"
  ADD COLUMN IF NOT EXISTS "enabled"        BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "metaTitle"      TEXT,
  ADD COLUMN IF NOT EXISTS "metaKeywords"   TEXT,
  ADD COLUMN IF NOT EXISTS "ogTitle"        TEXT,
  ADD COLUMN IF NOT EXISTS "ogDescription"  TEXT,
  ADD COLUMN IF NOT EXISTS "canonicalUrl"   TEXT,
  ADD COLUMN IF NOT EXISTS "noindex"        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "nofollow"       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "formConfig"     JSONB,
  ADD COLUMN IF NOT EXISTS "showOnNavbar"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "navOrder"       INTEGER;

CREATE INDEX IF NOT EXISTS "pages_type_idx" ON "pages"("type");

-- ─── sections: missing columns ────────────────────────────────────────────────
ALTER TABLE "sections"
  ADD COLUMN IF NOT EXISTS "lowerThird"         JSONB,
  ADD COLUMN IF NOT EXISTS "motionElements"      JSONB,
  ADD COLUMN IF NOT EXISTS "voltElementId"       TEXT,
  ADD COLUMN IF NOT EXISTS "voltSlotMap"         JSONB,
  ADD COLUMN IF NOT EXISTS "showOnNavbar"        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "navOrder"            INTEGER,
  ADD COLUMN IF NOT EXISTS "paddingTopMobile"    INTEGER,
  ADD COLUMN IF NOT EXISTS "paddingBottomMobile" INTEGER;

-- ─── form_submissions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "form_submissions" (
  "id"        TEXT         NOT NULL,
  "pageId"    TEXT         NOT NULL,
  "pageSlug"  TEXT         NOT NULL,
  "data"      JSONB        NOT NULL,
  "userEmail" TEXT         NOT NULL DEFAULT '',
  "status"    TEXT         NOT NULL DEFAULT 'received',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "form_submissions_pageId_fkey"
    FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "form_submissions_pageId_idx"    ON "form_submissions"("pageId");
CREATE INDEX IF NOT EXISTS "form_submissions_createdAt_idx" ON "form_submissions"("createdAt");

-- ─── site_config ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "site_config" (
  "id"             TEXT         NOT NULL DEFAULT 'singleton',
  "companyName"    TEXT         NOT NULL DEFAULT 'Your Company',
  "tagline"        TEXT         NOT NULL DEFAULT '',
  "logoUrl"        TEXT         NOT NULL DEFAULT '',
  "faviconUrl"     TEXT         NOT NULL DEFAULT '',
  "phone"          TEXT         NOT NULL DEFAULT '',
  "email"          TEXT         NOT NULL DEFAULT '',
  "address"        TEXT         NOT NULL DEFAULT '',
  "city"           TEXT         NOT NULL DEFAULT '',
  "postalCode"     TEXT         NOT NULL DEFAULT '',
  "country"        TEXT         NOT NULL DEFAULT '',
  "facebook"       TEXT         NOT NULL DEFAULT '',
  "instagram"      TEXT         NOT NULL DEFAULT '',
  "twitter"        TEXT         NOT NULL DEFAULT '',
  "linkedin"       TEXT         NOT NULL DEFAULT '',
  "youtube"        TEXT         NOT NULL DEFAULT '',
  "tiktok"         TEXT         NOT NULL DEFAULT '',
  "navbarStyle"    TEXT         NOT NULL DEFAULT 'standard',
  "copyrightText"  TEXT         NOT NULL DEFAULT '',
  "showRegulatory" BOOLEAN      NOT NULL DEFAULT false,
  "updatedAt"      TIMESTAMP(3) NOT NULL,
  CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- Insert singleton row if not present
INSERT INTO "site_config" ("id", "updatedAt")
VALUES ('singleton', NOW())
ON CONFLICT ("id") DO NOTHING;

-- ─── client_features ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "client_features" (
  "id"        TEXT         NOT NULL,
  "slug"      TEXT         NOT NULL,
  "name"      TEXT         NOT NULL,
  "enabled"   BOOLEAN      NOT NULL DEFAULT false,
  "config"    JSONB        NOT NULL DEFAULT '{}',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "client_features_pkey"  PRIMARY KEY ("id"),
  CONSTRAINT "client_features_slug_key" UNIQUE ("slug")
);

-- ─── volt_elements ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "volt_elements" (
  "id"           TEXT         NOT NULL,
  "name"         TEXT         NOT NULL,
  "description"  TEXT,
  "mood"         TEXT,
  "elementType"  TEXT         NOT NULL DEFAULT 'custom',
  "isPublic"     BOOLEAN      NOT NULL DEFAULT false,
  "authorId"     TEXT         NOT NULL,
  "layers"       JSONB        NOT NULL DEFAULT '[]',
  "slots"        JSONB        NOT NULL DEFAULT '[]',
  "states"       JSONB        NOT NULL DEFAULT '[]',
  "flipCard"     JSONB,
  "canvasWidth"  INTEGER      NOT NULL DEFAULT 800,
  "canvasHeight" INTEGER      NOT NULL DEFAULT 500,
  "has3D"        BOOLEAN      NOT NULL DEFAULT false,
  "thumbnail"    TEXT,
  "tags"         TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
  "isPaid"       BOOLEAN      NOT NULL DEFAULT false,
  "price"        DOUBLE PRECISION,
  "downloads"    INTEGER      NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "volt_elements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "volt_elements_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "users"("id") ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS "volt_elements_authorId_idx"  ON "volt_elements"("authorId");
CREATE INDEX IF NOT EXISTS "volt_elements_isPublic_idx"  ON "volt_elements"("isPublic");

-- sections → volt_elements FK (only after volt_elements exists)
ALTER TABLE "sections"
  ADD CONSTRAINT "sections_voltElementId_fkey"
    FOREIGN KEY ("voltElementId") REFERENCES "volt_elements"("id")
    ON UPDATE CASCADE ON DELETE SET NULL
  DEFERRABLE INITIALLY DEFERRED;

-- ─── volt_assets ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "volt_assets" (
  "id"        TEXT         NOT NULL,
  "voltId"    TEXT         NOT NULL,
  "type"      TEXT         NOT NULL,
  "filename"  TEXT         NOT NULL,
  "url"       TEXT         NOT NULL,
  "fileSize"  INTEGER      NOT NULL,
  "metadata"  JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "volt_assets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "volt_assets_voltId_fkey"
    FOREIGN KEY ("voltId") REFERENCES "volt_elements"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "volt_assets_voltId_idx" ON "volt_assets"("voltId");

-- ─── api_keys ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "api_keys" (
  "id"         TEXT         NOT NULL,
  "keyHash"    TEXT         NOT NULL,
  "keyPrefix"  TEXT         NOT NULL,
  "label"      TEXT         NOT NULL,
  "userId"     TEXT         NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3),
  CONSTRAINT "api_keys_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "api_keys_keyHash_key" UNIQUE ("keyHash"),
  CONSTRAINT "api_keys_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "api_keys_userId_idx" ON "api_keys"("userId");

-- ─── volt_3d_assets ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "volt_3d_assets" (
  "id"              TEXT         NOT NULL,
  "name"            TEXT         NOT NULL,
  "authorId"        TEXT         NOT NULL,
  "activeVersionId" TEXT,
  "triggerConfig"   JSONB,
  "thumbnail"       TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "volt_3d_assets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "volt_3d_assets_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "users"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "volt_3d_assets_authorId_idx" ON "volt_3d_assets"("authorId");

-- ─── volt_3d_versions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "volt_3d_versions" (
  "id"          TEXT         NOT NULL,
  "assetId"     TEXT         NOT NULL,
  "versionNum"  INTEGER      NOT NULL,
  "glbPath"     TEXT         NOT NULL,
  "blendPath"   TEXT,
  "animClips"   JSONB        NOT NULL,
  "isConfirmed" BOOLEAN      NOT NULL DEFAULT false,
  "syncedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "volt_3d_versions_pkey"                    PRIMARY KEY ("id"),
  CONSTRAINT "volt_3d_versions_assetId_versionNum_key"  UNIQUE ("assetId", "versionNum"),
  CONSTRAINT "volt_3d_versions_assetId_fkey"
    FOREIGN KEY ("assetId") REFERENCES "volt_3d_assets"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "volt_3d_versions_assetId_idx" ON "volt_3d_versions"("assetId");

-- ─── coverage_maps ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "coverage_maps" (
  "id"          TEXT             NOT NULL,
  "name"        TEXT             NOT NULL,
  "slug"        TEXT             NOT NULL,
  "description" TEXT,
  "centerLat"   DOUBLE PRECISION NOT NULL DEFAULT -34.4187,
  "centerLng"   DOUBLE PRECISION NOT NULL DEFAULT 19.2345,
  "defaultZoom" INTEGER          NOT NULL DEFAULT 10,
  "isActive"    BOOLEAN          NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3)     NOT NULL,
  CONSTRAINT "coverage_maps_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "coverage_maps_slug_key" UNIQUE ("slug")
);

-- ─── coverage_regions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "coverage_regions" (
  "id"          TEXT             NOT NULL,
  "mapId"       TEXT             NOT NULL,
  "name"        TEXT             NOT NULL,
  "polygon"     JSONB            NOT NULL DEFAULT '[]',
  "color"       TEXT             NOT NULL DEFAULT '#22c55e',
  "opacity"     DOUBLE PRECISION NOT NULL DEFAULT 0.4,
  "strokeColor" TEXT             NOT NULL DEFAULT '#16a34a',
  "strokeWidth" INTEGER          NOT NULL DEFAULT 2,
  "description" TEXT,
  "isActive"    BOOLEAN          NOT NULL DEFAULT true,
  "order"       INTEGER          NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3)     NOT NULL,
  CONSTRAINT "coverage_regions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "coverage_regions_mapId_fkey"
    FOREIGN KEY ("mapId") REFERENCES "coverage_maps"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "coverage_regions_mapId_idx" ON "coverage_regions"("mapId");

-- ─── coverage_labels ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "coverage_labels" (
  "id"         TEXT             NOT NULL,
  "mapId"      TEXT             NOT NULL,
  "text"       TEXT             NOT NULL,
  "lat"        DOUBLE PRECISION NOT NULL,
  "lng"        DOUBLE PRECISION NOT NULL,
  "fontSize"   INTEGER          NOT NULL DEFAULT 14,
  "fontFamily" TEXT             NOT NULL DEFAULT 'Arial',
  "color"      TEXT             NOT NULL DEFAULT '#ffffff',
  "bgColor"    TEXT,
  "bold"       BOOLEAN          NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3)     NOT NULL,
  CONSTRAINT "coverage_labels_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "coverage_labels_mapId_fkey"
    FOREIGN KEY ("mapId") REFERENCES "coverage_maps"("id") ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "coverage_labels_mapId_idx" ON "coverage_labels"("mapId");

-- ─── projects ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "projects" (
  "id"             TEXT         NOT NULL,
  "title"          TEXT         NOT NULL,
  "location"       TEXT,
  "description"    TEXT,
  "coverImageUrl"  TEXT,
  "images"         JSONB        NOT NULL DEFAULT '[]',
  "completedDate"  TEXT,
  "isActive"       BOOLEAN      NOT NULL DEFAULT true,
  "order"          INTEGER      NOT NULL DEFAULT 0,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "projects_isActive_idx" ON "projects"("isActive");
