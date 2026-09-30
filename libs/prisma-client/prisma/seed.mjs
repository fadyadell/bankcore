import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const ids = {
  // DEV ONLY - Fixed IDs for local testing bridging Keycloak and PostgreSQL
  users: {
    admin: '11111111-1111-4111-a111-111111111111',
    employee: '11111111-1111-4111-a111-111111111112',
    employee2: '11111111-1111-4111-a111-111111111113',
    customer: '11111111-1111-4111-a111-111111111114',
    customer2: '11111111-1111-4111-a111-111111111115',
  },
  accounts: {
    adminOps: '22222222-2222-4222-a222-222222222221',
    customerSavings: '22222222-2222-4222-a222-222222222222',
  },
  transactions: {
    initialDeposit: '33333333-3333-4333-a333-333333333331',
  },
  sagas: {
    onboarding: '44444444-4444-4444-a444-444444444441',
    onboardingStep1: '55555555-5555-4555-a555-555555555551',
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
  const users = [
    { id: ids.users.admin, email: 'admin@bankcore.local', first: 'BankCore', last: 'Admin', phone: '+10000000001', role: 'ADMIN' },
    { id: ids.users.employee, email: 'employee@bankcore.local', first: 'BankCore', last: 'Employee', phone: '+10000000002', role: 'EMPLOYEE' },
    { id: ids.users.employee2, email: 'employee2@bankcore.local', first: 'BankCore', last: 'Employee2', phone: '+10000000003', role: 'EMPLOYEE' },
    { id: ids.users.customer, email: 'customer@bankcore.local', first: 'BankCore', last: 'Customer', phone: '+201000000001', role: 'CUSTOMER' },
    { id: ids.users.customer2, email: 'customer2@bankcore.local', first: 'BankCore', last: 'Customer2', phone: '+201000000002', role: 'CUSTOMER' },
  ];

  for (const u of users) {
    await prisma.user.create({
      data: {
        id: u.id,
        keycloakId: u.id, // DEV ONLY - Keycloak ID matches PostgreSQL UUID
        email: u.email,
        firstName: u.first,
        lastName: u.last,
        phone: u.phone,
        kycStatus: 'VERIFIED',
        status: 'ACTIVE',
        role: u.role,
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
    { id: '22222222-2222-4222-a222-222222222223', accNum: '1000000003', userId: ids.users.customer2, bal: '8500.00' },
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
    { id: '33333333-3333-4333-a333-333333333332', ref: 'TXN-INIT-000002', accId: '22222222-2222-4222-a222-222222222223', amt: '8500.00' },
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
      eventId: '66666666-6666-4666-a666-666666666661',
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
