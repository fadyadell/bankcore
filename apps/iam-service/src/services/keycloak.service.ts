import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { keycloakConfig } from '../config/keycloak.config';

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);

  constructor(
    @Inject(keycloakConfig.KEY)
    private readonly config: ConfigType<typeof keycloakConfig>,
  ) {}

  async getAdminToken(): Promise<string> {
    const tokenUrl = `${this.config.authServerUrl}/realms/master/protocol/openid-connect/token`;
    const params = new URLSearchParams();
    params.append('client_id', 'admin-cli');
    params.append('grant_type', 'password');
    params.append('username', this.config.adminUsername);
    params.append('password', this.config.adminPassword);

    try {
      // @ts-ignore
      const axios = require('axios').default || require('axios');
      const response = await axios.post(tokenUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return response.data.access_token;
    } catch (error: any) {
      this.logger.error('Failed to get admin token', error.response?.data || error.message);
      throw error;
    }
  }

  async createUser(email: string, firstName: string, lastName: string, password?: string): Promise<string> {
    this.logger.debug(`Creating user ${email} in Keycloak`);
    const token = await this.getAdminToken();
    const usersUrl = `${this.config.authServerUrl}/admin/realms/${this.config.realm}/users`;

    try {
      // @ts-ignore
      const axios = require('axios').default || require('axios');
      const response = await axios.post(
        usersUrl,
        {
          username: email,
          email,
          firstName,
          lastName,
          enabled: true,
          emailVerified: true,
          credentials: [
            {
              type: 'password',
              value: password || 'Customer@123',
              temporary: false,
            },
          ],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Get user ID from Location header
      const location = response.headers.location;
      if (location) {
        return location.split('/').pop() || `kc-${Date.now()}`;
      }

      // If location header is not present (e.g. proxy stripped it), find by email
      const getResponse = await axios.get(`${usersUrl}?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return getResponse.data[0]?.id || `kc-${Date.now()}`;
    } catch (error: any) {
      this.logger.error('Failed to create user in Keycloak', error.response?.data || error.message);
      if (error.response?.status === 409) {
        // User exists, find their ID
        // @ts-ignore
        const axios = require('axios').default || require('axios');
        const getResponse = await axios.get(`${usersUrl}?email=${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return getResponse.data[0]?.id || `kc-${Date.now()}`;
      }
      throw error;
    }
  }
}
