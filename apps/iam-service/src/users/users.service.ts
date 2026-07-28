import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@bankcore/prisma-client';
import type { User, KycStatus, UserStatus } from '@prisma/client';
import { KeycloakAdminService } from '../keycloak/keycloak-admin.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { CreateUserDto, UpdateUserDto } from './dto/user.dto.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly keycloak: KeycloakAdminService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const keycloakId = await this.keycloak.createUser({
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

    await this.keycloak.assignRealmRole(keycloakId, 'customer');

    const user = await this.prisma.user.create({
      data: {
        keycloakId,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        nationalId: dto.nationalId,
      },
    });

    await this.audit.log({
      userId: user.id,
      action: 'USER_CREATED',
      resource: 'user',
      resourceId: user.id,
      newValue: { email: user.email, firstName: user.firstName, lastName: user.lastName },
    });

    this.logger.log(`User created: ${user.email} (${user.id})`);
    return user;
  }

  async findAll(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return { users, total };
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { accounts: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByKeycloakId(keycloakId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { keycloakId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const existing = await this.findById(id);

    const updateData: Record<string, unknown> = {};
    if (dto.firstName) updateData['firstName'] = dto.firstName;
    if (dto.lastName) updateData['lastName'] = dto.lastName;
    if (dto.phone !== undefined) updateData['phone'] = dto.phone;
    if (dto.dateOfBirth) updateData['dateOfBirth'] = new Date(dto.dateOfBirth);
    if (dto.nationalId !== undefined) updateData['nationalId'] = dto.nationalId;
    if (dto.kycStatus) updateData['kycStatus'] = dto.kycStatus as KycStatus;
    if (dto.status) updateData['status'] = dto.status as UserStatus;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (dto.firstName || dto.lastName) {
      await this.keycloak.updateUser(existing.keycloakId, {
        username: existing.email,
        email: existing.email,
        firstName: dto.firstName || existing.firstName,
        lastName: dto.lastName || existing.lastName,
        enabled: true,
      });
    }

    await this.audit.log({
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
