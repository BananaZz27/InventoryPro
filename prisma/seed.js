const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Create Admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'password123',
      role: 'ADMIN',
    },
  })

  // Create Borrower
  const borrower = await prisma.user.upsert({
    where: { username: 'user1' },
    update: {},
    create: {
      username: 'user1',
      password: 'password123',
      role: 'BORROWER',
    },
  })

  // Create Items
  await prisma.item.createMany({
    data: [
      { name: 'Laptop', description: 'Dell Latitude', quantity: 10 },
      { name: 'Monitor', description: '24 inch LG', quantity: 20 },
      { name: 'Keyboard', description: 'Logitech Mechanical', quantity: 15 },
    ],
  })

  console.log({ admin, borrower })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
