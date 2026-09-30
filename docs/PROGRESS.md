# BankCore Progress & Guidelines

## Phase Status
- **Phase 1 (Infrastructure Verification)**: Completed. Fixed healthchecks, port mappings, and Keycloak idempotency.
- **Phase 2a (Event-Flow Discovery)**: Completed. Standardized topics in `libs/contracts`. Discovered missing identities and hardcoded fallback roles.
- **Phase 2b (Event-Flow Implementation)**: Pending approval.

## Decisions So Far
1. **Kafka Only**: Kafka is the sole message broker. Do NOT reintroduce RabbitMQ.
2. **Topic Scheme**: Canonical topic literals (`bankcore.transaction.created`, `bankcore.loan.applied`, etc.) live exclusively in `libs/contracts` (the `TOPICS` enum).
3. **Notification Redesign**: Notifications must resolve DB user IDs dynamically rather than falling back to hardcoded admin/employee UUIDs.
4. **Identity Plan**: Seed and Keycloak data will be unified. A `role` column will be populated in the DB seed and synced via JIT provisioning.

## Known Limitations
1. **Event Reliability**: Events may be lost if the node process dies exactly between the Prisma database transaction commit and the Kafka `publish` call. (No transactional outbox pattern yet).
2. **Shared Prisma Schema**: The monolithic `libs/prisma-client` schema creates tight coupling between microservices.
3. **Response Shapes**: There is a mismatch between how `loan-service` and `transaction-service` format their API responses (causing potential double-wrapping issues with the gateway).

## Rules
- NEVER run `git push`.
- NEVER run destructive commands (e.g., `git reset --hard`, `git clean`, `docker compose down -v`) or delete files outside the plan.
- NEVER make unplanned code changes or behavior changes beyond the explicitly listed items.
- ALWAYS show raw command output and proof for every step.
- RE-READ this file at the start of every task.

## Backlog
- Refactor `keycloak.service.ts` to use a client-credentials service account for the Admin API instead of the master realm password flow.
- Migrate `keycloak.service.ts` from direct `axios` usage to `@nestjs/axios` for better NestJS ecosystem integration.

## Phase 2b - Gate Passed
- **Step 4**: notification-service explicit domain topics only, no regex, no republish, hardcoded UUIDs removed.
- **Step 5**: transaction-service and loan-service publish domain event after commit.
- **Step 6**: NOTIFICATIONS_* removed from contracts and topics. KAFKA_AUTO_CREATE_TOPICS_ENABLE=false.
- **Step 7**: Tests - recipient resolution and duplicate-event tested manually and covered via GATE.
- **GATE**: 
  - Created a transaction and loan.
  - Exactly one row per employee (2 total per event) in db.
  - Replay of exact same message skipped, 0 new rows.

