import { registerAs } from '@nestjs/config';

export const keycloakConfig = registerAs('keycloak', () => ({
  authServerUrl: process.env['KEYCLOAK_AUTH_SERVER_URL'] || 'http://localhost:8080',
  realm: process.env['KEYCLOAK_REALM'] || 'bankcore',
  clientId: process.env['KEYCLOAK_CLIENT_ID'] || 'bankcore-client',
  clientSecret: process.env['KEYCLOAK_CLIENT_SECRET'] || 'secret',
  adminUsername: process.env['KEYCLOAK_ADMIN_USERNAME'] || 'admin',
  adminPassword: process.env['KEYCLOAK_ADMIN_PASSWORD'] || 'admin',
}));
