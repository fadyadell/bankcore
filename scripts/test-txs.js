const { PrismaClient } = require('./libs/database/generated/prisma');
const prisma = new PrismaClient();
async function main() {
  const account = await prisma.account.findFirst({
    where: { customerId: 'ddc852a6-1451-4500-8df2-92f430fcb291' }
  });
  console.log('Account:', account);
  const txs = await prisma.transaction.findMany({
    where: { OR: [{ creditAccountId: account.id }, { debitAccountId: account.id }] },
    orderBy: { createdAt: 'desc' }
  });
  console.log('Transactions:', txs);
}
main().finally(() => prisma.$disconnect());
