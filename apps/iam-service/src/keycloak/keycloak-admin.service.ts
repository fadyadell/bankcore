import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  session_state: string;
  scope: string;
}

interface KeycloakUserRepresentation {
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  credentials?: Array<{ type: string; value: string; temporary: boolean }>;
}

@Injectable()
export class KeycloakAdminService implements OnModuleInit {
  private readonly logger = new Logger(KeycloakAdminService.name);
  private readonly baseUrl: string;
  private readonly realm: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly adminUser: string;
  private readonly adminPassword: string;
  private adminToken: string | null = null;
  private tokenExpiry = 0;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('KEYCLOAK_BASE_URL', 'http://localhost:8080');
    this.realm = config.get<string>('KEYCLOAK_REALM', 'bankcore');
    this.clientId = config.get<string>('KEYCLOAK_CLIENT_ID', 'bankcore-api');
    this.clientSecret = config.get<string>('KEYCLOAK_CLIENT_SECRET', 'change-me-in-production');
    this.adminUser = config.get<string>('KEYCLOAK_ADMIN', 'admin');
    this.adminPassword = config.get<string>('KEYCLOAK_ADMIN_PASSWORD', 'admin');
  }

  async onModuleInit(): Promise<void> {
    this.logger.log(`Keycloak admin client initialized for realm: ${this.realm}`);
  }

  private async getAdminToken(): Promise<string> {
    if (this.adminToken && Date.now() < this.tokenExpiry) {
      return this.adminToken;
    }

    const url = `${this.baseUrl}/realms/master/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: 'admin-cli',
      username: this.adminUser,
      password: this.adminPassword,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get admin token: ${response.statusText}`);
    }

    const data = (await response.json()) as KeycloakTokenResponse;
    this.adminToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 30) * 1000;
    return this.adminToken;
  }

  async login(username: string, password: string): Promise<KeycloakTokenResponse> {
    const url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      username,
      password,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Login failed: ${error}`);
    }

    return (await response.json()) as KeycloakTokenResponse;
  }

  async refreshToken(refreshToken: string): Promise<KeycloakTokenResponse> {
    const url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    return (await response.json()) as KeycloakTokenResponse;
  }

  async logout(refreshToken: string): Promise<void> {
    const url = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/logout`;
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
    });

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  }

  async createUser(user: KeycloakUserRepresentation): Promise<string> {
    const token = await this.getAdminToken();
    const url = `${this.baseUrl}/admin/realms/${this.realm}/users`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create Keycloak user: ${error}`);
    }

    const locationHeader = response.headers.get('Location');
    if (!locationHeader) {
      throw new Error('No location header in Keycloak create user response');
    }

    return locationHeader.split('/').pop() || '';
  }

  async getUserByEmail(email: string): Promise<KeycloakUserRepresentation | null> {
    const token = await this.getAdminToken();
    const url = `${this.baseUrl}/admin/realms/${this.realm}/users?email=${encodeURIComponent(email)}&exact=true`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to get Keycloak user: ${response.statusText}`);
    }

    const users = (await response.json()) as KeycloakUserRepresentation[];
    return users.length > 0 ? users[0] : null;
  }

  async updateUser(
    keycloakId: string,
    updates: Partial<KeycloakUserRepresentation>,
  ): Promise<void> {
    const token = await this.getAdminToken();
    const url = `${this.baseUrl}/admin/realms/${this.realm}/users/${keycloakId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update Keycloak user: ${response.statusText}`);
    }
  }

  async assignRealmRole(keycloakId: string, roleName: string): Promise<void> {
    const token = await this.getAdminToken();

    const roleUrl = `${this.baseUrl}/admin/realms/${this.realm}/roles/${roleName}`;
    const roleResponse = await fetch(roleUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!roleResponse.ok) {
      throw new Error(`Role ${roleName} not found`);
    }

    const role = await roleResponse.json();

    const url = `${this.baseUrl}/admin/realms/${this.realm}/users/${keycloakId}/role-mappings/realm`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify([role]),
    });

    if (!response.ok) {
      throw new Error(`Failed to assign role: ${response.statusText}`);
    }
  }
}
