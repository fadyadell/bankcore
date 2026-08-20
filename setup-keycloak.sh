#!/bin/bash
set -e

KEYCLOAK_URL="http://127.0.0.1:8180"
ADMIN_USER="admin"
ADMIN_PASS="admin"

echo "Getting admin token..."
TOKEN=$(curl -s -d "client_id=admin-cli" -d "username=$ADMIN_USER" -d "password=$ADMIN_PASS" -d "grant_type=password" "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" | jq -r .access_token)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to get token. Check Keycloak credentials or if it is running."
  exit 1
fi

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

# Function to create user and assign role
create_user() {
  local USERNAME=$1
  local PASSWORD=$2
  local ROLE=$3
  local EMAIL=$4

  echo "Creating user $USERNAME..."
  curl -s -X POST "$KEYCLOAK_URL/admin/realms/bankcore/users" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"$USERNAME\",
      \"email\": \"$EMAIL\",
      \"enabled\": true,
      \"credentials\": [{
        \"type\": \"password\",
        \"value\": \"$PASSWORD\",
        \"temporary\": false
      }]
    }"
  
  local USER_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$KEYCLOAK_URL/admin/realms/bankcore/users?username=$USERNAME" | jq -r '.[0].id')
  local ROLE_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$KEYCLOAK_URL/admin/realms/bankcore/roles/$ROLE" | jq -r '.id')
  
  echo "Assigning $ROLE role to $USERNAME..."
  curl -s -X POST "$KEYCLOAK_URL/admin/realms/bankcore/users/$USER_ID/role-mappings/realm" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "[{
      \"id\": \"$ROLE_ID\",
      \"name\": \"$ROLE\"
    }]"
}

create_user "admin" "admin" "ADMIN" "admin@bankcore.local"
create_user "employee" "employee" "EMPLOYEE" "employee@bankcore.local"
create_user "customer" "customer" "CUSTOMER" "customer@bankcore.local"

echo "Setup complete!"
