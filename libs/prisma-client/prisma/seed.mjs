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

  const customers = [
    { id: ids.users.customer, kc: 'kc-customer-1', email: 'ahmed@bankcore.local', first: 'Ahmed', last: 'Hassan', phone: '+201000000001' },
    { id: '11111111-1111-1111-1111-111111111113', kc: 'kc-customer-2', email: 'fady@bankcore.local', first: 'Fady', last: 'Adel', phone: '+201000000002' },
    { id: '11111111-1111-1111-1111-111111111114', kc: 'kc-customer-3', email: 'sara@bankcore.local', first: 'Sara', last: 'Tarek', phone: '+201000000003' },
    { id: '11111111-1111-1111-1111-111111111115', kc: 'kc-customer-4', email: 'mona@bankcore.local', first: 'Mona', last: 'Zaki', phone: '+201000000004' },
    { id: '11111111-1111-1111-1111-111111111116', kc: 'kc-customer-5', email: 'youssef@bankcore.local', first: 'Youssef', last: 'Ali', phone: '+201000000005' },
  ];

  for (const c of customers) {
    await prisma.user.create({
      data: {
        id: c.id,
        keycloakId: c.kc,
        email: c.email,
        firstName: c.first,
        lastName: c.last,
        phone: c.phone,
        kycStatus: 'VERIFIED',
        status: 'ACTIVE',
      },
    });
  }
}

async function seedAccounts() {
  await prisma.account.create({
    data: {
      id: ids.accounts.adminOps,
      accountNumber: '1000000001',
      userId: ids.users.admin,
      type: 'CURRENT',
      currency: 'EGP',
      balance: new Prisma.Decimal('10000000.00'),
      availableBalance: new Prisma.Decimal('10000000.00'),
      status: 'ACTIVE',
    },
  });

  const accounts = [
    { id: ids.accounts.customerSavings, accNum: '1000000002', userId: ids.users.customer, bal: '25430.00' },
    { id: '22222222-2222-2222-2222-222222222223', accNum: '1000000003', userId: '11111111-1111-1111-1111-111111111113', bal: '8500.00' },
    { id: '22222222-2222-2222-2222-222222222224', accNum: '1000000004', userId: '11111111-1111-1111-1111-111111111114', bal: '42000.00' },
    { id: '22222222-2222-2222-2222-222222222225', accNum: '1000000005', userId: '11111111-1111-1111-1111-111111111115', bal: '1500.00' },
    { id: '22222222-2222-2222-2222-222222222226', accNum: '1000000006', userId: '11111111-1111-1111-1111-111111111116', bal: '112000.00' },
  ];

  for (const a of accounts) {
    await prisma.account.create({
      data: {
        id: a.id,
        accountNumber: a.accNum,
        userId: a.userId,
        type: 'SAVINGS',
        currency: 'EGP',
        balance: new Prisma.Decimal(a.bal),
        availableBalance: new Prisma.Decimal(a.bal),
        status: 'ACTIVE',
      },
    });
  }
}

async function seedTransactionsAndLedger() {
  const transactions = [
    { id: ids.transactions.initialDeposit, ref: 'TXN-INIT-000001', accId: ids.accounts.customerSavings, amt: '25430.00' },
    { id: '33333333-3333-3333-3333-333333333332', ref: 'TXN-INIT-000002', accId: '22222222-2222-2222-2222-222222222223', amt: '8500.00' },
    { id: '33333333-3333-3333-3333-333333333333', ref: 'TXN-INIT-000003', accId: '22222222-2222-2222-2222-222222222224', amt: '42000.00' },
    { id: '33333333-3333-3333-3333-333333333334', ref: 'TXN-INIT-000004', accId: '22222222-2222-2222-2222-222222222225', amt: '1500.00' },
    { id: '33333333-3333-3333-3333-333333333335', ref: 'TXN-INIT-000005', accId: '22222222-2222-2222-2222-222222222226', amt: '112000.00' },
  ];

  for (const t of transactions) {
    await prisma.transaction.create({
      data: {
        id: t.id,
        referenceNumber: t.ref,
        idempotencyKey: 'seed-' + t.ref,
        type: 'DEPOSIT',
        status: 'COMPLETED',
        amount: new Prisma.Decimal(t.amt),
        currency: 'EGP',
        description: 'Initial funded deposit',
        creditAccountId: t.accId,
        processedAt: new Date(),
        metadata: { seeded: true, source: 'phase2-seed' },
      },
    });

    await prisma.ledgerEntry.create({
      data: {
        transactionId: t.id,
        accountId: t.accId,
        entryType: 'CREDIT',
        amount: new Prisma.Decimal(t.amt),
        balanceAfter: new Prisma.Decimal(t.amt),
      },
    });
  }
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
