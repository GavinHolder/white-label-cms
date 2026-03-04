/**
 * Setup Users Script
 * - Clears ALL sections from the database (clean slate)
 * - Creates/updates 3 login users: admin, user1, user2
 *
 * Run: node scripts/setup-users.mjs
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🧹 Clearing all DB sections...');
  const deleted = await prisma.section.deleteMany({});
  console.log(`   ✅ Deleted ${deleted.count} sections`);

  console.log('\n👤 Creating users...');

  // admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: await hashPassword('sonic2026'), isActive: true, role: 'SUPER_ADMIN' },
    create: {
      username: 'admin',
      email: 'admin@sonicinternet.co.za',
      passwordHash: await hashPassword('sonic2026'),
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`   ✅ admin  (password: sonic2026)  role: SUPER_ADMIN`);

  // user1
  const user1 = await prisma.user.upsert({
    where: { username: 'user1' },
    update: { passwordHash: await hashPassword('user12026'), isActive: true },
    create: {
      username: 'user1',
      email: 'user1@sonicinternet.co.za',
      passwordHash: await hashPassword('user12026'),
      firstName: 'User',
      lastName: 'One',
      role: 'EDITOR',
      isActive: true,
    },
  });
  console.log(`   ✅ user1  (password: user12026)  role: EDITOR`);

  // user2
  const user2 = await prisma.user.upsert({
    where: { username: 'user2' },
    update: { passwordHash: await hashPassword('user22026'), isActive: true },
    create: {
      username: 'user2',
      email: 'user2@sonicinternet.co.za',
      passwordHash: await hashPassword('user22026'),
      firstName: 'User',
      lastName: 'Two',
      role: 'EDITOR',
      isActive: true,
    },
  });
  console.log(`   ✅ user2  (password: user22026)  role: EDITOR`);

  // Remove any OTHER users (keep only admin, user1, user2)
  const removed = await prisma.user.deleteMany({
    where: {
      username: { notIn: ['admin', 'user1', 'user2'] },
    },
  });
  if (removed.count > 0) {
    console.log(`\n🗑️  Removed ${removed.count} other user(s)`);
  }

  console.log('\n🎉 Done!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Login at: http://localhost:3000/admin/login');
  console.log('  admin  → sonic2026');
  console.log('  user1  → user12026');
  console.log('  user2  → user22026');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(e => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
