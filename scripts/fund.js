const { PrismaClient } = require('./libs/database/generated/prisma');
const prisma = new PrismaClient();
async function main() {
  await prisma.account.update({
    where: { id: '7c400715-a539-4444-b983-9e132a7f4185' },
    data: { balance: 100000, availableBalance: 100000 }
  });
  console.log('Account funded!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
