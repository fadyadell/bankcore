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
