# Bankcore

## Folder Map
- `apps/api`: NestJS API Backend
- `apps/web`: Next.js Web Portal
- `packages/contracts`: Shared Typescript types
- `docs/`: Architecture and process rules

## How to Run
1. `npm install`
2. `cp .env.example .env`
3. `npm run build` (builds the contracts first, then the apps)
4. `npm run dev:api` (starts the NestJS backend)
5. `npm run dev:web` (starts the Next.js frontend)

## Conventions
- **Response Envelope**: Every API endpoint returns `{ data, error, meta }` defined in `@bankcore/contracts`.
- **API Prefix**: All API endpoints start with `/api/v1`.
- **Environment Handling**: Use `ConfigModule` in NestJS and `.env` files.
- **Commit Style**: Use Conventional Commits (`feat:`, `chore:`, `fix:`).
Work on the `rebuild/v2` branch.

The priority now is to make **BankCore fully functional end-to-end across frontend and backend** before continuing with the remaining infrastructure/integration phases.

### Goal

Implement all core user-facing business features so the website is actually usable, with real API calls and persistent data.

### Implement in order

1. PostgreSQL + Prisma
2. Keycloak authentication + RBAC
3. Account domain
4. Transaction domain
5. Loan domain
6. Notification system
7. Redis where required
8. Connect all frontend pages to real backend APIs
9. Complete all customer/employee/admin workflows
10. Add validation, error handling, loading/empty states
11. Ensure frontend ↔ API ↔ database flows work end-to-end
12. Add/expand unit and E2E tests for every completed workflow

### Important

Do NOT implement Kafka, Flowable, GoRules, API Gateway, advanced infrastructure, or production hardening yet unless required to make the core workflows function.

Do not create fake/mock business logic to hide missing functionality.

First inspect the existing `rebuild/v2` code and preserve the current architecture and contracts. Implement incrementally, run tests/builds after each domain, and fix issues before moving to the next domain.

### Definition of Done

A user should be able to open the website, authenticate, and perform the actual banking workflows through the UI with data persisted in PostgreSQL and enforced by backend authorization.

After this core product is complete, we will continue with:
**Kafka → GoRules → Flowable → integrations → API Gateway → security/reliability → Docker/infrastructure → full production E2E verification.**
