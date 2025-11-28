import bcrypt from "bcryptjs";
import { db, schema } from "./db";

// Types for better TypeScript support
export type UserRole =
  | "student"
  | "instructor"
  | "coordinator"
  | "manager"
  | "ceo";
export type PriorExperience = "none" | "basic" | "intermediate" | "advanced";
export type GradeLevel =
  | "beginner"
  | "elementary"
  | "intermediate"
  | "advanced";

export interface StudentRegistrationData {
  name: string;
  email: string;
  password: string;
  age: number;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  priorExperience: PriorExperience;
  phone?: string;
  address?: string;
}

/**
 * Calculate grade level based on age and prior experience
 * Arabic LMS grade placement algorithm
 */
export function calculateGradeLevel(
  age: number,
  priorExperience: PriorExperience
): GradeLevel {
  // Age-based initial placement
  let baseLevel: GradeLevel = "beginner";

  if (age >= 6 && age <= 8) {
    baseLevel = "beginner";
  } else if (age >= 9 && age <= 12) {
    baseLevel = "elementary";
  } else if (age >= 13 && age <= 16) {
    baseLevel = "intermediate";
  } else if (age >= 17) {
    baseLevel = "advanced";
  }

  // Adjust based on prior experience
  switch (priorExperience) {
    case "none":
      return baseLevel === "advanced" ? "intermediate" : baseLevel;
    case "basic":
      if (baseLevel === "beginner") return "elementary";
      return baseLevel;
    case "intermediate":
      if (baseLevel === "beginner") return "intermediate";
      if (baseLevel === "elementary") return "intermediate";
      return baseLevel;
    case "advanced":
      if (baseLevel === "beginner" || baseLevel === "elementary")
        return "intermediate";
      return "advanced";
    default:
      return baseLevel;
  }
}

/**
 * Hash password for secure storage
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Validate student registration data
 */
export function validateStudentRegistration(data: any): {
  isValid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2) {
    errors.push("الاسم مطلوب ويجب أن يكون حرفين على الأقل");
  }

  if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push("البريد الإلكتروني غير صالح");
  }

  if (!data.password || data.password.length < 8) {
    errors.push("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
  }

  if (!data.age || typeof data.age !== "number" || data.age < 6 || data.age > 18) {
    errors.push("العمر يجب أن يكون بين 6 و 18 سنة");
  }

  if (!data.parentName || typeof data.parentName !== "string") {
    errors.push("اسم ولي الأمر مطلوب");
  }

  if (!data.parentEmail || !data.parentEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push("البريد الإلكتروني لولي الأمر غير صالح");
  }

  if (!data.parentPhone || typeof data.parentPhone !== "string") {
    errors.push("رقم هاتف ولي الأمر مطلوب");
  }

  if (!data.priorExperience || !["none", "basic", "intermediate", "advanced"].includes(data.priorExperience)) {
    errors.push("يجب تحديد مستوى الخبرة السابقة");
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Create a new student account with grade placement
 */
export async function createStudentAccount(data: StudentRegistrationData) {
  const hashedPassword = await hashPassword(data.password);
  const gradeLevel = calculateGradeLevel(data.age, data.priorExperience);

  try {
    // Check if email already exists
    const { eq } = await import("drizzle-orm");
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, data.email))
      .limit(1);

    if (existingUser) {
      return {
        success: false,
        error: "البريد الإلكتروني مستخدم بالفعل",
      };
    }

    // Create user with better-auth format
    const [user] = await db.insert(schema.users).values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "student",
      age: data.age,
      parentName: data.parentName,
      parentEmail: data.parentEmail,
      parentPhone: data.parentPhone,
      priorExperience: data.priorExperience,
      gradeLevel: gradeLevel,
      phone: data.phone,
      address: data.address,
      emailVerified: false,
    }).$returningId();

    return {
      success: true,
      user: {
        id: user.id,
        name: data.name,
        email: data.email,
        role: "student",
        gradeLevel,
      },
    };
  } catch (error) {
    console.error("Error creating student account:", error);
    return {
      success: false,
      error: "فشل إنشاء الحساب. حاول مرة أخرى.",
    };
  }
}
