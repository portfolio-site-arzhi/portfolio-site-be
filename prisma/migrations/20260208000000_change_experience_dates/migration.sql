ALTER TABLE "experiences" ADD COLUMN "start_date" DATE;
ALTER TABLE "experiences" ADD COLUMN "end_date" DATE;

UPDATE "experiences"
SET "start_date" = make_date("year_start", 1, 1)
WHERE "year_start" IS NOT NULL;

UPDATE "experiences"
SET "end_date" = make_date("year_end", 1, 1)
WHERE "year_end" IS NOT NULL;

ALTER TABLE "experiences" DROP COLUMN "year_start";
ALTER TABLE "experiences" DROP COLUMN "year_end";
