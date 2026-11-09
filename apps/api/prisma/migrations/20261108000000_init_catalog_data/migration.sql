-- Enable native pg_trgm extension for similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('DORAMA', 'FILME', 'ANIME', 'MANGA', 'MANHWA', 'MANHUA');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA', 'HIATO', 'DESCONHECIDA');

-- CreateTable
CREATE TABLE "media_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(160) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "original_title" VARCHAR(255),
    "romanized_title" VARCHAR(255),
    "normalized_title" VARCHAR(255) NOT NULL,
    "synopsis" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "publication_status" "PublicationStatus" NOT NULL,
    "release_year" INTEGER,
    "origin_country" VARCHAR(64) NOT NULL,
    "rating" DOUBLE PRECISION,
    "cover_path" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_genres" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "media_item_id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,

    CONSTRAINT "item_genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_aliases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "media_item_id" UUID NOT NULL,
    "alias" VARCHAR(255) NOT NULL,
    "normalized_alias" VARCHAR(255) NOT NULL,
    "language_code" VARCHAR(16) NOT NULL,

    CONSTRAINT "item_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_items_slug_key" ON "media_items"("slug");

-- CreateIndex
CREATE INDEX "media_items_category_publication_status_idx" ON "media_items"("category", "publication_status");

-- CreateIndex GIN Trigram for Full-Text Search
CREATE INDEX "media_items_normalized_title_trgm_idx" ON "media_items" USING GIN ("normalized_title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "item_genres_name_idx" ON "item_genres"("name");

-- CreateIndex
CREATE UNIQUE INDEX "item_genres_media_item_id_name_key" ON "item_genres"("media_item_id", "name");

-- CreateIndex
CREATE INDEX "item_aliases_media_item_id_idx" ON "item_aliases"("media_item_id");

-- AddForeignKey
ALTER TABLE "item_genres" ADD CONSTRAINT "item_genres_media_item_id_fkey" FOREIGN KEY ("media_item_id") REFERENCES "media_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_aliases" ADD CONSTRAINT "item_aliases_media_item_id_fkey" FOREIGN KEY ("media_item_id") REFERENCES "media_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

