-- Add profileViewCount column to professionals
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "profileViewCount" INTEGER NOT NULL DEFAULT 0;
