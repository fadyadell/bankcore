import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const ids = {
  users: {
    admin: '11111111-1111-1111-1111-111111111111',
    customer: '11111111-1111-1111-1111-111111111112',
  },
  accounts: {
    adminOps: '22222222-2222-2222-2222-222222222221',
    customerSavings: '22222222-2222-2222-2222-222222222222',
  },
  transactions: {
    initialDeposit: '33333333-3333-3333-3333-333333333331',
  },
  sagas: {
    onboarding: '44444444-4444-4444-4444-444444444441',
    onboardingStep1: '55555555-5555-5555-5555-555555555551',
  },
};

async function clearData() {
  await prisma.sagaStep.deleteMany();
  await prisma.sagaInstance.deleteMany();
  await prisma.inboxMessage.deleteMany();
  await prisma.outboxEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  await prisma.user.create({
    data: {
      id: ids.users.admin,
      keycloakId: 'kc-admin',
      email: 'admin@bankcore.local',
      firstName: 'BankCore',
      lastName: 'Admin',
      phone: '+10000000001',
      kycStatus: 'VERIFIED',
      status: 'ACTIVE',
    },
  });

  await prisma.user.create({
    data: {
      id: ids.users.customer,
      keycloakId: 'kc-customer-1',
      email: 'customer1@bankcore.local',
      firstName: 'Ava',
      lastName: 'Martinez',
      phone: '+10000000002',
      kycStatus: 'VERIFIED',
      status: 'ACTIVE',
    },
  });
}

async function seedAccounts() {
  await prisma.account.create({
    data: {
      id: ids.accounts.adminOps,
      accountNumber: '1000000001',
      userId: ids.users.admin,
      type: 'CURRENT',
      currency: 'USD',
      balance: new Prisma.Decimal('1000000.00'),
      availableBalance: new Prisma.Decimal('1000000.00'),
      status: 'ACTIVE',
    },
  });

  await prisma.account.create({
    data: {
      id: ids.accounts.customerSavings,
      accountNumber: '1000000002',
      userId: ids.users.customer,
      type: 'SAVINGS',
      currency: 'USD',
      balance: new Prisma.Decimal('5000.00'),
      availableBalance: new Prisma.Decimal('5000.00'),
      status: 'ACTIVE',
    },
  });
}

async function seedTransactionsAndLedger() {
  await prisma.transaction.create({
    data: {
      id: ids.transactions.initialDeposit,
      referenceNumber: 'TXN-INIT-000001',
      idempotencyKey: 'seed-txn-init-1',
      type: 'DEPOSIT',
      status: 'COMPLETED',
      amount: new Prisma.Decimal('5000.00'),
      currency: 'USD',
      description: 'Initial funded deposit for seeded customer account',
      creditAccountId: ids.accounts.customerSavings,
      processedAt: new Date(),
      metadata: {
        seeded: true,
        source: 'phase2-seed',
      },
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      transactionId: ids.transactions.initialDeposit,
      accountId: ids.accounts.customerSavings,
      entryType: 'CREDIT',
      amount: new Prisma.Decimal('5000.00'),
      balanceAfter: new Prisma.Decimal('5000.00'),
    },
  });
}

async function seedAuditAndNotifications() {
  await prisma.auditLog.create({
    data: {
      userId: ids.users.admin,
      action: 'SEED_INIT',
      resource: 'system',
      resourceId: 'phase2',
      newValue: {
        stage: 'phase2',
        seededAt: new Date().toISOString(),
      },
      ipAddress: '127.0.0.1',
      userAgent: 'prisma-seed-script',
    },
  });

  await prisma.notification.create({
    data: {
      userId: ids.users.customer,
      channel: 'EMAIL',
      type: 'WELCOME',
      subject: 'Welcome to BankCore',
      body: 'Your seeded foundation account is ready for integration testing.',
      status: 'SENT',
      sentAt: new Date(),
      metadata: {
        seeded: true,
      },
    },
  });
}

async function seedIntegrationPatterns() {
  await prisma.outboxEvent.create({
    data: {
      eventId: '66666666-6666-6666-6666-666666666661',
      aggregateType: 'Transaction',
      aggregateId: ids.transactions.initialDeposit,
      eventType: 'transaction.completed',
      payload: {
        transactionId: ids.transactions.initialDeposit,
        referenceNumber: 'TXN-INIT-000001',
        amount: '5000.00',
        currency: 'USD',
      },
      headers: {
        source: 'transaction-service',
        seeded: true,
      },
      status: 'PENDING',
      transactionId: ids.transactions.initialDeposit,
      correlationId: 'CORR-SEED-1',
      causationId: 'CAUSE-SEED-1',
    },
  });

  await prisma.inboxMessage.create({
    data: {
      messageId: 'MSG-SEED-1',
      source: 'kafka',
      topic: 'bankcore.transactions.completed',
      partition: 0,
      offset: '1',
      key: ids.transactions.initialDeposit,
      payload: {
        transactionId: ids.transactions.initialDeposit,
        eventType: 'transaction.completed',
      },
      headers: {
        seeded: true,
      },
      processedAt: new Date(),
    },
  });

  await prisma.sagaInstance.create({
    data: {
      id: ids.sagas.onboarding,
      sagaType: 'customer-onboarding',
      correlationId: 'SAGA-SEED-ONBOARDING-1',
      initiatorUserId: ids.users.admin,
      status: 'RUNNING',
      context: {
        customerId: ids.users.customer,
      },
      startedAt: new Date(),
      steps: {
        create: [
          {
            id: ids.sagas.onboardingStep1,
            stepName: 'create-primary-account',
            stepOrder: 1,
            status: 'COMPLETED',
            accountId: ids.accounts.customerSavings,
            requestPayload: {
              type: 'SAVINGS',
              currency: 'USD',
            },
            responsePayload: {
              accountId: ids.accounts.customerSavings,
            },
            startedAt: new Date(),
            completedAt: new Date(),
          },
        ],
      },
    },
  });
}

async function main() {
  await clearData();
  await seedUsers();
  await seedAccounts();
  await seedTransactionsAndLedger();
  await seedAuditAndNotifications();
  await seedIntegrationPatterns();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
