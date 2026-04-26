-- AlterTable
ALTER TABLE "portfolios" RENAME COLUMN "image_url" TO "image";
ALTER TABLE "portfolios" ALTER COLUMN "image" DROP NOT NULL;
