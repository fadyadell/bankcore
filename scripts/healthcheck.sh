#!/usr/bin/env bash
set -euo pipefail

check_health() {
  local name="$1"
  local url="$2"

  if curl -fsS "$url" > /dev/null; then
    echo "[OK] ${name}: ${url}"
  else
    echo "[FAIL] ${name}: ${url}"
    return 1
  fi
}

check_health "api-gateway" "http://localhost:${API_GATEWAY_PORT:-3000}/api/v1/health"
check_health "iam-service" "http://localhost:${IAM_SERVICE_PORT:-3001}/health"
check_health "account-service" "http://localhost:${ACCOUNT_SERVICE_PORT:-3002}/health"
check_health "transaction-service" "http://localhost:${TRANSACTION_SERVICE_PORT:-3003}/health"
check_health "notification-service" "http://localhost:${NOTIFICATION_SERVICE_PORT:-3004}/health"

echo "All service health checks passed."
