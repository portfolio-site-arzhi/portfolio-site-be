-- CreateTable
CREATE TABLE "portfolios" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "title_en" VARCHAR(200),
    "description" TEXT NOT NULL,
    "description_en" TEXT,
    "image_url" VARCHAR(500) NOT NULL,
    "role" VARCHAR(160),
    "role_en" VARCHAR(160),
    "live_url" VARCHAR(500),
    "github_url" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" INTEGER NOT NULL DEFAULT 0,
    "updated_by" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_stacks" (
    "id" SERIAL NOT NULL,
    "portfolio_id" INTEGER NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "name_en" VARCHAR(120),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" INTEGER NOT NULL DEFAULT 0,
    "updated_by" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "portfolio_stacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_contributions" (
    "id" SERIAL NOT NULL,
    "portfolio_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "description_en" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" INTEGER NOT NULL DEFAULT 0,
    "updated_by" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "portfolio_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_outcomes" (
    "id" SERIAL NOT NULL,
    "portfolio_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "description_en" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" INTEGER NOT NULL DEFAULT 0,
    "updated_by" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "portfolio_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_slug_key" ON "portfolios"("slug");

-- CreateIndex
CREATE INDEX "portfolios_is_published_display_order_idx" ON "portfolios"("is_published", "display_order");

-- CreateIndex
CREATE INDEX "portfolio_stacks_portfolio_id_display_order_idx" ON "portfolio_stacks"("portfolio_id", "display_order");

-- CreateIndex
CREATE INDEX "portfolio_contributions_portfolio_id_display_order_idx" ON "portfolio_contributions"("portfolio_id", "display_order");

-- CreateIndex
CREATE INDEX "portfolio_outcomes_portfolio_id_display_order_idx" ON "portfolio_outcomes"("portfolio_id", "display_order");

-- AddForeignKey
ALTER TABLE "portfolio_stacks" ADD CONSTRAINT "portfolio_stacks_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_contributions" ADD CONSTRAINT "portfolio_contributions_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_outcomes" ADD CONSTRAINT "portfolio_outcomes_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
