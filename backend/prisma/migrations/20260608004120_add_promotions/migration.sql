/*
  Warnings:

  - You are about to drop the `banners` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "banners";

-- CreateTable
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ctaText" TEXT NOT NULL DEFAULT 'Ver más',
    "ctaLink" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);
