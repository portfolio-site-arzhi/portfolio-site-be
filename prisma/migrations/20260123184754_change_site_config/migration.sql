/*
  Warnings:

  - A unique constraint covering the columns `[type,locale]` on the table `site_configurations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "site_configurations_type_key";

-- AlterTable
ALTER TABLE "site_configurations" ADD COLUMN     "locale" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "site_configurations_type_locale_key" ON "site_configurations"("type", "locale");
