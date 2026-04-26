-- AlterTable
ALTER TABLE "portfolios"
ADD COLUMN "contribution" TEXT,
ADD COLUMN "contribution_en" TEXT,
ADD COLUMN "outcome" TEXT,
ADD COLUMN "outcome_en" TEXT;

-- Migrate existing child rows into parent HTML fields
WITH contribution_data AS (
    SELECT
        "portfolio_id",
        string_agg("description", E'\n' ORDER BY "display_order" ASC, "id" DESC) AS "contribution",
        string_agg("description_en", E'\n' ORDER BY "display_order" ASC, "id" DESC)
            FILTER (WHERE "description_en" IS NOT NULL) AS "contribution_en"
    FROM "portfolio_contributions"
    GROUP BY "portfolio_id"
),
outcome_data AS (
    SELECT
        "portfolio_id",
        string_agg("description", E'\n' ORDER BY "display_order" ASC, "id" DESC) AS "outcome",
        string_agg("description_en", E'\n' ORDER BY "display_order" ASC, "id" DESC)
            FILTER (WHERE "description_en" IS NOT NULL) AS "outcome_en"
    FROM "portfolio_outcomes"
    GROUP BY "portfolio_id"
)
UPDATE "portfolios" AS "p"
SET
    "contribution" = "cd"."contribution",
    "contribution_en" = "cd"."contribution_en",
    "outcome" = "od"."outcome",
    "outcome_en" = "od"."outcome_en"
FROM "contribution_data" AS "cd"
FULL OUTER JOIN "outcome_data" AS "od"
    ON "cd"."portfolio_id" = "od"."portfolio_id"
WHERE "p"."id" = COALESCE("cd"."portfolio_id", "od"."portfolio_id");

-- DropTable
DROP TABLE "portfolio_contributions";

-- DropTable
DROP TABLE "portfolio_outcomes";
