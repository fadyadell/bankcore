/*
  Warnings:

  - The primary key for the `accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `status` column on the `accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `approvals` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `status` column on the `approvals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `audit_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `inbox_messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ledger_entries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `loans` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `status` column on the `loans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `status` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `outbox_events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `status` column on the `outbox_events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `saga_instances` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `status` column on the `saga_instances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `saga_steps` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `status` column on the `saga_steps` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `transactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `status` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `kyc_status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `entry_type` on the `ledger_entries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `channel` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "approvals" DROP CONSTRAINT "approval_loan_fk";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ledger_entries" DROP CONSTRAINT "ledger_entries_account_id_fkey";

-- DropForeignKey
ALTER TABLE "ledger_entries" DROP CONSTRAINT "ledger_entries_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "outbox_events" DROP CONSTRAINT "outbox_events_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "saga_instances" DROP CONSTRAINT "saga_instances_initiator_user_id_fkey";

-- DropForeignKey
ALTER TABLE "saga_steps" DROP CONSTRAINT "saga_steps_account_id_fkey";

-- DropForeignKey
ALTER TABLE "saga_steps" DROP CONSTRAINT "saga_steps_saga_instance_id_fkey";

-- DropForeignKey
ALTER TABLE "saga_steps" DROP CONSTRAINT "saga_steps_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_credit_account_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_debit_account_id_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "currency" SET DATA TYPE TEXT,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "available_balance" SET DATA TYPE DECIMAL(65,30),
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "interest_rate" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "overdraft_limit" SET DATA TYPE DECIMAL(65,30),
ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "approvals" DROP CONSTRAINT "approvals_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "entity_id" SET DATA TYPE TEXT,
ALTER COLUMN "reviewer_id" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD CONSTRAINT "approvals_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "inbox_messages" DROP CONSTRAINT "inbox_messages_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "inbox_messages_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ledger_entries" DROP CONSTRAINT "ledger_entries_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "transaction_id" SET DATA TYPE TEXT,
ALTER COLUMN "account_id" SET DATA TYPE TEXT,
DROP COLUMN "entry_type",
ADD COLUMN     "entry_type" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "balance_after" SET DATA TYPE DECIMAL(65,30),
ADD CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "loans" DROP CONSTRAINT "loans_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "currency" SET DATA TYPE TEXT,
ALTER COLUMN "interest_rate" SET DATA TYPE DECIMAL(65,30),
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD CONSTRAINT "loans_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
DROP COLUMN "channel",
ADD COLUMN     "channel" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "outbox_events" DROP CONSTRAINT "outbox_events_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "event_id" SET DATA TYPE TEXT,
ALTER COLUMN "aggregate_id" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "transaction_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "saga_instances" DROP CONSTRAINT "saga_instances_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "initiator_user_id" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'STARTED',
ADD CONSTRAINT "saga_instances_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "saga_steps" DROP CONSTRAINT "saga_steps_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "saga_instance_id" SET DATA TYPE TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "transaction_id" SET DATA TYPE TEXT,
ALTER COLUMN "account_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "saga_steps_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "currency" SET DATA TYPE TEXT,
ALTER COLUMN "debit_account_id" SET DATA TYPE TEXT,
ALTER COLUMN "credit_account_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "kyc_status",
ADD COLUMN     "kyc_status" TEXT NOT NULL DEFAULT 'PENDING',
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropEnum
DROP TYPE "AccountStatus";

-- DropEnum
DROP TYPE "AccountType";

-- DropEnum
DROP TYPE "ApprovalStatus";

-- DropEnum
DROP TYPE "EntryType";

-- DropEnum
DROP TYPE "KycStatus";

-- DropEnum
DROP TYPE "LoanStatus";

-- DropEnum
DROP TYPE "NotificationChannel";

-- DropEnum
DROP TYPE "NotificationStatus";

-- DropEnum
DROP TYPE "OutboxStatus";

-- DropEnum
DROP TYPE "SagaStatus";

-- DropEnum
DROP TYPE "SagaStepStatus";

-- DropEnum
DROP TYPE "TransactionStatus";

-- DropEnum
DROP TYPE "TransactionType";

-- DropEnum
DROP TYPE "UserStatus";

-- CreateIndex
CREATE INDEX "accounts_status_idx" ON "accounts"("status");

-- CreateIndex
CREATE INDEX "accounts_type_status_idx" ON "accounts"("type", "status");

-- CreateIndex
CREATE INDEX "approvals_status_idx" ON "approvals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_entries_transaction_id_account_id_entry_type_key" ON "ledger_entries"("transaction_id", "account_id", "entry_type");

-- CreateIndex
CREATE INDEX "loans_status_idx" ON "loans"("status");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_channel_status_created_at_idx" ON "notifications"("channel", "status", "created_at");

-- CreateIndex
CREATE INDEX "outbox_events_status_available_at_idx" ON "outbox_events"("status", "available_at");

-- CreateIndex
CREATE INDEX "saga_instances_status_started_at_idx" ON "saga_instances"("status", "started_at");

-- CreateIndex
CREATE INDEX "saga_instances_saga_type_status_idx" ON "saga_instances"("saga_type", "status");

-- CreateIndex
CREATE INDEX "saga_steps_status_idx" ON "saga_steps"("status");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_type_status_created_at_idx" ON "transactions"("type", "status", "created_at");

-- CreateIndex
CREATE INDEX "users_status_kyc_status_idx" ON "users"("status", "kyc_status");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_debit_account_id_fkey" FOREIGN KEY ("debit_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_credit_account_id_fkey" FOREIGN KEY ("credit_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbox_events" ADD CONSTRAINT "outbox_events_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saga_instances" ADD CONSTRAINT "saga_instances_initiator_user_id_fkey" FOREIGN KEY ("initiator_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saga_steps" ADD CONSTRAINT "saga_steps_saga_instance_id_fkey" FOREIGN KEY ("saga_instance_id") REFERENCES "saga_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saga_steps" ADD CONSTRAINT "saga_steps_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saga_steps" ADD CONSTRAINT "saga_steps_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
