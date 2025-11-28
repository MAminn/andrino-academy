/**
 * Server initialization module
 * Handles database setup and test account management on server startup
 */
import { db } from "./db";
import * as schema from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

let isInitialized = false;

/**
 * Delete and recreate all test accounts
 * This ensures clean state and compatible password hashing
 */
export async function resetTestAccounts() {
  console.log("🗑️  Deleting existing test accounts...");

  const testEmails = [
    "ceo@andrino.academy",
    "manager@andrino.academy",
    "coordinator@andrino.academy",
    "instructor@andrino.academy",
    "student@andrino.academy",
  ];

  try {
    // Delete accounts and users for test emails
    for (const email of testEmails) {
      const existingUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        const userId = existingUser[0].id;
        
        // Delete account entries first (foreign key constraint)
        await db
          .delete(schema.accounts)
          .where(eq(schema.accounts.userId, userId));
        
        // Delete user
        await db
          .delete(schema.users)
          .where(eq(schema.users.id, userId));
        
        console.log(`   ✅ Deleted: ${email}`);
      }
    }

    console.log("🌱 Creating fresh test accounts...");

    // Test accounts configuration
    const testAccounts = [
      {
        name: "CEO Admin",
        email: "ceo@andrino.academy",
        password: process.env.TEST_CEO_PASSWORD || "CEO#2024!Secure",
        role: "ceo" as const,
      },
      {
        name: "Test Manager",
        email: "manager@andrino.academy",
        password: process.env.TEST_MANAGER_PASSWORD || "Manager#2024!Secure",
        role: "manager" as const,
      },
      {
        name: "Test Coordinator",
        email: "coordinator@andrino.academy",
        password:
          process.env.TEST_COORDINATOR_PASSWORD || "Coordinator#2024!Secure",
        role: "coordinator" as const,
      },
      {
        name: "Test Instructor",
        email: "instructor@andrino.academy",
        password: process.env.TEST_INSTRUCTOR_PASSWORD || "Instructor#2024!Secure",
        role: "instructor" as const,
      },
      {
        name: "Test Student",
        email: "student@andrino.academy",
        password: process.env.TEST_STUDENT_PASSWORD || "Student#2024!Secure",
        role: "student" as const,
      },
    ];

    // Create each test account
    for (const account of testAccounts) {
      // Hash password with Better Auth compatible salt rounds (12)
      const hashedPassword = await bcrypt.hash(account.password, 12);

      // Create user
      const userId = nanoid();
      await db.insert(schema.users).values({
        id: userId,
        name: account.name,
        email: account.email,
        role: account.role,
        emailVerified: true,
        ...(account.role === "student" && {
          age: 12,
          priorExperience: "basic",
          gradeLevel: "beginner",
        }),
      });

      // Create credential account for Better-Auth
      await db.insert(schema.accounts).values({
        id: nanoid(),
        userId: userId,
        accountId: account.email,
        providerId: "credential",
        password: hashedPassword,
      });

      console.log(
        `   ✅ Created ${account.role.toUpperCase()}: ${account.email}`
      );
    }

    console.log("🎉 Test accounts reset completed!");
  } catch (error) {
    console.error("❌ Error resetting test accounts:", error);
    throw error;
  }
}

/**
 * Run database migrations
 * Only applies new migrations that haven't been applied yet
 */
export async function runDatabaseMigrations() {
  console.log("🔄 Checking database migrations...");
  
  try {
    const { migrate } = await import("drizzle-orm/mysql2/migrator");
    const mysql = await import("mysql2/promise");
    const { drizzle } = await import("drizzle-orm/mysql2");
    
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
    });

    const migrationDb = drizzle(connection);

    await migrate(migrationDb, { 
      migrationsFolder: "./backend/database/migrations" 
    });

    console.log("✅ Database migrations applied!");

    await connection.end();
  } catch (error: any) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

/**
 * Initialize server on startup
 * Run this once when the server starts
 */
export async function initializeServer() {
  if (isInitialized) {
    console.log("⏭️  Server already initialized, skipping...");
    return;
  }

  console.log("🚀 Initializing Andrino Academy server...");

  try {
    // Run database migrations (only applies new ones)
    await runDatabaseMigrations();

    // Reset test accounts (delete and recreate)
    await resetTestAccounts();

    isInitialized = true;
    console.log("✅ Server initialization complete!\n");
  } catch (error) {
    console.error("❌ Server initialization failed:", error);
    throw error;
  }
}
