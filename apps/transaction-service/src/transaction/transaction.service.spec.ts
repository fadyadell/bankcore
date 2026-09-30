import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from '@bankcore/database';
import { AuditLogService } from '@bankcore/common';
import { KafkaProducerService } from '@bankcore/kafka';
import { LedgerService } from '../ledger/ledger.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('TransactionService', () => {
  let service: TransactionService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
      transaction: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaService)),
      $queryRaw: jest.fn(),
      account: {
        findUnique: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: prismaService },
        { provide: AuditLogService, useValue: { log: jest.fn() } },
        { provide: KafkaProducerService, useValue: { publish: jest.fn() } },
        { provide: LedgerService, useValue: { } },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should throw ForbiddenException if account does not belong to user', async () => {
    prismaService.user.findUnique.mockResolvedValue({ id: 'user-1' } as any);
    
    // Simulate raw query returning the mapped 'userId' correctly
    (prismaService.$queryRaw as jest.Mock).mockResolvedValue([
      { id: 'acc-1', userId: 'user-2', balance: 1000 }
    ]);

    await expect(service.createTransaction({ fromAccountId: 'acc-1', toAccountId: 'acc-2', amount: 100 }, { sub: 'kc-1' } as any))
      .rejects.toThrow(ForbiddenException);
  });

  it('should succeed if account belongs to user', async () => {
    prismaService.user.findUnique.mockResolvedValue({ id: 'user-1' } as any);
    
    // Simulate raw query returning the mapped 'userId' correctly
    (prismaService.$queryRaw as jest.Mock).mockResolvedValue([
      { id: 'acc-1', userId: 'user-1', balance: 1000 }
    ]);
    prismaService.account.findUnique.mockResolvedValue({ id: 'acc-2' } as any);
    (prismaService.transaction.create as jest.Mock) = jest.fn().mockResolvedValue({ id: 'txn-1' });

    const result = await service.createTransaction({ fromAccountId: 'acc-1', toAccountId: 'acc-2', amount: 100 }, { sub: 'kc-1' } as any);
    expect(result.id).toBe('txn-1');
  });
});
