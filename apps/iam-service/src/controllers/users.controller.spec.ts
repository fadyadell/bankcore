import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { UsersService } from '../services/users.service.js';
import { CreateUserDto } from '../dto/user.dto.js';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            getProfile: jest.fn(),
            verifyIdentity: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create on users service', async () => {
    const dto: CreateUserDto = {
      email: 'test@test.com',
      password: 'password',
      firstName: 'John',
      lastName: 'Doe',
    };
    await controller.create(dto);
    expect(usersService.create).toHaveBeenCalledWith(dto);
  });

  it('should call getProfile on users service', async () => {
    const user = { id: '123', email: 'test@test.com', roles: [] };
    await controller.getProfile(user);
    expect(usersService.findById).toHaveBeenCalledWith(user.id);
  });
});
