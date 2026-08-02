import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AUDIT_WRITER, IDENTITY_PROVIDER, USER_REPOSITORY } from '../../tokens.js';
import type { AuditWriterPort } from '../../ports/audit-writer.port.js';
import type { IdentityProviderPort } from '../../ports/identity-provider.port.js';
import type { UserRepositoryPort } from '../../ports/user-repository.port.js';
import type { UpdateUserDto } from '../../../users/dto/user.dto.js';
import type { User, KycStatus, UserStatus } from '@prisma/client';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(IDENTITY_PROVIDER)
    private readonly identityProvider: IdentityProviderPort,
    @Inject(AUDIT_WRITER)
    private readonly auditWriter: AuditWriterPort,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updateData: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      dateOfBirth?: Date | null;
      nationalId?: string | null;
      kycStatus?: KycStatus;
      status?: UserStatus;
    } = {};
    if (dto.firstName) updateData['firstName'] = dto.firstName;
    if (dto.lastName) updateData['lastName'] = dto.lastName;
    if (dto.phone !== undefined) updateData['phone'] = dto.phone || null;
    if (dto.dateOfBirth !== undefined) {
      updateData['dateOfBirth'] = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }
    if (dto.nationalId !== undefined) updateData['nationalId'] = dto.nationalId || null;
    if (dto.kycStatus) updateData['kycStatus'] = dto.kycStatus as KycStatus;
    if (dto.status) updateData['status'] = dto.status as UserStatus;

    const user = await this.userRepository.update(id, updateData);

    if (dto.firstName || dto.lastName) {
      await this.identityProvider.updateUser(existing.keycloakId, {
        username: existing.email,
        email: existing.email,
        firstName: dto.firstName || existing.firstName,
        lastName: dto.lastName || existing.lastName,
        enabled: true,
      });
    }

    await this.auditWriter.log({
      userId: id,
      action: 'USER_UPDATED',
      resource: 'user',
      resourceId: id,
      oldValue: { firstName: existing.firstName, lastName: existing.lastName },
      newValue: updateData,
    });

    return user;
  }
}
