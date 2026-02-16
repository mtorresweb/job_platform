-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('PER_JOB', 'PER_HOUR');

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "priceType" "PriceType" NOT NULL DEFAULT 'PER_JOB';
