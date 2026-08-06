import { Injectable } from '@nestjs/common';
import { PrismaService } from '@bankcore/database';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByKeycloakId(keycloakId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { keycloakId } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async findAll(skip?: number, take?: number): Promise<[User[], number]> {
    return Promise.all([this.prisma.user.findMany({ skip, take }), this.prisma.user.count()]);
  }
}
