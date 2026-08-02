import { Injectable } from '@nestjs/common';
import type { CreateUserDto, UpdateUserDto } from './dto/user.dto.js';
import { CreateUserUseCase } from '../application/use-cases/users/create-user.use-case.js';
import { ListUsersUseCase } from '../application/use-cases/users/list-users.use-case.js';
import { GetUserUseCase } from '../application/use-cases/users/get-user.use-case.js';
import { GetUserByKeycloakIdUseCase } from '../application/use-cases/users/get-user-by-keycloak-id.use-case.js';
import { UpdateUserUseCase } from '../application/use-cases/users/update-user.use-case.js';
import type { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUserByKeycloakIdUseCase: GetUserByKeycloakIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    return this.createUserUseCase.execute(dto);
  }

  async findAll(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    return this.listUsersUseCase.execute(page, limit);
  }

  async findById(id: string): Promise<User> {
    return this.getUserUseCase.execute(id);
  }

  async findByKeycloakId(keycloakId: string): Promise<User> {
    return this.getUserByKeycloakIdUseCase.execute(keycloakId);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    return this.updateUserUseCase.execute(id, dto);
  }
}
