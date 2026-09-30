#!/bin/bash
set -e
fuser -k 3001/tcp || true
fuser -k 3000/tcp || true
npm run build
npm run lint
npm run typecheck
npm test

# Start API and Web
npm run dev:api > api.log 2>&1 &
API_PID=$!
npm run dev:web > web.log 2>&1 &
WEB_PID=$!

sleep 15
echo '--- CURL API HEALTH ---'
curl -i localhost:3001/api/v1/health || true
echo -e '\n--- CURL API NONEXISTENT ---'
curl -i localhost:3001/api/v1/nonexistent || true

echo -e '\n--- CURL WEB PAGE ---'
curl -s http://localhost:3000 | grep -i 'healthy\|unreachable' || true

echo '--- KILLING API ---'
kill $API_PID || true
sleep 5

echo '--- CURL WEB PAGE (API DOWN) ---'
curl -s http://localhost:3000 | grep -i 'healthy\|unreachable' || true

kill $WEB_PID || true
