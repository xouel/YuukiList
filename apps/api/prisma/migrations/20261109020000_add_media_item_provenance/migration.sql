-- Migration: Add provenance JSON column to media_items
-- Conforme Requisito: Field-Level Data Provenance Tracking & Soberania de Dados

ALTER TABLE "media_items" ADD COLUMN IF NOT EXISTS "provenance" JSONB;

-- Inicializa proveniência das 30 obras originais semeadas como SEED_CANONICAL
UPDATE "media_items"
SET "provenance" = jsonb_build_object(
  'title', jsonb_build_object('source', 'SEED_CANONICAL', 'syncedAt', '2026-01-01T00:00:00.000Z'),
  'synopsis', jsonb_build_object('source', 'SEED_CANONICAL', 'syncedAt', '2026-01-01T00:00:00.000Z'),
  'category', jsonb_build_object('source', 'SEED_CANONICAL', 'syncedAt', '2026-01-01T00:00:00.000Z'),
  'cover', jsonb_build_object('source', 'SEED_CANONICAL', 'syncedAt', '2026-01-01T00:00:00.000Z')
)
WHERE "provenance" IS NULL;

