#!/bin/bash
set -e
KEYCLOAK_URL="http://127.0.0.1:8080"
REALM="bankcore"
TOKEN=$(curl -s -d "client_id=admin-cli" -d "username=admin" -d "password=admin" -d "grant_type=password" "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" | jq -r .access_token)

for username in admin customer employee; do
  echo "Fixing user $username"
  USER_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$KEYCLOAK_URL/admin/realms/$REALM/users?username=$username" | jq -r '.[0].id')
  curl -s -X PUT "$KEYCLOAK_URL/admin/realms/$REALM/users/$USER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"emailVerified\": true,
      \"requiredActions\": []
    }"
done
