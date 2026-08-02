import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../tokens.js';
import type { UserRepositoryPort } from '../../ports/user-repository.port.js';
import type { User } from '@prisma/client';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
