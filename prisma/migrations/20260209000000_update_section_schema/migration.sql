-- Update SectionType enum to new values
-- First, create the new enum type
CREATE TYPE "SectionType_new" AS ENUM ('HERO', 'NORMAL', 'CTA', 'FOOTER');

-- Convert existing data and update column type
-- Since we're resetting the database, we can safely alter
ALTER TABLE "sections" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "sections" ALTER COLUMN "type" TYPE "SectionType_new" USING (
  CASE
    WHEN "type"::text = 'HERO_CAROUSEL' THEN 'HERO'::text
    WHEN "type"::text IN ('TEXT_IMAGE', 'STATS_GRID', 'CARD_GRID', 'BANNER', 'TABLE', 'CUSTOM') THEN 'NORMAL'::text
    ELSE 'NORMAL'::text
  END::"SectionType_new"
);

-- Drop the old enum and rename the new one
DROP TYPE "SectionType";
ALTER TYPE "SectionType_new" RENAME TO "SectionType";

-- Add displayName column
ALTER TABLE "sections" ADD COLUMN "displayName" TEXT;

-- Add paddingTop and paddingBottom columns with defaults
ALTER TABLE "sections" ADD COLUMN "paddingTop" INTEGER NOT NULL DEFAULT 80;
ALTER TABLE "sections" ADD COLUMN "paddingBottom" INTEGER NOT NULL DEFAULT 80;

-- Add banner column
ALTER TABLE "sections" ADD COLUMN "banner" JSONB;

-- Change order from INTEGER to DOUBLE PRECISION (Float)
ALTER TABLE "sections" ALTER COLUMN "order" TYPE DOUBLE PRECISION;
ALTER TABLE "sections" ALTER COLUMN "order" SET DEFAULT 0;

-- Set default for background if NULL
ALTER TABLE "sections" ALTER COLUMN "background" SET DEFAULT 'white';
UPDATE "sections" SET "background" = 'white' WHERE "background" IS NULL;
ALTER TABLE "sections" ALTER COLUMN "background" SET NOT NULL;

-- Rename config to content and set default
ALTER TABLE "sections" RENAME COLUMN "config" TO "content";
ALTER TABLE "sections" ALTER COLUMN "content" SET DEFAULT '{}';
UPDATE "sections" SET "content" = '{}' WHERE "content" IS NULL;
ALTER TABLE "sections" ALTER COLUMN "content" SET NOT NULL;

-- Rename configDraft to contentDraft
ALTER TABLE "sections" RENAME COLUMN "configDraft" TO "contentDraft";

-- Drop isCustom column
ALTER TABLE "sections" DROP COLUMN "isCustom";

-- Drop spacing column
ALTER TABLE "sections" DROP COLUMN "spacing";
