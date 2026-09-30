const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const txs = await prisma.transaction.findMany({ select: { id: true, idempotencyKey: true, amount: true } });
  console.log(txs);
}
run();
