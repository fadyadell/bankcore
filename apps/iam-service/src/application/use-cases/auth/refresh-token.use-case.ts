import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IDENTITY_PROVIDER } from '../../tokens.js';
import type { IdentityProviderPort } from '../../ports/identity-provider.port.js';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProviderPort,
  ) {}

  async execute(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const tokenResponse = await this.identityProvider.refreshToken(refreshToken);
      return {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresIn: tokenResponse.expires_in,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
