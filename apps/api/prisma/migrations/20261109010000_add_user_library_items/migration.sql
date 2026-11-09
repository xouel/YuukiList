-- CreateTable
CREATE TABLE "user_library_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "media_item_id" UUID NOT NULL,
    "status" VARCHAR(32) NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_library_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_library_items_user_id_media_item_id_key" ON "user_library_items"("user_id", "media_item_id");

-- CreateIndex
CREATE INDEX "user_library_items_user_id_status_idx" ON "user_library_items"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_library_items_user_id_created_at_idx" ON "user_library_items"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "user_library_items" ADD CONSTRAINT "user_library_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_library_items" ADD CONSTRAINT "user_library_items_media_item_id_fkey" FOREIGN KEY ("media_item_id") REFERENCES "media_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

