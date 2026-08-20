import { Injectable } from '@nestjs/common';
import { PrismaService } from '@bankcore/prisma-client';
import type { User } from '@prisma/client';
import type {
  CreateUserInput,
  UpdateUserInput,
  UserRepositoryPort,
} from '../../application/ports/user-repository.port';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { accounts: true },
    });
  }

  findByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { keycloakId } });
  }

  create(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        keycloakId: input.keycloakId,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        dateOfBirth: input.dateOfBirth,
        nationalId: input.nationalId,
      },
    });
  }

  update(id: string, input: UpdateUserInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: input,
    });
  }

  list(page: number, limit: number): Promise<{ users: User[]; total: number }> {
    return Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]).then(([users, total]) => ({ users, total }));
  }
}
