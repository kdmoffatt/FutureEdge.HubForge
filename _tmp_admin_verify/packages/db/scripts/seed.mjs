#!/usr/bin/env node
import prismaPkg from '@prisma/client';
import { createHash } from 'node:crypto';

const { PrismaClient } = prismaPkg;

const prisma = new PrismaClient();

function hash(password) {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'local-demo' },
    update: {},
    create: { slug: 'local-demo', name: 'Local Demo Tenant' },
  });

  const user = await prisma.user.upsert({
    where: { email: 'admin@local-demo.com' },
    update: {},
    create: { email: 'admin@local-demo.com', name: 'Local Admin', passwordHash: hash('Password1!') },
  });

  await prisma.membership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    update: {},
    create: { tenantId: tenant.id, userId: user.id, role: 'admin' },
  });

  console.log('Seed complete');
  console.log('Email: admin@local-demo.com');
  console.log('Password: Password1!');
  console.log('TenantId: ' + tenant.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
