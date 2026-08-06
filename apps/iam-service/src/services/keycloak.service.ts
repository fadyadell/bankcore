import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { keycloakConfig } from '../config/keycloak.config.js';

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);

  constructor(
    @Inject(keycloakConfig.KEY)
    private readonly config: ConfigType<typeof keycloakConfig>,
  ) {}

  async getAdminToken(): Promise<string> {
    // In a real scenario, this would authenticate against Keycloak with client_credentials
    // and return an access token.
    this.logger.debug(`Fetching admin token from Keycloak at ${this.config.authServerUrl}`);
    return 'mock-admin-token';
  }

  async createUser(email: string, firstName: string, lastName: string): Promise<string> {
    this.logger.debug(`Creating user ${email} in Keycloak`);
    // Simulated Keycloak ID
    return `kc-${Date.now()}`;
  }
}
