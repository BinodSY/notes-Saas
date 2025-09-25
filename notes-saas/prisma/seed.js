const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const hashedPassword = await bcrypt.hash('password', 10);

  // Create tenants
  const acme = await prisma.tenant.create({
    data: {
      name: 'Acme',
      slug: 'acme',
      plan: 'free',
    },
  });

  const globex = await prisma.tenant.create({
    data: {
      name: 'Globex',
      slug: 'globex',
      plan: 'free',
    },
  });

  // Create users
  await prisma.user.createMany({
    data: [
      { email: 'admin@acme.test', password: hashedPassword, role: 'Admin', tenantId: acme.id },
      { email: 'user@acme.test', password: hashedPassword, role: 'Member', tenantId: acme.id },
      { email: 'admin@globex.test', password: hashedPassword, role: 'Admin', tenantId: globex.id },
      { email: 'user@globex.test', password: hashedPassword, role: 'Member', tenantId: globex.id },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
