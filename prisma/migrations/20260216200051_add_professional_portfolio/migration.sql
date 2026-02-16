-- CreateEnum
CREATE TYPE "PortfolioType" AS ENUM ('EXPERIENCE', 'CERTIFICATE', 'PROJECT');

-- CreateTable
CREATE TABLE "professional_portfolio" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "PortfolioType" NOT NULL DEFAULT 'PROJECT',
    "description" TEXT,
    "organization" TEXT,
    "link" TEXT,
    "attachmentUrl" TEXT,
    "tags" TEXT[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_portfolio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "professional_portfolio" ADD CONSTRAINT "professional_portfolio_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
