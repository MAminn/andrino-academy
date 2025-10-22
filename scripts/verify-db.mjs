#!/usr/bin/env node
/**
 * Quick Database Verification Script
 * Checks if database has data after seeding
 */

import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('🔍 Checking database...\n');

    const gradeCount = await prisma.grade.count();
    const userCount = await prisma.user.count();
    const trackCount = await prisma.track.count();
    const sessionCount = await prisma.liveSession.count();

    console.log('📊 Database Contents:');
    console.log(`   Grades: ${gradeCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Tracks: ${trackCount}`);
    console.log(`   Sessions: ${sessionCount}`);

    if (gradeCount === 0 && userCount === 0) {
      console.log('\n❌ Database is empty! Run: npx tsx prisma/seed.ts');
    } else {
      console.log('\n✅ Database has data!');
      
      // Show sample users
      const users = await prisma.user.findMany({
        take: 3,
        select: {
          name: true,
          email: true,
          role: true,
        }
      });

      console.log('\n👥 Sample Users:');
      users.forEach(user => {
        console.log(`   ${user.role}: ${user.email}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
