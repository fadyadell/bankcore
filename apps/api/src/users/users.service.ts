import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService, Prisma, User } from '@bankcore/database';
import * as bcryptjs from 'bcryptjs';
import type { UserDto, UserRole, PaginatedResponse } from '@bankcore/contracts';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 20,
    search?: string,
    role?: string,
  ): Promise<PaginatedResponse<UserDto>> {
    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map((u) => this.toDto(u)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.toDto(user);
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }): Promise<UserDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcryptjs.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
    });
    return this.toDto(user);
  }

  async update(
    id: string,
    data: { firstName?: string; lastName?: string; role?: string },
  ): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.toDto(updated);
  }

  async delete(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Delete all related data first
    await this.prisma.notification.deleteMany({ where: { userId: id } });
    await this.prisma.loan.deleteMany({ where: { userId: id } });

    // Delete transactions related to user's accounts
    const accounts = await this.prisma.account.findMany({
      where: { userId: id },
    });
    const accountIds = accounts.map((a) => a.id);
    if (accountIds.length > 0) {
      await this.prisma.transaction.deleteMany({
        where: {
          OR: [
            { fromAccountId: { in: accountIds } },
            { toAccountId: { in: accountIds } },
          ],
        },
      });
    }

    await this.prisma.account.deleteMany({ where: { userId: id } });
    await this.prisma.user.delete({ where: { id } });
  }

  private toDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
