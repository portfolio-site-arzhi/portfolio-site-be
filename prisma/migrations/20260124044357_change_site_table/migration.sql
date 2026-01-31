/*
  Warnings:

  - A unique constraint covering the columns `[type,locale,key]` on the table `site_configurations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `site_configurations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "site_configurations" ADD COLUMN     "key" TEXT NOT NULL,
ALTER COLUMN "value" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "site_configurations_type_locale_key_key" ON "site_configurations"("type", "locale", "key");
