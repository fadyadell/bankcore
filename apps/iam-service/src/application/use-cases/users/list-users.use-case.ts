import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../tokens';
import type { UserRepositoryPort } from '../../ports/user-repository.port';
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
