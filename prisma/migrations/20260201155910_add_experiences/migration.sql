-- CreateTable
CREATE TABLE "experiences" (
    "id" SERIAL NOT NULL,
    "sort" INTEGER NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ,
    "role_id" VARCHAR(180) NOT NULL,
    "role_en" VARCHAR(180) NOT NULL,
    "company_name" VARCHAR(180) NOT NULL,
    "company_url" VARCHAR(500),
    "year_start" SMALLINT,
    "year_end" SMALLINT,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "description_id" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" INTEGER NOT NULL DEFAULT 0,
    "updated_by" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences_skills" (
    "id" SERIAL NOT NULL,
    "experience_id" INTEGER NOT NULL,
    "skill_name" VARCHAR(100) NOT NULL,
    "sort" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" INTEGER NOT NULL DEFAULT 0,
    "updated_by" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "experiences_skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "experiences_skills_experience_id_idx" ON "experiences_skills"("experience_id");

-- AddForeignKey
ALTER TABLE "experiences_skills" ADD CONSTRAINT "experiences_skills_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
