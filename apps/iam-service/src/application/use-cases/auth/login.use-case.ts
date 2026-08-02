import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUDIT_WRITER, IDENTITY_PROVIDER } from '../../tokens.js';
import type { AuditWriterPort } from '../../ports/audit-writer.port.js';
import type { IdentityProviderPort } from '../../ports/identity-provider.port.js';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProviderPort,
    @Inject(AUDIT_WRITER)
    private readonly auditWriter: AuditWriterPort,
  ) {}

  async execute(username: string, password: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }> {
    try {
      const tokenResponse = await this.identityProvider.login(username, password);

      await this.auditWriter.log({
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
    } catch {
      await this.auditWriter.log({
        action: 'LOGIN_FAILED',
        resource: 'auth',
        resourceId: username,
      });

      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
