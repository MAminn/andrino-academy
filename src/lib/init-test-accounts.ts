import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function initializeTestAccounts() {
  try {
    // Check if CEO account exists (indicator that test accounts are set up)
    const existingCeo = await prisma.user.findUnique({
      where: { email: "ceo@andrino-academy.com" },
    });

    if (existingCeo) {
      console.log("✅ Test accounts already exist");
      return;
    }

    console.log("🌱 Creating production test accounts...");

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

    // Create CEO Account
    await prisma.user.create({
      data: {
        name: "CEO",
        email: "ceo@andrino-academy.com",
        password: ceoPassword,
        role: "ceo",
      },
    });

    // Create Testing Manager Account
    await prisma.user.create({
      data: {
        name: "Testing Manager",
        email: "manager@andrino-academy.com",
        password: testingManagerPassword,
        role: "manager",
      },
    });

    // Create Coordinator Account
    await prisma.user.create({
      data: {
        name: "Coordinator",
        email: "coordinator@andrino-academy.com",
        password: coordinatorPassword,
        role: "coordinator",
      },
    });

    // Create Instructor Account
    await prisma.user.create({
      data: {
        name: "Test Instructor",
        email: "instructor@andrino-academy.com",
        password: instructorPassword,
        role: "instructor",
      },
    });

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

    console.log("✅ Test accounts created successfully");
    console.log("CEO: ceo@andrino-academy.com");
    console.log("Manager: manager@andrino-academy.com");
    console.log("Coordinator: coordinator@andrino-academy.com");
    console.log("Instructor: instructor@andrino-academy.com");
    console.log("Student: student@andrino-academy.com");
  } catch (error) {
    console.error("❌ Error creating test accounts:", error);
  } finally {
    await prisma.$disconnect();
  }
}
