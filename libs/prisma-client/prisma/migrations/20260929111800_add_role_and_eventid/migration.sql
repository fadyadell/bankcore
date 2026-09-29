-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "event_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'CUSTOMER';

-- CreateIndex
CREATE UNIQUE INDEX "notifications_event_id_user_id_key" ON "notifications"("event_id", "user_id");

