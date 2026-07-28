import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { KeycloakAdminService } from '../keycloak/keycloak-admin.service.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly keycloak: KeycloakAdminService,
    private readonly audit: AuditService,
  ) {}

  async login(username: string, password: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }> {
    try {
      const tokenResponse = await this.keycloak.login(username, password);

      await this.audit.log({
        action: 'LOGIN',
        resource: 'auth',
        resourceId: username,
      });

      return {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresIn: tokenResponse.expires_in,
        tokenType: tokenResponse.token_type,
      };
    } catch (error) {
      this.logger.warn(`Login failed for user: ${username}`);

      await this.audit.log({
        action: 'LOGIN_FAILED',
        resource: 'auth',
        resourceId: username,
      });

      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const tokenResponse = await this.keycloak.refreshToken(refreshToken);
      return {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresIn: tokenResponse.expires_in,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.keycloak.logout(refreshToken);

    await this.audit.log({
      action: 'LOGOUT',
      resource: 'auth',
    });
  }
}
