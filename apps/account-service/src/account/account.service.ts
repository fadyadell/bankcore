import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@bankcore/prisma-client';
import { PaginationDto, JwtPayload } from '@bankcore/common';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveCustomerUserId(keycloakSub: string) {
    return this.prisma.user.findUnique({ where: { keycloakId: keycloakSub } });
  }

  async getMyAccounts(currentUser: JwtPayload) {
    const userDb = await this.resolveCustomerUserId(currentUser.sub);
    if (!userDb) {
      throw new ForbiddenException('User is not a registered customer');
    }

    return this.prisma.account.findMany({
      where: { userId: userDb.id },
      include: {
        debitTransactions: { take: 5, orderBy: { createdAt: 'desc' } },
        creditTransactions: { take: 5, orderBy: { createdAt: 'desc' } },
      }
    });
  }

  async createAccount(currentUser: JwtPayload, dto: any) {
    const userDb = await this.resolveCustomerUserId(currentUser.sub);
    if (!userDb) {
      throw new ForbiddenException('User is not a registered customer');
    }

    // Generate random 10 digit account number
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    return this.prisma.account.create({
      data: {
        userId: userDb.id,
        accountNumber,
        type: dto.type || 'SAVINGS',
        currency: dto.currency || 'EGP',
        status: 'ACTIVE',
        balance: 0,
        availableBalance: 0,
      }
    });
  }

  async getAccount(id: string, currentUser: JwtPayload, pagination: PaginationDto) {
    const account = await this.prisma.account.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const roles = currentUser.realm_access?.roles || [];
    const isEmployeeOrAdmin = roles.includes('employee') || roles.includes('admin');

    if (!isEmployeeOrAdmin) {
      const userDb = await this.resolveCustomerUserId(currentUser.sub);
      if (!userDb || account.userId !== userDb.id) {
        throw new ForbiddenException('You do not have access to this account');
      }
    }

    const skip = ((pagination.page || 1) - 1) * (pagination.limit || 20);
    const take = pagination.limit || 20;

    const outgoingTransactions = await this.prisma.transaction.findMany({
      where: { debitAccountId: id },
      skip, take, orderBy: { createdAt: 'desc' }
    });
    
    const incomingTransactions = await this.prisma.transaction.findMany({
      where: { creditAccountId: id },
      skip, take, orderBy: { createdAt: 'desc' }
    });

    return {
      ...account,
      outgoingTransactions,
      incomingTransactions,
    };
  }

  async getAllAccounts(pagination: PaginationDto) {
    const skip = ((pagination.page || 1) - 1) * (pagination.limit || 20);
    const take = pagination.limit || 20;

    return this.prisma.account.findMany({
      skip,
      take,
      include: { user: true },
    });
  }
}
