import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../tokens';
import type { UserRepositoryPort } from '../../ports/user-repository.port';
import type { User } from '@prisma/client';

@Injectable()
export class GetUserByKeycloakIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(keycloakId: string): Promise<User> {
    const user = await this.userRepository.findByKeycloakId(keycloakId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
