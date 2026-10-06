import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing to avoid conflicts on re-seed
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding initial data...');

  const hash = (pw: string) => bcryptjs.hashSync(pw, 10);

  // Create Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@bankcore.local',
      passwordHash: hash('admin123'),
      firstName: 'Alice',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // Create Employee user
  const employee = await prisma.user.create({
    data: {
      email: 'employee@bankcore.local',
      passwordHash: hash('employee123'),
      firstName: 'Eve',
      lastName: 'Employee',
      role: 'EMPLOYEE',
    },
  });
  console.log(`Created employee: ${employee.email}`);

  // Create Customer user with accounts
  const customer = await prisma.user.create({
    data: {
      email: 'customer@bankcore.local',
      passwordHash: hash('customer123'),
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
      accounts: {
        create: [
          {
            type: 'CHECKING',
            balance: 5000.0,
            currency: 'USD',
            status: 'ACTIVE',
          },
          {
            type: 'SAVINGS',
            balance: 12500.0,
            currency: 'USD',
            status: 'ACTIVE',
          },
        ],
      },
    },
    include: { accounts: true },
  });
  console.log(`Created customer: ${customer.email} with ${customer.accounts.length} accounts`);

  // Create a second customer
  const customer2 = await prisma.user.create({
    data: {
      email: 'jane@bankcore.local',
      passwordHash: hash('customer123'),
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'CUSTOMER',
      accounts: {
        create: [
          {
            type: 'CHECKING',
            balance: 3200.0,
            currency: 'USD',
            status: 'ACTIVE',
          },
        ],
      },
    },
    include: { accounts: true },
  });
  console.log(`Created customer: ${customer2.email}`);

  // Create some transactions
  const checkingAccount = customer.accounts.find((a: any) => a.type === 'CHECKING')!;
  const savingsAccount = customer.accounts.find((a: any) => a.type === 'SAVINGS')!;

  await prisma.transaction.createMany({
    data: [
      {
        toAccountId: checkingAccount.id,
        amount: 2000.0,
        currency: 'USD',
        type: 'DEPOSIT',
        status: 'COMPLETED',
        reference: 'Initial deposit',
      },
      {
        fromAccountId: checkingAccount.id,
        amount: 150.0,
        currency: 'USD',
        type: 'WITHDRAWAL',
        status: 'COMPLETED',
        reference: 'ATM withdrawal',
      },
      {
        fromAccountId: checkingAccount.id,
        toAccountId: savingsAccount.id,
        amount: 500.0,
        currency: 'USD',
        type: 'TRANSFER',
        status: 'COMPLETED',
        reference: 'Monthly savings',
      },
    ],
  });
  console.log('Created sample transactions');

  // Create a loan
  await prisma.loan.create({
    data: {
      userId: customer.id,
      amount: 15000.0,
      interestRate: 5.5,
      termMonths: 36,
      status: 'PENDING',
    },
  });
  console.log('Created sample loan');

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        type: 'EMAIL',
        title: 'Welcome to BankCore',
        message: 'Your account has been created successfully. Welcome aboard!',
        status: 'UNREAD',
      },
      {
        userId: customer.id,
        type: 'PUSH',
        title: 'Transaction Alert',
        message: 'A deposit of $2,000.00 was made to your checking account.',
        status: 'READ',
      },
      {
        userId: employee.id,
        type: 'EMAIL',
        title: 'New Loan Application',
        message: 'A new loan application has been submitted for review.',
        status: 'UNREAD',
      },
    ],
  });
  console.log('Created sample notifications');

  console.log('\n✅ Seed completed successfully!');
  console.log('\nTest Credentials:');
  console.log('  Admin:    admin@bankcore.local / admin123');
  console.log('  Employee: employee@bankcore.local / employee123');
  console.log('  Customer: customer@bankcore.local / customer123');
  console.log('  Customer: jane@bankcore.local / customer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
