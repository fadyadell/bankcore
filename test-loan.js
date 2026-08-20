const { PrismaClient } = require('./libs/database/generated/prisma');
const prisma = new PrismaClient();
async function main() {
  const loan = await prisma.loan.findUnique({
    where: { id: '7a188d92-769d-414a-ab08-f5f446e2cdf8' },
    include: { customer: { include: { accounts: true } } }
  });
  console.log('Loan Status:', loan.status);
  
  if (loan.customer && loan.customer.accounts.length > 0) {
    console.log('Customer Account Balance:', loan.customer.accounts[0].balance);
    
    const tx = await prisma.transaction.findFirst({
      where: { creditAccountId: loan.customer.accounts[0].id },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Deposit Transaction:', tx);
  }
}
main().finally(() => prisma.$disconnect());
