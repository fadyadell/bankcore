import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import { KeycloakService } from './keycloak.service.js';
import { CreateUserDto } from '../dto/user.dto.js';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;
  let keycloakService: KeycloakService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: KeycloakService,
          useValue: {
            getAdminToken: jest.fn().mockResolvedValue('token'),
            createUser: jest.fn().mockResolvedValue('keycloak-id'),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
    keycloakService = module.get<KeycloakService>(KeycloakService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto: CreateUserDto = {
        email: 'test@test.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      };
      const createdUser = { id: '123', ...dto };
      jest.spyOn(userRepository, 'create').mockResolvedValue(createdUser as any);

      const result = await service.create(dto);
      expect(result).toEqual(createdUser);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: dto.email }),
      );
    });
  });
});
