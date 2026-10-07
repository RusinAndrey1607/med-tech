/*
  Warnings:

  - Added the required column `address` to the `Clinic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN "address" TEXT;

UPDATE "Clinic"
SET "address" = 'Не указан'
WHERE "address" IS NULL;

ALTER TABLE "Clinic"
ALTER COLUMN "address" SET NOT NULL;