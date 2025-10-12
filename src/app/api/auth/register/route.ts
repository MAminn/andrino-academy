import { NextRequest, NextResponse } from "next/server";
import {
  validateStudentRegistration,
  createStudentAccount,
} from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the registration data
    const validation = validateStudentRegistration(body);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "بيانات غير صحيحة",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Create the student account
    const result = await createStudentAccount(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      user: result.user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ في الخادم",
      },
      { status: 500 }
    );
  }
}
