import { Injectable } from '@nestjs/common';
import { LoginUseCase } from '../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/auth/logout.use-case';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  async login(username: string, password: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }> {
    return this.loginUseCase.execute(username, password);
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    return this.refreshTokenUseCase.execute(refreshToken);
  }

  async logout(refreshToken: string): Promise<void> {
    return this.logoutUseCase.execute(refreshToken);
  }
}
