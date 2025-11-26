import { PrismaClient } from "../src/generated/prisma";
import * as bcrypt from "bcryptjs";

// Declare process for Node.js environment
declare const process: {
  env: {
    TEST_CEO_PASSWORD?: string;
    TEST_MANAGER_PASSWORD?: string;
    TEST_COORDINATOR_PASSWORD?: string;
    TEST_INSTRUCTOR_PASSWORD?: string;
    TEST_STUDENT_PASSWORD?: string;
  };
};

const prisma = new PrismaClient();

async function seedProduction() {
  console.log("🌱 Creating production test accounts for Andrino Academy...");

  try {
    // Hash secure passwords for test accounts from environment variables
    const testingManagerPassword = await bcrypt.hash(
      process.env.TEST_MANAGER_PASSWORD || "Manager#2024!Secure",
      12
    );
    const instructorPassword = await bcrypt.hash(
      process.env.TEST_INSTRUCTOR_PASSWORD || "Instructor#2024!Secure",
      12
    );
    const coordinatorPassword = await bcrypt.hash(
      process.env.TEST_COORDINATOR_PASSWORD || "Coordinator#2024!Secure",
      12
    );
    const studentPassword = await bcrypt.hash(
      process.env.TEST_STUDENT_PASSWORD || "Student#2024!Secure",
      12
    );
    const ceoPassword = await bcrypt.hash(
      process.env.TEST_CEO_PASSWORD || "CEO#2024!Secure",
      12
    );

    // Check if test accounts already exist
    const existingCeo = await prisma.user.findUnique({
      where: { email: "ceo@andrino-academy.com" },
    });

    if (existingCeo) {
      console.log("⚠️  Test accounts already exist. Skipping seed.");
      return;
    }

    // Create CEO Account
    await prisma.user.create({
      data: {
        name: "CEO",
        email: "ceo@andrino-academy.com",
        password: ceoPassword,
        role: "ceo",
      },
    });
    console.log("✅ Created CEO account");

    // Create Testing Manager Account
    await prisma.user.create({
      data: {
        name: "Testing Manager",
        email: "manager@andrino-academy.com",
        password: testingManagerPassword,
        role: "manager",
      },
    });
    console.log("✅ Created Manager account");

    // Create Coordinator Account
    await prisma.user.create({
      data: {
        name: "Coordinator",
        email: "coordinator@andrino-academy.com",
        password: coordinatorPassword,
        role: "coordinator",
      },
    });
    console.log("✅ Created Coordinator account");

    // Create Instructor Account
    await prisma.user.create({
      data: {
        name: "Test Instructor",
        email: "instructor@andrino-academy.com",
        password: instructorPassword,
        role: "instructor",
      },
    });
    console.log("✅ Created Instructor account");

    // Create Student Account
    await prisma.user.create({
      data: {
        name: "Test Student",
        email: "student@andrino-academy.com",
        password: studentPassword,
        role: "student",
        age: 15,
      },
    });
    console.log("✅ Created Student account");

    console.log("\n🎉 Production test accounts created successfully!");
    console.log("\n📋 Test Account Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  NOTE: Passwords are set via environment variables");
    console.log("Set TEST_*_PASSWORD variables for custom passwords\n");

    console.log("CEO: ceo@andrino-academy.com");
    console.log(
      `Password: ${process.env.TEST_CEO_PASSWORD || "CEO#2024!Secure"}`
    );
    console.log("\nManager: manager@andrino-academy.com");
    console.log(
      `Password: ${process.env.TEST_MANAGER_PASSWORD || "Manager#2024!Secure"}`
    );
    console.log("\nCoordinator: coordinator@andrino-academy.com");
    console.log(
      `Password: ${process.env.TEST_COORDINATOR_PASSWORD || "Coordinator#2024!Secure"}`
    );
    console.log("\nInstructor: instructor@andrino-academy.com");
    console.log(
      `Password: ${process.env.TEST_INSTRUCTOR_PASSWORD || "Instructor#2024!Secure"}`
    );
    console.log("\nStudent: student@andrino-academy.com");
    console.log(
      `Password: ${process.env.TEST_STUDENT_PASSWORD || "Student#2024!Secure"}`
    );

    console.log("\n✅ Production database ready!");
  } catch (error) {
    console.error("❌ Error seeding production database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProduction();
