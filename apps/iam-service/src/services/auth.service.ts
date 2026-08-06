import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import { UsersService } from './users.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { RefreshDto } from '../dto/refresh.dto.js';
import { jwtConfig } from '../config/jwt.config.js';
import { CurrentUser } from '../common/current-user.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // In a real implementation, we would verify the password against Keycloak
    // For this example, we assume success.

    const payload: CurrentUser = {
      id: user.id,
      email: user.email,
      roles: ['user'], // This should come from Keycloak
    };

    return this.generateTokens(payload);
  }

  async refreshToken(refreshDto: RefreshDto) {
    try {
      const decoded = await this.jwtService.verifyAsync<CurrentUser>(refreshDto.refreshToken, {
        secret: this.config.refreshSecret,
      });

      // Optionally, check if user is still active in DB/Keycloak
      const user = await this.usersService.findById(decoded.id);
      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User is inactive');
      }

      return this.generateTokens({
        id: user.id,
        email: user.email,
        roles: decoded.roles,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, token: string) {
    // Invalidate token logic (e.g., store in Redis blacklist) or revoke in Keycloak
    return { success: true };
  }

  private generateTokens(payload: CurrentUser) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.secret,
      expiresIn: parseInt(this.config.expiresIn, 10) || 900,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.refreshSecret,
      expiresIn: parseInt(this.config.refreshExpiresIn, 10) || 604800,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
