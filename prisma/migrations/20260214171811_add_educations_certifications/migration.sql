-- CreateTable
CREATE TABLE "educations" (
    "id" SERIAL NOT NULL,
    "institution_name" VARCHAR(255) NOT NULL,
    "degree" VARCHAR(255) NOT NULL,
    "degree_en" VARCHAR(255) NOT NULL,
    "field_of_study" VARCHAR(255) NOT NULL,
    "field_of_study_en" VARCHAR(255) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "description" TEXT,
    "description_en" TEXT,
    "location" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" INTEGER NOT NULL DEFAULT 0,
    "updated_by" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "issuing_organization" VARCHAR(255) NOT NULL,
    "issue_date" DATE NOT NULL,
    "description" TEXT,
    "description_en" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" INTEGER NOT NULL DEFAULT 0,
    "updated_by" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "educations_is_active_sort_order_idx" ON "educations"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "educations_created_at_idx" ON "educations"("created_at");

-- CreateIndex
CREATE INDEX "certifications_is_active_sort_order_idx" ON "certifications"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "certifications_issue_date_idx" ON "certifications"("issue_date");
