#!/bin/bash
set -e

echo "Running E2E tests..."
set -a
source .env.test
set +a

cd ../../packages/database
npx prisma db push --accept-data-loss --force-reset
npx ts-node prisma/seed.ts

cd ../../apps/api
npx jest --config ./test/jest-e2e.json --runInBand
