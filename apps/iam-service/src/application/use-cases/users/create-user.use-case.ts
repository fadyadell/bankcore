import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { AUDIT_WRITER, IDENTITY_PROVIDER, USER_REPOSITORY } from '../../tokens';
import type { AuditWriterPort } from '../../ports/audit-writer.port';
import type { IdentityProviderPort } from '../../ports/identity-provider.port';
import type { UserRepositoryPort } from '../../ports/user-repository.port';
import type { CreateUserDto } from '../../../users/dto/user.dto';
import type { User } from '@prisma/client';

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProviderPort,
    @Inject(AUDIT_WRITER)
    private readonly auditWriter: AuditWriterPort,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const keycloakId = await this.identityProvider.createUser({
      username: dto.email,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      enabled: true,
      credentials: [
        {
          type: 'password',
          value: dto.password,
          temporary: false,
        },
      ],
    });

    await this.identityProvider.assignRealmRole(keycloakId, 'customer');

    const user = await this.userRepository.create({
      keycloakId,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      nationalId: dto.nationalId,
    });

    await this.auditWriter.log({
      userId: user.id,
      action: 'USER_CREATED',
      resource: 'user',
      resourceId: user.id,
      newValue: { email: user.email, firstName: user.firstName, lastName: user.lastName },
    });

    this.logger.log(`User created: ${user.email} (${user.id})`);
    return user;
  }
}
