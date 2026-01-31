-- CreateTable
CREATE TABLE "site_configurations" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL DEFAULT 0,
    "updated_by" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "site_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_configurations_type_key" ON "site_configurations"("type");
