/*
  Warnings:

  - Added the required column `neighborhood` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "details" TEXT,
ADD COLUMN     "neighborhood" TEXT NOT NULL,
ALTER COLUMN "city" SET DEFAULT 'Ibagué';
