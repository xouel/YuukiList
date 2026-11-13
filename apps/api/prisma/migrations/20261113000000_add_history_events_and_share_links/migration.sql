-- CreateTable
CREATE TABLE "history_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "media_item_id" UUID NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previous_status" VARCHAR(32),
    "new_status" VARCHAR(32),
    "previous_progress" INTEGER,
    "new_progress" INTEGER,
    "rating" DOUBLE PRECISION,
    "is_favorite" BOOLEAN,
    "rewatch_count" INTEGER,
    "note" TEXT,
    "episode_number" INTEGER,
    "chapter_number" INTEGER,
    "volume_number" INTEGER,
    "contains_spoiler" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "history_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_links" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token" VARCHAR(64) NOT NULL,
    "share_scope" VARCHAR(32) NOT NULL DEFAULT 'FULL_LIBRARY',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "history_events_user_id_occurred_at_idx" ON "history_events"("user_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "history_events_user_id_media_item_id_idx" ON "history_events"("user_id", "media_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "share_links_token_key" ON "share_links"("token");

-- CreateIndex
CREATE INDEX "share_links_user_id_created_at_idx" ON "share_links"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "history_events" ADD CONSTRAINT "history_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_events" ADD CONSTRAINT "history_events_media_item_id_fkey" FOREIGN KEY ("media_item_id") REFERENCES "media_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

