import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // =========================
  // 1. Create roles
  // =========================

  const adminRole = await prisma.role.upsert({
    where: {
      name: 'ADMIN',
    },
    update: {
      description: 'Administrator / HRD',
    },
    create: {
      name: 'ADMIN',
      description: 'Administrator / HRD',
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: {
      name: 'EMPLOYEE',
    },
    update: {
      description: 'Regular employee',
    },
    create: {
      name: 'EMPLOYEE',
      description: 'Regular employee',
    },
  });

  // =========================
  // 2. Create admin user
  // =========================

  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@company.com',
    },
    update: {
      passwordHash,
      isActive: true,
    },
    create: {
      email: 'admin@company.com',
      passwordHash,
      isActive: true,
    },
  });

  // =========================
  // 3. Give ADMIN role
  // =========================

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  console.log(`Admin created: ${admin.email}`);
  console.log(`Role created: ${adminRole.name}`);
  console.log(`Role created: ${employeeRole.name}`);
  console.log('ADMIN role assigned to admin@company.com');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });