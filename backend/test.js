
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const orders = await prisma.order.findMany();
  console.log('Orders count:', orders.length);
  if (orders.length > 0) {
    console.log('Sample order:', orders[0]);
  }
}

run().finally(() => prisma.$disconnect());

