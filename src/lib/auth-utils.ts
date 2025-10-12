import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

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
 * Create a new student account with grade placement
 */
export async function createStudentAccount(data: StudentRegistrationData) {
  const hashedPassword = await hashPassword(data.password);
  const gradeLevel = calculateGradeLevel(data.age, data.priorExperience);

  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "student",
        age: data.age,
        parentName: data.parentName,
        parentEmail: data.parentEmail,
        parentPhone: data.parentPhone,
        priorExperience: data.priorExperience,
        gradeLevel,
        phone: data.phone,
        address: data.address,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        age: true,
        gradeLevel: true,
        createdAt: true,
      },
    });

    return { success: true, user };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "البريد الإلكتروني مستخدم مسبقاً" };
    }
    return { success: false, error: "حدث خطأ أثناء إنشاء الحساب" };
  }
}

/**
 * Validate student registration data
 */
export function validateStudentRegistration(
  data: Partial<StudentRegistrationData>
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("الاسم يجب أن يحتوي على حرفين على الأقل");
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
    errors.push("البريد الإلكتروني غير صحيح (مثال: student@example.com)");
  }

  if (!data.password || data.password.length < 6) {
    errors.push("كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل");
  }

  if (!data.age || data.age < 6 || data.age > 18) {
    errors.push("العمر يجب أن يكون بين 6 و 18 سنة");
  }

  if (!data.parentName || data.parentName.trim().length < 2) {
    errors.push("اسم ولي الأمر مطلوب");
  }

  if (
    !data.parentEmail ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.parentEmail)
  ) {
    errors.push(
      "البريد الإلكتروني لولي الأمر غير صحيح (مثال: parent@example.com)"
    );
  }

  if (!data.parentPhone || !/^[+]?[\d\s-()]+$/.test(data.parentPhone)) {
    errors.push("رقم هاتف ولي الأمر غير صحيح");
  }

  if (
    !data.priorExperience ||
    !["none", "basic", "intermediate", "advanced"].includes(
      data.priorExperience
    )
  ) {
    errors.push("مستوى الخبرة السابقة مطلوب");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole as UserRole);
}

/**
 * Get user permissions based on role
 */
export function getUserPermissions(role: UserRole) {
  const permissions = {
    student: [
      "view_courses",
      "enroll_courses",
      "submit_assignments",
      "view_progress",
    ],
    instructor: [
      "create_courses",
      "manage_courses",
      "grade_assignments",
      "view_students",
    ],
    coordinator: [
      "manage_instructors",
      "manage_courses",
      "view_analytics",
      "manage_enrollments",
    ],
    manager: [
      "manage_users",
      "view_reports",
      "manage_payments",
      "system_settings",
    ],
    ceo: ["full_access"],
  };

  return permissions[role] || [];
}

/**
 * Create initial admin accounts (run once)
 */
export async function createInitialAccounts() {
  const accounts = [
    {
      name: "المدير التنفيذي",
      email: "ceo@andrino-academy.com",
      password: await hashPassword("Andrino2024!"),
      role: "ceo",
    },
    {
      name: "مدير النظام",
      email: "manager@andrino-academy.com",
      password: await hashPassword("Manager2024!"),
      role: "manager",
    },
    {
      name: "منسق الأكاديمية",
      email: "coordinator@andrino-academy.com",
      password: await hashPassword("Coord2024!"),
      role: "coordinator",
    },
  ];

  for (const account of accounts) {
    try {
      await prisma.user.upsert({
        where: { email: account.email },
        update: {},
        create: account,
      });
    } catch (error) {
      console.error(`Error creating account for ${account.email}:`, error);
    }
  }
}
