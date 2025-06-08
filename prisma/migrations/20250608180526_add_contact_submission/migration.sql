/*
  Warnings:

  - You are about to drop the column `hourlyRate` on the `professionals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "totalPrice" SET DEFAULT 0.0;

-- AlterTable
ALTER TABLE "professionals" DROP COLUMN "hourlyRate";

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "price" SET DEFAULT 0.0;

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" TEXT,
    "metadata" JSONB,
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
