-- BankCore Phase 2 foundation migration
-- Prisma schema: libs/prisma-client/prisma/schema.prisma

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');
CREATE TYPE "AccountType" AS ENUM ('SAVINGS', 'CURRENT', 'FIXED_DEPOSIT', 'LOAN');
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'FROZEN', 'DORMANT', 'CLOSED');
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'FEE', 'INTEREST', 'REVERSAL');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED');
CREATE TYPE "EntryType" AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED');
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED', 'DEAD_LETTER');
CREATE TYPE "SagaStatus" AS ENUM ('STARTED', 'RUNNING', 'COMPLETED', 'COMPENSATING', 'COMPENSATED', 'FAILED');
CREATE TYPE "SagaStepStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'COMPENSATING', 'COMPENSATED', 'FAILED');

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "keycloak_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "phone" TEXT,
  "date_of_birth" TIMESTAMP(3),
  "national_id" TEXT,
  "kyc_status" "KycStatus" NOT NULL DEFAULT 'PENDING',
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_keycloak_id_key" ON "users"("keycloak_id");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_national_id_key" ON "users"("national_id");
CREATE INDEX "users_status_kyc_status_idx" ON "users"("status", "kyc_status");

CREATE TABLE "accounts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_number" TEXT NOT NULL,
  "user_id" UUID NOT NULL,
  "type" "AccountType" NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
  "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "available_balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
  "interest_rate" DECIMAL(5,4),
  "overdraft_limit" DECIMAL(18,2),
  "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "accounts_account_number_key" ON "accounts"("account_number");
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");
CREATE INDEX "accounts_status_idx" ON "accounts"("status");
CREATE INDEX "accounts_type_status_idx" ON "accounts"("type", "status");
CREATE INDEX "accounts_currency_idx" ON "accounts"("currency");

CREATE TABLE "transactions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "reference_number" TEXT NOT NULL,
  "idempotency_key" TEXT,
  "type" "TransactionType" NOT NULL,
  "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
  "amount" DECIMAL(18,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
  "description" TEXT,
  "debit_account_id" UUID,
  "credit_account_id" UUID,
  "metadata" JSONB,
  "failure_reason" TEXT,
  "processed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "transactions_reference_number_key" ON "transactions"("reference_number");
CREATE UNIQUE INDEX "transactions_idempotency_key_key" ON "transactions"("idempotency_key");
CREATE INDEX "transactions_debit_account_id_idx" ON "transactions"("debit_account_id");
CREATE INDEX "transactions_credit_account_id_idx" ON "transactions"("credit_account_id");
CREATE INDEX "transactions_status_idx" ON "transactions"("status");
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");
CREATE INDEX "transactions_type_status_created_at_idx" ON "transactions"("type", "status", "created_at");
CREATE INDEX "transactions_reference_number_created_at_idx" ON "transactions"("reference_number", "created_at");

CREATE TABLE "ledger_entries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "transaction_id" UUID NOT NULL,
  "account_id" UUID NOT NULL,
  "entry_type" "EntryType" NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "balance_after" DECIMAL(18,2) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ledger_entries_transaction_id_idx" ON "ledger_entries"("transaction_id");
CREATE INDEX "ledger_entries_account_id_idx" ON "ledger_entries"("account_id");
CREATE INDEX "ledger_entries_created_at_idx" ON "ledger_entries"("created_at");
CREATE UNIQUE INDEX "ledger_entries_transaction_id_account_id_entry_type_key"
  ON "ledger_entries"("transaction_id", "account_id", "entry_type");

CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resource_id" TEXT,
  "old_value" JSONB,
  "new_value" JSONB,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_resource_resource_id_idx" ON "audit_logs"("resource", "resource_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

CREATE TABLE "notifications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "type" TEXT NOT NULL,
  "subject" TEXT,
  "body" TEXT NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "metadata" JSONB,
  "sent_at" TIMESTAMP(3),
  "failed_at" TIMESTAMP(3),
  "failure_reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX "notifications_status_idx" ON "notifications"("status");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");
CREATE INDEX "notifications_channel_status_created_at_idx" ON "notifications"("channel", "status", "created_at");

