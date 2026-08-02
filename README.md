# BankCore

Enterprise Digital Banking Platform foundation built on an Nx monorepo.

## Technology Foundation

- Nx monorepo
- NestJS microservices
- Next.js web portal shell
- PostgreSQL + Prisma ORM
- Redis
- Kafka
- RabbitMQ
- Keycloak
- Flowable BPMN
- Go Rules
- Docker

## Repository Layout

- apps/: deployable applications
- libs/: shared libraries
- docker/: container initialization assets
- docs/architecture/: architecture and patterns baseline
- scripts/: workspace utility scripts

## Applications

- apps/api-gateway
- apps/iam-service
- apps/account-service
- apps/transaction-service
- apps/notification-service
- apps/web-portal

## Foundation Patterns

See docs in docs/architecture for:

- Clean Architecture
- DDD
- CQRS
- Outbox Pattern
- Saga Pattern
- Strategy Pattern

## Environment

Use .env.example as the baseline and copy values into .env.

## Useful Commands

- npm run docker:up
- npm run docker:down
- npm run health:check
- npx nx run-many -t build
- npx nx run-many -t lint
- npx nx run-many -t test
