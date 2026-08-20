import { registerAs } from '@nestjs/config';

export const keycloakConfig = registerAs('keycloak', () => ({
  authServerUrl: process.env['KEYCLOAK_URL'] || 'http://localhost:8080',
  realm: process.env['KEYCLOAK_REALM'] || 'bankcore',
  clientId: process.env['KEYCLOAK_CLIENT_ID'] || 'bankcore-web',
  clientSecret: process.env['KEYCLOAK_CLIENT_SECRET'] !== undefined ? process.env['KEYCLOAK_CLIENT_SECRET'] : '',
  adminUsername: process.env['KEYCLOAK_ADMIN_USERNAME'] || 'admin',
  adminPassword: process.env['KEYCLOAK_ADMIN_PASSWORD'] || 'admin',
}));
