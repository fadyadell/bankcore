#!/bin/bash
set -e

# DEV ONLY - local credentials
KEYCLOAK_URL="http://127.0.0.1:8080"
ADMIN_USER="admin"
ADMIN_PASS="admin"

echo "Getting admin token..."
TOKEN=$(curl -s -d "client_id=admin-cli" -d "username=$ADMIN_USER" -d "password=$ADMIN_PASS" -d "grant_type=password" "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" | jq -r .access_token)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to get token. Check Keycloak credentials or if it is running."
  exit 1
fi

if curl -s -f -H "Authorization: Bearer $TOKEN" "$KEYCLOAK_URL/admin/realms/bankcore" > /dev/null; then
  echo "Realm bankcore already exists. Skipping realm/client/role creation."
else
  echo "Creating bankcore realm..."
  curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "realm": "bankcore",
      "enabled": true,
      "registrationAllowed": true,
      "resetPasswordAllowed": true
    }'

  echo "Creating client bankcore-web..."
  curl -s -X POST "$KEYCLOAK_URL/admin/realms/bankcore/clients" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "clientId": "bankcore-web",
      "enabled": true,
      "publicClient": true,
      "directAccessGrantsEnabled": true,
      "redirectUris": ["http://localhost:3000/*"],
      "webOrigins": ["http://localhost:3000"]
    }'

  CLIENT_ID_UUID=$(curl -s -H "Authorization: Bearer $TOKEN" "$KEYCLOAK_URL/admin/realms/bankcore/clients?clientId=bankcore-web" | jq -r '.[0].id')

  echo "Creating roles..."
  for ROLE in "ADMIN" "EMPLOYEE" "CUSTOMER"; do
    curl -s -X POST "$KEYCLOAK_URL/admin/realms/bankcore/roles" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"$ROLE\"}"
  done

  echo "Setting up mapper to include roles in ID token..."
  curl -s -X POST "$KEYCLOAK_URL/admin/realms/bankcore/clients/$CLIENT_ID_UUID/protocol-mappers/models" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "protocol": "openid-connect",
      "protocolMapper": "oidc-usermodel-realm-role-mapper",
      "name": "realm roles",
      "config": {
        "claim.name": "roles",
        "jsonType.label": "String",
        "id.token.claim": "true",
        "access.token.claim": "true",
        "userinfo.token.claim": "true",
        "multivalued": "true"
      }
    }'
fi

# Function to ensure user exists, has correct attributes, and assigned role
ensure_user() {
  local USERNAME=$1
  local PASSWORD=$2
  local ROLE=$3
  local EMAIL=$4

  echo "Ensuring user $USERNAME..."
  
  # Try to create user first (ignore error if exists)
  curl -s -X POST "$KEYCLOAK_URL/admin/realms/bankcore/users" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"$USERNAME\",
      \"email\": \"$EMAIL\",
      \"enabled\": true
    }" > /dev/null

  local USER_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$KEYCLOAK_URL/admin/realms/bankcore/users?username=$USERNAME" | jq -r '.[0].id')
  
  if [ "$USER_ID" == "null" ] || [ -z "$USER_ID" ]; then
    echo "Failed to find or create user $USERNAME"
    return 1
  fi

  # Update user attributes using PUT
  curl -s -X PUT "$KEYCLOAK_URL/admin/realms/bankcore/users/$USER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"firstName\": \"$USERNAME\",
      \"lastName\": \"Test\",
      \"email\": \"$EMAIL\",
      \"emailVerified\": true,
      \"enabled\": true,
      \"requiredActions\": []
    }" > /dev/null

  # Update password using PUT
  curl -s -X PUT "$KEYCLOAK_URL/admin/realms/bankcore/users/$USER_ID/reset-password" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"type\": \"password\",
      \"value\": \"$PASSWORD\",
      \"temporary\": false
    }" > /dev/null

  local ROLE_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$KEYCLOAK_URL/admin/realms/bankcore/roles/$ROLE" | jq -r '.id')
  
  echo "Assigning $ROLE role to $USERNAME..."
  curl -s -X POST "$KEYCLOAK_URL/admin/realms/bankcore/users/$USER_ID/role-mappings/realm" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "[{
      \"id\": \"$ROLE_ID\",
      \"name\": \"$ROLE\"
    }]" > /dev/null
}

ensure_user "admin" "admin" "ADMIN" "admin@bankcore.local"
ensure_user "employee" "employee" "EMPLOYEE" "employee@bankcore.local"
ensure_user "customer" "customer" "CUSTOMER" "customer@bankcore.local"

echo "Setup complete!"
