import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { AuthService } from '../services/auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { RefreshDto } from '../dto/refresh.dto.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call login on auth service', async () => {
    const dto: LoginDto = { email: 'test@test.com', password: 'password' };
    await controller.login(dto);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should call refresh token on auth service', async () => {
    const dto: RefreshDto = { refreshToken: 'token' };
    await controller.refresh(dto);
    expect(authService.refreshToken).toHaveBeenCalledWith(dto);
  });
});
