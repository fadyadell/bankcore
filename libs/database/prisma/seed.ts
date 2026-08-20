import { PrismaClient, UserRole, AccountType, AccountStatus } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Fetch Keycloak users to link them properly
  const tokenRes = await fetch('http://127.0.0.1:8180/realms/master/protocol/openid-connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'client_id=admin-cli&username=admin&password=admin&grant_type=password'
  });
  
  if (!tokenRes.ok) {
    throw new Error('Failed to fetch Keycloak token. Ensure Keycloak is running and initialized.');
  }
  
  const { access_token } = await tokenRes.json();
  const usersRes = await fetch('http://127.0.0.1:8180/admin/realms/bankcore/users', {
    headers: { 'Authorization': 'Bearer ' + access_token }
  });
  
  if (!usersRes.ok) {
    throw new Error('Failed to fetch Keycloak users.');
  }

  const kcUsers = await usersRes.json();

  const getKcUser = (username: string) => {
    const user = kcUsers.find((u: any) => u.username === username);
    if (!user) throw new Error(`Keycloak user ${username} not found!`);
    return user;
  };

  const adminKc = getKcUser('admin');
  const employeeKc = getKcUser('employee');
  const customerKc = getKcUser('customer');

  // 2. Create Users
  await prisma.user.upsert({
    where: { email: 'admin@bankcore.local' },
    update: { keycloakId: adminKc.id },
    create: {
      email: 'admin@bankcore.local',
      keycloakId: adminKc.id,
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'employee@bankcore.local' },
    update: { keycloakId: employeeKc.id },
    create: {
      email: 'employee@bankcore.local',
      keycloakId: employeeKc.id,
      role: UserRole.EMPLOYEE,
      employee: {
        create: {
          employeeNumber: 'EMP-001',
          department: 'Operations',
        }
      }
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@bankcore.local' },
    update: { keycloakId: customerKc.id },
    create: {
      email: 'customer@bankcore.local',
      keycloakId: customerKc.id,
      role: UserRole.CUSTOMER,
      customer: {
        create: {
          nationalId: '12345678901234',
          phone: '+1234567890',
          address: '123 Tech Avenue, Innovation City',
        }
      }
    },
    include: { customer: true }
  });

  // 3. Create Accounts for Customer
  if (customer.customer) {
    const checkingAccount = await prisma.account.upsert({
      where: { accountNumber: 'CHK-0001' },
      update: {},
      create: {
        customerId: customer.customer.id,
        accountNumber: 'CHK-0001',
        type: AccountType.CHECKING,
        balance: 15000.50,
        availableBalance: 15000.50,
        status: AccountStatus.ACTIVE,
      }
    });

    const savingsAccount = await prisma.account.upsert({
      where: { accountNumber: 'SAV-0001' },
      update: {},
      create: {
        customerId: customer.customer.id,
        accountNumber: 'SAV-0001',
        type: AccountType.SAVINGS,
        balance: 50000.00,
        availableBalance: 50000.00,
        status: AccountStatus.ACTIVE,
      }
    });
    
    console.log(`Created/Verified accounts for customer: ${checkingAccount.accountNumber}, ${savingsAccount.accountNumber}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
