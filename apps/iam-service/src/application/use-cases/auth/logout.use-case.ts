import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_WRITER, IDENTITY_PROVIDER } from '../../tokens.js';
import type { AuditWriterPort } from '../../ports/audit-writer.port.js';
import type { IdentityProviderPort } from '../../ports/identity-provider.port.js';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProviderPort,
    @Inject(AUDIT_WRITER)
    private readonly auditWriter: AuditWriterPort,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    await this.identityProvider.logout(refreshToken);

    await this.auditWriter.log({
      action: 'LOGOUT',
      resource: 'auth',
    });
  }
}
