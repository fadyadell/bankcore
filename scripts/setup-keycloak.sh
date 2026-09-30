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

echo "Deleting any existing seeded users before re-import..."
for USERNAME in "admin" "employee" "employee2" "customer" "customer2"; do
  USER_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$KEYCLOAK_URL/admin/realms/bankcore/users?username=$USERNAME" | jq -r '.[0].id')
  if [ "$USER_ID" != "null" ] && [ -n "$USER_ID" ]; then
    echo "Deleting existing user $USERNAME ($USER_ID)..."
    curl -s -X DELETE -H "Authorization: Bearer $TOKEN" "$KEYCLOAK_URL/admin/realms/bankcore/users/$USER_ID" > /dev/null
  fi
done

echo "Importing seeded users with fixed IDs..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/bankcore/partialImport" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "users": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "username": "admin",
      "email": "admin@bankcore.local",
      "firstName": "BankCore",
      "lastName": "Admin",
      "enabled": true,
      "emailVerified": true,
      "realmRoles": ["ADMIN"],
      "credentials": [{"type": "password", "value": "admin", "temporary": false}]
    },
    {
      "id": "11111111-1111-1111-1111-111111111112",
      "username": "employee",
      "email": "employee@bankcore.local",
      "firstName": "BankCore",
      "lastName": "Employee",
      "enabled": true,
      "emailVerified": true,
      "realmRoles": ["EMPLOYEE"],
      "credentials": [{"type": "password", "value": "employee", "temporary": false}]
    },
    {
      "id": "11111111-1111-1111-1111-111111111113",
      "username": "employee2",
      "email": "employee2@bankcore.local",
      "firstName": "BankCore",
      "lastName": "Employee2",
      "enabled": true,
      "emailVerified": true,
      "realmRoles": ["EMPLOYEE"],
      "credentials": [{"type": "password", "value": "employee2", "temporary": false}]
    },
    {
      "id": "11111111-1111-1111-1111-111111111114",
      "username": "customer",
      "email": "customer@bankcore.local",
      "firstName": "BankCore",
      "lastName": "Customer",
      "enabled": true,
      "emailVerified": true,
      "realmRoles": ["CUSTOMER"],
      "credentials": [{"type": "password", "value": "customer", "temporary": false}]
    },
    {
      "id": "11111111-1111-1111-1111-111111111115",
      "username": "customer2",
      "email": "customer2@bankcore.local",
      "firstName": "BankCore",
      "lastName": "Customer2",
      "enabled": true,
      "emailVerified": true,
      "realmRoles": ["CUSTOMER"],
      "credentials": [{"type": "password", "value": "customer2", "temporary": false}]
    }
  ]
}' > /dev/null

echo "Setup complete!"
