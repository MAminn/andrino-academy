import "dotenv/config";
import { db } from "./db";
import * as schema from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

async function seed() {
  console.log("🌱 Checking test accounts...");

  try {
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
        password: process.env.TEST_COORDINATOR_PASSWORD || "Coordinator#2024!Secure",
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

    // Check and create each test account if it doesn't exist
    for (const account of testAccounts) {
      const existingUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, account.email))
        .limit(1);

      if (existingUser.length === 0) {
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

        console.log(`✅ Created ${account.role.toUpperCase()} test account: ${account.email}`);
      } else {
        // Update password hash for existing accounts to ensure compatibility
        const hashedPassword = await bcrypt.hash(account.password, 12);
        const userId = existingUser[0].id;
        
        // Update or create credential account
        const existingAccount = await db
          .select()
          .from(schema.accounts)
          .where(eq(schema.accounts.userId, userId))
          .limit(1);
        
        if (existingAccount.length > 0) {
          await db
            .update(schema.accounts)
            .set({ password: hashedPassword })
            .where(eq(schema.accounts.userId, userId));
        } else {
          await db.insert(schema.accounts).values({
            id: nanoid(),
            userId: userId,
            accountId: account.email,
            providerId: "credential",
            password: hashedPassword,
          });
        }
        
        console.log(`⏭️  ${account.role.toUpperCase()} test account already exists: ${account.email}`);
      }
    }

    console.log("🎉 Test accounts check completed!");
  } catch (error) {
    console.error("❌ Error checking/creating test accounts:", error);
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error("Fatal error during seeding:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