CREATE TABLE "outbox_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "event_id" UUID NOT NULL,
  "aggregate_type" TEXT NOT NULL,
  "aggregate_id" UUID NOT NULL,
  "event_type" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "headers" JSONB,
  "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
  "transaction_id" UUID,
  "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processed_at" TIMESTAMP(3),
  "retry_count" INTEGER NOT NULL DEFAULT 0,
  "last_error" TEXT,
  "correlation_id" TEXT,
  "causation_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "outbox_events_event_id_key" ON "outbox_events"("event_id");
CREATE INDEX "outbox_events_status_available_at_idx" ON "outbox_events"("status", "available_at");
CREATE INDEX "outbox_events_aggregate_type_aggregate_id_idx" ON "outbox_events"("aggregate_type", "aggregate_id");
CREATE INDEX "outbox_events_occurred_at_idx" ON "outbox_events"("occurred_at");
CREATE INDEX "outbox_events_correlation_id_idx" ON "outbox_events"("correlation_id");

CREATE TABLE "inbox_messages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "message_id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "partition" INTEGER,
  "offset" TEXT,
  "key" TEXT,
  "payload" JSONB NOT NULL,
  "headers" JSONB,
  "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processed_at" TIMESTAMP(3),
  "processing_error" TEXT,
  CONSTRAINT "inbox_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "inbox_messages_message_id_key" ON "inbox_messages"("message_id");
CREATE INDEX "inbox_messages_source_topic_idx" ON "inbox_messages"("source", "topic");
CREATE INDEX "inbox_messages_received_at_idx" ON "inbox_messages"("received_at");

CREATE TABLE "saga_instances" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "saga_type" TEXT NOT NULL,
  "correlation_id" TEXT NOT NULL,
  "initiator_user_id" UUID,
  "status" "SagaStatus" NOT NULL DEFAULT 'STARTED',
  "context" JSONB,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  "failed_at" TIMESTAMP(3),
  "failure_reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "saga_instances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "saga_instances_correlation_id_key" ON "saga_instances"("correlation_id");
CREATE INDEX "saga_instances_status_started_at_idx" ON "saga_instances"("status", "started_at");
CREATE INDEX "saga_instances_saga_type_status_idx" ON "saga_instances"("saga_type", "status");

CREATE TABLE "saga_steps" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "saga_instance_id" UUID NOT NULL,
  "step_name" TEXT NOT NULL,
  "step_order" INTEGER NOT NULL,
  "status" "SagaStepStatus" NOT NULL DEFAULT 'PENDING',
  "transaction_id" UUID,
  "account_id" UUID,
  "request_payload" JSONB,
  "response_payload" JSONB,
  "compensation_payload" JSONB,
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "failed_at" TIMESTAMP(3),
  "failure_reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "saga_steps_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "saga_steps_saga_instance_id_step_order_key"
  ON "saga_steps"("saga_instance_id", "step_order");
CREATE INDEX "saga_steps_saga_instance_id_step_order_idx" ON "saga_steps"("saga_instance_id", "step_order");
CREATE INDEX "saga_steps_status_idx" ON "saga_steps"("status");
CREATE INDEX "saga_steps_transaction_id_idx" ON "saga_steps"("transaction_id");
CREATE INDEX "saga_steps_account_id_idx" ON "saga_steps"("account_id");

ALTER TABLE "accounts"
  ADD CONSTRAINT "accounts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_debit_account_id_fkey"
  FOREIGN KEY ("debit_account_id") REFERENCES "accounts"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transactions"
  ADD CONSTRAINT "transactions_credit_account_id_fkey"
  FOREIGN KEY ("credit_account_id") REFERENCES "accounts"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ledger_entries"
  ADD CONSTRAINT "ledger_entries_transaction_id_fkey"
  FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ledger_entries"
  ADD CONSTRAINT "ledger_entries_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "accounts"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "outbox_events"
  ADD CONSTRAINT "outbox_events_transaction_id_fkey"
  FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "saga_instances"
  ADD CONSTRAINT "saga_instances_initiator_user_id_fkey"
  FOREIGN KEY ("initiator_user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "saga_steps"
  ADD CONSTRAINT "saga_steps_saga_instance_id_fkey"
  FOREIGN KEY ("saga_instance_id") REFERENCES "saga_instances"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "saga_steps"
  ADD CONSTRAINT "saga_steps_transaction_id_fkey"
  FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "saga_steps"
  ADD CONSTRAINT "saga_steps_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "accounts"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
