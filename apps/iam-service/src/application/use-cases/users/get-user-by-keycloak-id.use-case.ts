import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../tokens';
import type { UserRepositoryPort } from '../../ports/user-repository.port';
import type { User } from '@prisma/client';
import { RedisCacheService } from '@bankcore/cache';

@Injectable()
export class GetUserByKeycloakIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    private readonly cacheService: RedisCacheService,
  ) {}

  async execute(keycloakId: string): Promise<User> {
    const cacheKey = `user:${keycloakId}`;
    const cachedUser = await this.cacheService.get<User>(cacheKey);
    
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepository.findByKeycloakId(keycloakId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.cacheService.set(cacheKey, user, 3600); // cache for 1 hour

    return user;
  }
}
