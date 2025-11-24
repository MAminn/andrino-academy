/**
 * Optimized Seed Script for Andrino Academy
 * Works with the simplified schema focusing on core Academic Structure
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log("🌱 Starting optimized database seeding...");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await prisma.sessionAttendance.deleteMany();
    await prisma.liveSession.deleteMany();
    await prisma.track.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    // Create Grades (Academic Structure)
    console.log("📚 Creating academic grades...");
    const grades = await Promise.all([
      prisma.grade.create({
        data: {
          name: "المستوى الأول",
          description: "المستوى التمهيدي للأعمار 5-8 سنوات",
          order: 1,
        },
      }),
      prisma.grade.create({
        data: {
          name: "المستوى الثاني",
          description: "المستوى الابتدائي للأعمار 9-12 سنة",
          order: 2,
        },
      }),
      prisma.grade.create({
        data: {
          name: "المستوى الثالث",
          description: "المستوى المتوسط للأعمار 13-16 سنة",
          order: 3,
        },
      }),
      prisma.grade.create({
        data: {
          name: "المستوى الرابع",
          description: "المستوى المتقدم للأعمار 17+ سنة",
          order: 4,
        },
      }),
    ]);

    console.log("✅ Created 4 grades");

    // Create Administrative Accounts with optimized fields
    console.log("👥 Creating administrative accounts...");

    const ceoPassword = await bcrypt.hash("Andrino2024!", 12);
    const managerPassword = await bcrypt.hash("Manager2024!", 12);
    const coordinatorPassword = await bcrypt.hash("Coord2024!", 12);

    const ceo = await prisma.user.create({
      data: {
        name: "المدير التنفيذي",
        email: "ceo@andrino-academy.com",
        password: ceoPassword,
        role: "ceo",
      },
    });

    const manager = await prisma.user.create({
      data: {
        name: "المدير الأكاديمي",
        email: "manager@andrino-academy.com",
        password: managerPassword,
        role: "manager",
      },
    });

    const coordinator = await prisma.user.create({
      data: {
        name: "منسق الأكاديمية",
        email: "coordinator@andrino-academy.com",
        password: coordinatorPassword,
        role: "coordinator",
      },
    });

    console.log("✅ Created administrative accounts");

    // Create Instructor Accounts
    console.log("👨‍🏫 Creating instructor accounts...");
    const instructorPassword = await bcrypt.hash("Instructor123!", 12);

    const instructors = await Promise.all([
      prisma.user.create({
        data: {
          name: "أحمد محمد",
          email: "ahmed.instructor@andrino-academy.com",
          password: instructorPassword,
          role: "instructor",
          phone: "+966501234567",
        },
      }),
      prisma.user.create({
        data: {
          name: "فاطمة علي",
          email: "fatima.instructor@andrino-academy.com",
          password: instructorPassword,
          role: "instructor",
          phone: "+966501234568",
        },
      }),
      prisma.user.create({
        data: {
          name: "محمد الأحمد",
          email: "mohammed.instructor@andrino-academy.com",
          password: instructorPassword,
          role: "instructor",
          phone: "+966501234569",
        },
      }),
      prisma.user.create({
        data: {
          name: "نورا سعد",
          email: "nora.instructor@andrino-academy.com",
          password: instructorPassword,
          role: "instructor",
          phone: "+966501234570",
        },
      }),
    ]);

    console.log("✅ Created 4 instructor accounts");

    // Create Student Accounts with Grade Assignments
    console.log("👨‍🎓 Creating student accounts...");
    const studentPassword = await bcrypt.hash("Student123!", 12);

    const students = await Promise.all([
      // Grade 1 Students
      prisma.user.create({
        data: {
          name: "علي أحمد",
          email: "ali.student@andrino-academy.com",
          password: studentPassword,
          role: "student",
          age: 7,
          parentEmail: "parent.ali@gmail.com",
          parentPhone: "+966502345678",
          parentName: "أحمد علي",
          priorExperience: "none",
          gradeId: grades[0].id,
        },
      }),
      prisma.user.create({
        data: {
          name: "فاطمة محمد",
          email: "fatima.student@andrino-academy.com",
          password: studentPassword,
          role: "student",
          age: 8,
          parentEmail: "parent.fatima@gmail.com",
          parentPhone: "+966502345679",
          parentName: "محمد فاطمة",
          priorExperience: "basic",
          gradeId: grades[0].id,
        },
      }),
      // Grade 2 Students
      prisma.user.create({
        data: {
          name: "محمد سعد",
          email: "mohammed.student@andrino-academy.com",
          password: studentPassword,
          role: "student",
          age: 11,
          parentEmail: "parent.mohammed@gmail.com",
          parentPhone: "+966502345680",
          parentName: "سعد محمد",
          priorExperience: "intermediate",
          gradeId: grades[1].id,
        },
      }),
      prisma.user.create({
        data: {
          name: "نورا علي",
          email: "nora.student@andrino-academy.com",
          password: studentPassword,
          role: "student",
          age: 12,
          parentEmail: "parent.nora@gmail.com",
          parentPhone: "+966502345681",
          parentName: "علي نورا",
          priorExperience: "basic",
          gradeId: grades[1].id,
        },
      }),
      // Grade 3 Students
      prisma.user.create({
        data: {
          name: "يوسف أحمد",
          email: "youssef.student@andrino-academy.com",
          password: studentPassword,
          role: "student",
          age: 15,
          parentEmail: "parent.youssef@gmail.com",
          parentPhone: "+966502345682",
          parentName: "أحمد يوسف",
          priorExperience: "advanced",
          gradeId: grades[2].id,
        },
      }),
      // Unassigned student
      prisma.user.create({
        data: {
          name: "حسن محمد",
          email: "hassan.student@andrino-academy.com",
          password: studentPassword,
          role: "student",
          age: 10,
          parentEmail: "parent.hassan@gmail.com",
          parentPhone: "+966502345683",
          parentName: "محمد حسن",
          priorExperience: "none",
          // No gradeId - unassigned student
        },
      }),
    ]);

    console.log("✅ Created 6 student accounts (5 assigned, 1 unassigned)");

    // Create Tracks (Optimized Academic Structure)
    console.log("🛤️ Creating academic tracks...");
    const tracks = await Promise.all([
      // Grade 1 Tracks
      prisma.track.create({
        data: {
          name: "أساسيات البرمجة للأطفال",
          description: "تعلم المفاهيم الأساسية للبرمجة باستخدام Scratch",
          gradeId: grades[0].id,
          instructorId: instructors[0].id,
          coordinatorId: coordinator.id,
          order: 1,
        },
      }),
      prisma.track.create({
        data: {
          name: "الروبوتات التعليمية",
          description: "تعلم برمجة الروبوتات البسيطة للأطفال",
          gradeId: grades[0].id,
          instructorId: instructors[1].id,
          coordinatorId: coordinator.id,
          order: 2,
        },
      }),
      // Grade 2 Tracks
      prisma.track.create({
        data: {
          name: "تطوير الألعاب البسيطة",
          description: "إنشاء ألعاب تفاعلية باستخدام أدوات بصرية",
          gradeId: grades[1].id,
          instructorId: instructors[2].id,
          coordinatorId: coordinator.id,
          order: 1,
        },
      }),
      prisma.track.create({
        data: {
          name: "تصميم المواقع للمبتدئين",
          description: "أساسيات HTML و CSS للأطفال",
          gradeId: grades[1].id,
          instructorId: instructors[3].id,
          coordinatorId: coordinator.id,
          order: 2,
        },
      }),
      // Grade 3 Tracks
      prisma.track.create({
        data: {
          name: "برمجة Python للمراهقين",
          description: "تعلم أساسيات Python وتطبيقاتها العملية",
          gradeId: grades[2].id,
          instructorId: instructors[0].id,
          coordinatorId: coordinator.id,
          order: 1,
        },
      }),
      prisma.track.create({
        data: {
          name: "تطوير تطبيقات الهاتف",
          description: "إنشاء تطبيقات بسيطة للهواتف الذكية",
          gradeId: grades[2].id,
          instructorId: instructors[1].id,
          coordinatorId: coordinator.id,
          order: 2,
        },
      }),
      // Grade 4 Tracks
      prisma.track.create({
        data: {
          name: "هندسة البرمجيات",
          description: "مبادئ تطوير البرمجيات والعمل الجماعي",
          gradeId: grades[3].id,
          instructorId: instructors[2].id,
          coordinatorId: coordinator.id,
          order: 1,
        },
      }),
      prisma.track.create({
        data: {
          name: "الذكاء الاصطناعي التطبيقي",
          description: "مقدمة في الذكاء الاصطناعي وتطبيقاته",
          gradeId: grades[3].id,
          instructorId: instructors[3].id,
          coordinatorId: coordinator.id,
          order: 2,
        },
      }),
    ]);

    console.log("✅ Created 8 tracks across all grades");

    // Create Live Sessions (External Coordination Platform)
    console.log("📅 Creating live sessions...");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await Promise.all([
      // Today's sessions
      prisma.liveSession.create({
        data: {
          title: "مقدمة في Scratch - الجلسة الأولى",
          description: "تعرف على واجهة Scratch وإنشاء أول مشروع",
          trackId: tracks[0].id,
          instructorId: instructors[0].id,
          date: today,
          startTime: "10:00",
          endTime: "11:00",
          status: "READY",
          externalLink: "https://zoom.us/j/123456789", // External coordination
          materials: JSON.stringify([
            { name: "ملف العرض", url: "/materials/scratch-intro.pdf" },
            { name: "روابط مفيدة", url: "https://scratch.mit.edu" },
          ]),
        },
      }),
      prisma.liveSession.create({
        data: {
          title: "أساسيات HTML - الجلسة الأولى",
          description: "تعلم كيفية إنشاء صفحة ويب بسيطة",
          trackId: tracks[3].id,
          instructorId: instructors[3].id,
          date: today,
          startTime: "14:00",
          endTime: "15:30",
          status: "SCHEDULED", // No external link yet
          materials: JSON.stringify([
            { name: "مرجع HTML", url: "/materials/html-basics.pdf" },
          ]),
        },
      }),
      // Tomorrow's sessions
      prisma.liveSession.create({
        data: {
          title: "Python للمبتدئين - متغيرات وعمليات",
          description: "تعلم كيفية استخدام المتغيرات والعمليات الحسابية",
          trackId: tracks[4].id,
          instructorId: instructors[0].id,
          date: tomorrow,
          startTime: "16:00",
          endTime: "17:30",
          status: "READY",
          externalLink: "https://meet.google.com/abc-defg-hij", // External coordination
          notes: "تأكد من تحضير بيئة Python قبل الجلسة",
        },
      }),
      prisma.liveSession.create({
        data: {
          title: "تصميم واجهات المستخدم",
          description: "مبادئ تصميم واجهات جذابة وسهلة الاستخدام",
          trackId: tracks[6].id,
          instructorId: instructors[2].id,
          date: tomorrow,
          startTime: "10:00",
          endTime: "11:30",
          status: "DRAFT", // Just created, no scheduling yet
        },
      }),
    ]);

    console.log("✅ Created 4 live sessions");

    // Create Sample Attendance Records
    console.log("📝 Creating sample attendance records...");
    await Promise.all([
      // Session 1 attendance
      prisma.sessionAttendance.create({
        data: {
          sessionId: sessions[0].id,
          studentId: students[0].id, // Ali - Grade 1
          status: "present",
          markedBy: instructors[0].id,
          notes: "مشاركة ممتازة في الجلسة",
        },
      }),
      prisma.sessionAttendance.create({
        data: {
          sessionId: sessions[0].id,
          studentId: students[1].id, // Fatima - Grade 1
          status: "late",
          markedBy: instructors[0].id,
          notes: "وصل متأخراً 5 دقائق",
        },
      }),
    ]);

    console.log("✅ Created sample attendance records");

    // Print summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 Optimized Database Seeding Complete!");
    console.log("=".repeat(50));

    console.log("\n📊 Created Records:");
    console.log(`- Users: ${await prisma.user.count()}`);
    console.log(`- Grades: ${await prisma.grade.count()}`);
    console.log(`- Tracks: ${await prisma.track.count()}`);
    console.log(`- Live Sessions: ${await prisma.liveSession.count()}`);
    console.log(
      `- Attendance Records: ${await prisma.sessionAttendance.count()}`
    );

    console.log("\n🔐 Test Credentials:");
    console.log("CEO: ceo@andrino-academy.com / Andrino2024!");
    console.log("Manager: manager@andrino-academy.com / Manager2024!");
    console.log("Coordinator: coordinator@andrino-academy.com / Coord2024!");
    console.log(
      "Instructor: ahmed.instructor@andrino-academy.com / Instructor123!"
    );
    console.log("Student: ali.student@andrino-academy.com / Student123!");
    console.log(
      "Unassigned Student: hassan.student@andrino-academy.com / Student123!"
    );

    console.log("\n📚 Academic Structure:");
    console.log(`- ${grades.length} Grades (المستويات)`);
    console.log(`- ${tracks.length} Tracks (المسارات)`);
    console.log(
      `- Live Sessions with External Coordination (Zoom, Google Meet)`
    );

    console.log("\n🚀 Ready for Testing:");
    console.log("1. npm run dev");
    console.log("2. Visit http://localhost:3000");
    console.log("3. Login with any of the credentials above");
    console.log("4. Test the optimized Academic Structure!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
