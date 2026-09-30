PROJECT: BankCore, a NestJS npm-workspaces monorepo (apps: api-gateway, iam, account, transaction, loan, notification, workflow, web-portal; libs: auth, cache, common, contracts, database, kafka, prisma-client). Local infra in docker compose: postgres, redis, keycloak, kafka, zookeeper. Kafka is the only broker (RabbitMQ was removed on purpose). Canonical topic names live in libs/contracts (TOPICS). Branch: chore/cleanup-and-infra. Nothing is pushed.

RULES: never `git push`, never `docker compose down -v`, `git reset --hard`, `git clean`, or delete unplanned files; no unplanned code changes; one commit per step, build + test before each commit; paste RAW command output, never summaries; copy SQL verbatim from your command log.

FACTS ESTABLISHED
- Baseline: one transaction and one loan created through the API produced only bankcore.notifications.employee messages (published directly by transaction-service and loan-service). bankcore.transaction.created and bankcore.loan.applied were NOT emitted: workflow-service publishes nothing because Flowable is unreachable (no Flowable in docker-compose).
- notification-service/notification.consumer.ts hardcodes recipient UUIDs (lines ~36-38: EMPLOYEE -> ...1113, ADMIN -> ...1111, fallback -> admin). Events without targetRole land on the admin.
- KafkaConsumerService (regex /bankcore\..*/) republishes to bankcore.notifications.* and NotificationConsumer consumes those (a double hop). Both call JSON.parse without try/catch. There is no eventId anywhere, so a redelivered event creates a duplicate row.
- users table has NO role column. Seed users (libs/prisma-client/prisma/seed.mjs) don't match Keycloak users (different emails, kc-* placeholder keycloak_ids). Keycloak setup: scripts/setup-keycloak.sh.
- Last agent session changed keycloak.service.ts (throws instead of returning kc-${Date.now()}; random password instead of 'Customer@123') plus keycloak.service.spec.ts: UNCOMMITTED.

TASK 0
a. Commit the keycloak.service.ts, keycloak.service.spec.ts and docs/PROGRESS.md changes: "fix(iam-service): stop inventing Keycloak ids, drop default password".
b. grep the whole repo (excluding node_modules/dist) for 'Customer@123' and report every caller that relied on the default password. Fix or report them.

PART 1 - report only, raw output
1. Copy the direct DB writes verbatim from your previous session log if it is available; if it isn't, say so and show `SELECT id, email, keycloak_id FROM users` and the balances of the accounts you touched.
2. Show workflow.service.ts lines 45-80 and explain why nothing is published for created/applied (is the publish after the Flowable call?).
3. Run test-flow (scripts/dev-scratch/test-flow.js) and paste the HTTP status and body of every call.
4. Show `\d users`, `\d notifications`, and `SELECT count(*) FROM notifications`.
5. Show jest output for transaction.service.spec.ts, the final transaction.service.ts raw account query, and its returned column names when run in psql. List every other field read from that raw row and confirm each maps correctly (this is the pessimistic-locking path).
6. `docker ps -a`: if a hash-prefixed container exists (e.g. 3f644487cdcc_bankcore-kafka-1), run `docker compose down` (NO -v), `docker compose up -d --remove-orphans`, `node scripts/create-topics.js`, then show `docker compose ps` and the topic list.
7. Delete the ignored .nx/ directory.

PART 2 - implement, in order
DESIGN: whoever commits the data emits the event. transaction-service publishes TRANSACTION_CREATED and loan-service publishes LOAN_APPLIED AFTER the DB commit (inside try/catch: a committed transaction never becomes a 500; log topic + eventId on failure). workflow-service stops publishing created/applied and keeps only workflow outcomes (approved/completed/rejected). Leave DOMAIN_EVENTS alone.
Step 1. Prisma migrations (normal migrations, no reset yet): users.role String @default("CUSTOMER"); notifications.eventId nullable with unique(eventId, userId).
Step 2. Identity. First prove with a throwaway user that the Keycloak create-user API honours `id`. Then setup-keycloak.sh creates admin, employee, employee2, customer, customer2 with fixed ids and the same emails as the seed; delete and recreate ONLY the existing seeded Keycloak users (not the realm). Rewrite seed.mjs so every DB user matches a Keycloak user (id, email, keycloak_id = that id, role); remove the kc-* placeholders. Mark fixed ids as DEV ONLY in comments and docs. STOP CONDITION: before `prisma migrate reset`, show DATABASE_URL (must be localhost:5432/bankcore) and table row counts; proceed only if it is the local dev DB. Afterwards show the users table next to a token `sub` for every Keycloak user.
Step 3. contracts + libs/kafka: ONE shared publish helper that adds eventId (uuid), eventType and occurredAt. Each payload contract states which field identifies the customer and that it is User.id.
Step 4. notification-service: explicit domain topics only (no regex, no republish; delete KafkaConsumerService and the hardcoded UUIDs). Recipients: TRANSACTION_CREATED and LOAN_APPLIED -> all active users with role EMPLOYEE; TRANSACTION_APPROVED -> ADMIN; other outcomes -> the customer User.id in the payload. No fallback: an event with no recipient is logged and skipped. createMany({skipDuplicates:true}) or catch only the unique-violation error. JSON.parse in try/catch, log topic/partition/offset, skip malformed messages. A handler failure marks that notification FAILED and doesn't block the partition.
Step 5. transaction-service and loan-service publish the domain event after commit via the shared helper; remove every direct bankcore.notifications.* publish; remove created/applied publishes from workflow-service (exactly ONE publisher per event; show the grep).
Step 6. Remove NOTIFICATIONS_* and notificationsCustomer from contracts and create-topics.js. Only then set KAFKA_AUTO_CREATE_TOPICS_ENABLE=false in docker-compose, and make create-topics.js run before the services start (document it in scripts/start-bankcore.sh).
Step 7. Tests: recipient resolution unit test, integration test produce -> consume -> DB row, duplicate-event test (same eventId twice = one row per recipient).

GATE (show all): the real API call creating a transaction as customer@ (transfer to customer2, not to self), the notification-service log line with topic and offset, and SQL showing exactly one row for each of the two employees and none for anyone else. Replay the same event: the count must not change. Repeat for one loan. Update docs/PROGRESS.md, commit, give one final report and STOP.
