import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../tokens.js';
import type { UserRepositoryPort } from '../../ports/user-repository.port.js';
import type { User } from '@prisma/client';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  execute(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    return this.userRepository.list(page, limit);
  }
}
