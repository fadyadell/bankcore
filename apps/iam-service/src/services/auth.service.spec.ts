import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { UsersService } from './users.service.js';
import { jwtConfig } from '../config/jwt.config.js';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto.js';
import { RefreshDto } from '../dto/refresh.dto.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            validateUser: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            secret: 'test-secret',
            expiresIn: '15m',
            refreshSecret: 'test-refresh-secret',
            refreshExpiresIn: '7d',
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if validation fails', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      const dto: LoginDto = { email: 'test@test.com', password: 'password' };
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens if validation succeeds', async () => {
      const user = { id: '123', email: 'test@test.com', roles: [] };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user as any);
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const dto: LoginDto = { email: 'test@test.com', password: 'password' };
      const result = await service.login(dto);

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const dto: RefreshDto = { refreshToken: 'invalid' };
      await expect(service.refreshToken(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return new tokens if token is valid', async () => {
      const payload = { id: '123', email: 'test@test.com', roles: [] };
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload as any);
      jest
        .spyOn(usersService, 'findById')
        .mockResolvedValue({ id: '123', email: 'test@test.com', status: 'ACTIVE' } as any);
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const dto: RefreshDto = { refreshToken: 'valid' };
      const result = await service.refreshToken(dto);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });
  });
});
