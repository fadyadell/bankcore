const { PrismaClient } = require('./libs/database/generated/prisma');
const prisma = new PrismaClient();
async function main() {
  const tx = await prisma.transaction.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log('Last Transaction:', tx);
  
  if (tx && tx.debitAccountId) {
    const from = await prisma.account.findUnique({ where: { id: tx.debitAccountId }});
    console.log('Debit Account:', from);
  }
  if (tx && tx.creditAccountId) {
    const to = await prisma.account.findUnique({ where: { id: tx.creditAccountId }});
    console.log('Credit Account:', to);
  }
}
main().finally(() => prisma.$disconnect());
