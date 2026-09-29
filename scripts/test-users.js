const { PrismaClient } = require('./libs/database/generated/prisma');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log('Users:', users);
}
main().finally(() => prisma.$disconnect());
