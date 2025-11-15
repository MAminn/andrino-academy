import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Creating comprehensive test data for Andrino Academy...");

  try {
    // Clear existing data in correct order (child tables first)
    await prisma.moduleAttachment.deleteMany();
    await prisma.module.deleteMany();
    await prisma.sessionAttendance.deleteMany();
    await prisma.liveSession.deleteMany();
    await prisma.track.deleteMany();
    await prisma.user.deleteMany();
    await prisma.grade.deleteMany();

    console.log("🗑️  Cleared existing data");

    // Hash passwords
    const ceoPassword = await bcrypt.hash("Andrino2024!", 12);
    const managerPassword = await bcrypt.hash("Manager2024!", 12);
    const coordinatorPassword = await bcrypt.hash("Coord2024!", 12);
    const instructorPassword = await bcrypt.hash("Instructor123!", 12);
    const studentPassword = await bcrypt.hash("Student123!", 12);

    // Create Grades first
    const grades = await Promise.all([
      prisma.grade.create({
        data: {
          name: "المستوى الأول",
          description: "المستوى المبتدئ للأعمار 6-8 سنوات",
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

    // Create Administrative Accounts
    await prisma.user.create({
      data: {
        name: "المدير التنفيذي",
        email: "ceo@andrino-academy.com",
        password: ceoPassword,
        role: "ceo",
      },
    });

    await prisma.user.create({
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
    const instructors = await Promise.all([
      prisma.user.create({
        data: {
          name: "أحمد محمد",
          email: "ahmed.instructor@andrino-academy.com",
          password: instructorPassword,
          role: "instructor",
        },
      }),
      prisma.user.create({
        data: {
          name: "سارة أحمد",
          email: "sara.instructor@andrino-academy.com",
          password: instructorPassword,
          role: "instructor",
        },
      }),
      prisma.user.create({
        data: {
          name: "عمر حسن",
          email: "omar.instructor@andrino-academy.com",
          password: instructorPassword,
          role: "instructor",
        },
      }),
    ]);

    console.log("✅ Created 3 instructor accounts");

    // Create Student Accounts
    await Promise.all([
      // Student 1 - Beginner Level (assigned to grade 1)
      prisma.user.create({
        data: {
          name: "علي محمد",
          email: "ali.student@andrino-academy.com",
          password: studentPassword,
          role: "student",
          age: 8,
          gradeId: grades[0].id, // المستوى الأول
        },
      }),
      // Student 2 - Elementary Level (assigned to grade 2)
      prisma.user.create({
        data: {
          name: "فاطمة أحمد",
          email: "fatima.student@andrino-academy.com",
          password: studentPassword,
          role: "student",
          age: 11,
          gradeId: grades[1].id, // المستوى الثاني
        },
      }),
      // Student 3 - Intermediate Level (assigned to grade 3)
      prisma.user.create({
        data: {
          name: "محمد علي",
          email: "mohammed.student@andrino-academy.com",
          password: studentPassword,
          role: "student",
          age: 15,
          gradeId: grades[2].id, // المستوى الثالث
        },
      }),
      // Student 4 - Advanced Level (assigned to grade 4)
      prisma.user.create({
        data: {
          name: "عائشة حسن",
          email: "aisha.student@andrino-academy.com",
          password: studentPassword,
          role: "student",
          age: 18,
          gradeId: grades[3].id, // المستوى الرابع
        },
      }),
      // Student 5 - Unassigned (for testing manager dashboard)
      prisma.user.create({
        data: {
          name: "حسن محمود",
          email: "hassan.student@andrino-academy.com",
          password: studentPassword,
          role: "student",
          age: 12,
          // No gradeId - remains unassigned
        },
      }),
    ]);

    console.log("✅ Created 5 student accounts (4 assigned, 1 unassigned)");

    // Create Tracks for each grade
    const tracks = await Promise.all([
      // المستوى الأول tracks
      prisma.track.create({
        data: {
          name: "أساسيات الحاسوب",
          description: "تعلم أساسيات استخدام الحاسوب للأطفال",
          gradeId: grades[0].id,
          instructorId: instructors[0].id, // أحمد
          coordinatorId: coordinator.id,
        },
      }),
      prisma.track.create({
        data: {
          name: "البرمجة للأطفال",
          description: "مقدمة في البرمجة باستخدام الألعاب",
          gradeId: grades[0].id,
          instructorId: instructors[1].id, // سارة
          coordinatorId: coordinator.id,
        },
      }),
      // المستوى الثاني tracks
      prisma.track.create({
        data: {
          name: "برمجة سكراتش",
          description: "تعلم البرمجة باستخدام سكراتش",
          gradeId: grades[1].id,
          instructorId: instructors[0].id, // أحمد
          coordinatorId: coordinator.id,
        },
      }),
      prisma.track.create({
        data: {
          name: "تصميم الألعاب البسيطة",
          description: "إنشاء ألعاب بسيطة باستخدام سكراتش",
          gradeId: grades[1].id,
          instructorId: instructors[1].id, // سارة
          coordinatorId: coordinator.id,
        },
      }),
      // المستوى الثالث tracks
      prisma.track.create({
        data: {
          name: "تطوير المواقع",
          description: "تعلم HTML, CSS, JavaScript",
          gradeId: grades[2].id,
          instructorId: instructors[0].id, // أحمد
          coordinatorId: coordinator.id,
        },
      }),
      prisma.track.create({
        data: {
          name: "البرمجة بـ Python",
          description: "تعلم أساسيات البرمجة بلغة Python",
          gradeId: grades[2].id,
          instructorId: instructors[2].id, // عمر
          coordinatorId: coordinator.id,
        },
      }),
      // المستوى الرابع tracks
      prisma.track.create({
        data: {
          name: "تطوير التطبيقات",
          description: "تطوير تطبيقات الجوال والويب",
          gradeId: grades[3].id,
          instructorId: instructors[0].id, // أحمد
          coordinatorId: coordinator.id,
        },
      }),
      prisma.track.create({
        data: {
          name: "الذكاء الاصطناعي",
          description: "مقدمة في الذكاء الاصطناعي والتعلم الآلي",
          gradeId: grades[3].id,
          instructorId: instructors[2].id, // عمر
          coordinatorId: coordinator.id,
        },
      }),
    ]);

    console.log("✅ Created 8 tracks across all grades");

    // Create some live sessions for today and upcoming
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Promise.all([
      // Today's sessions
      prisma.liveSession.create({
        data: {
          title: "أساسيات الحاسوب - الدرس الأول",
          description: "مقدمة عن الحاسوب وأجزاؤه",
          date: today,
          startTime: "10:00",
          endTime: "11:00",
          trackId: tracks[0].id,
          instructorId: instructors[0].id,
        },
      }),
      prisma.liveSession.create({
        data: {
          title: "برمجة سكراتش - مشروع ممتع",
          description: "إنشاء لعبة بسيطة في سكراتش",
          date: today,
          startTime: "14:00",
          endTime: "15:00",
          trackId: tracks[2].id,
          instructorId: instructors[0].id,
        },
      }),
      prisma.liveSession.create({
        data: {
          title: "تطوير المواقع - HTML الأساسي",
          description: "تعلم أساسيات HTML",
          date: today,
          startTime: "16:00",
          endTime: "17:00",
          trackId: tracks[4].id,
          instructorId: instructors[0].id,
        },
      }),
      // Tomorrow's sessions
      prisma.liveSession.create({
        data: {
          title: "البرمجة بـ Python - المتغيرات",
          description: "تعلم استخدام المتغيرات في Python",
          date: tomorrow,
          startTime: "10:00",
          endTime: "11:00",
          trackId: tracks[5].id,
          instructorId: instructors[2].id,
        },
      }),
      prisma.liveSession.create({
        data: {
          title: "الذكاء الاصطناعي - مقدمة",
          description: "ما هو الذكاء الاصطناعي؟",
          date: tomorrow,
          startTime: "15:00",
          endTime: "16:00",
          trackId: tracks[7].id,
          instructorId: instructors[2].id,
        },
      }),
    ]);

    console.log("✅ Created live sessions for today and tomorrow");

    // Create sample course content modules
    const modules = await Promise.all([
      // Video modules for "أساسيات الحاسوب" track
      prisma.module.create({
        data: {
          title: "مقدمة عن الحاسوب",
          description: "فيديو تعريفي عن أجزاء الحاسوب الأساسية",
          type: "VIDEO",
          category: "LECTURE",
          fileUrl: "/uploads/modules/intro-to-computer.mp4",
          fileName: "intro-to-computer.mp4",
          fileSize: 52428800, // 50MB
          mimeType: "video/mp4",
          duration: 900, // 15 minutes
          order: 1,
          isPublished: true,
          trackId: tracks[0].id,
          uploadedBy: "manager@andrino-academy.com",
        },
      }),
      // PDF module attached to video
      prisma.module.create({
        data: {
          title: "ملخص الدرس - أجزاء الحاسوب",
          description: "ملف PDF يحتوي على ملخص الدرس",
          type: "PDF",
          category: "HANDOUT",
          fileUrl: "/uploads/modules/computer-parts-summary.pdf",
          fileName: "computer-parts-summary.pdf",
          fileSize: 2097152, // 2MB
          mimeType: "application/pdf",
          order: 2,
          isPublished: true,
          trackId: tracks[0].id,
          uploadedBy: "manager@andrino-academy.com",
        },
      }),
      // Document module (slides)
      prisma.module.create({
        data: {
          title: "شرائح العرض - أساسيات الحاسوب",
          description: "ملف PowerPoint للدرس",
          type: "DOCUMENT",
          category: "SLIDES",
          fileUrl: "/uploads/modules/computer-basics-slides.pptx",
          fileName: "computer-basics-slides.pptx",
          fileSize: 5242880, // 5MB
          mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          order: 3,
          isPublished: true,
          trackId: tracks[0].id,
          uploadedBy: "manager@andrino-academy.com",
        },
      }),
      // Video module for "برمجة سكراتش" track
      prisma.module.create({
        data: {
          title: "أساسيات سكراتش - الدرس الأول",
          description: "تعلم واجهة سكراتش وإنشاء أول مشروع",
          type: "VIDEO",
          category: "TUTORIAL",
          fileUrl: "/uploads/modules/scratch-basics.mp4",
          fileName: "scratch-basics.mp4",
          fileSize: 104857600, // 100MB
          mimeType: "video/mp4",
          duration: 1200, // 20 minutes
          order: 1,
          isPublished: true,
          trackId: tracks[2].id,
          uploadedBy: "manager@andrino-academy.com",
        },
      }),
      // Exercise PDF for Scratch
      prisma.module.create({
        data: {
          title: "تمارين سكراتش - الدرس الأول",
          description: "تمارين عملية لتطبيق ما تعلمته",
          type: "PDF",
          category: "EXERCISE",
          fileUrl: "/uploads/modules/scratch-exercises.pdf",
          fileName: "scratch-exercises.pdf",
          fileSize: 3145728, // 3MB
          mimeType: "application/pdf",
          order: 2,
          isPublished: true,
          trackId: tracks[2].id,
          uploadedBy: "manager@andrino-academy.com",
        },
      }),
      // Video module for "تطوير المواقع" track
      prisma.module.create({
        data: {
          title: "مقدمة في HTML",
          description: "تعلم أساسيات HTML وبنية الصفحة",
          type: "VIDEO",
          category: "LECTURE",
          fileUrl: "/uploads/modules/html-introduction.mp4",
          fileName: "html-introduction.mp4",
          fileSize: 157286400, // 150MB
          mimeType: "video/mp4",
          duration: 1800, // 30 minutes
          order: 1,
          isPublished: true,
          trackId: tracks[4].id,
          uploadedBy: "manager@andrino-academy.com",
        },
      }),
      // Reference material for HTML
      prisma.module.create({
        data: {
          title: "مرجع HTML الشامل",
          description: "مرجع كامل لجميع عناصر HTML",
          type: "PDF",
          category: "REFERENCE",
          fileUrl: "/uploads/modules/html-reference.pdf",
          fileName: "html-reference.pdf",
          fileSize: 10485760, // 10MB
          mimeType: "application/pdf",
          order: 2,
          isPublished: true,
          trackId: tracks[4].id,
          uploadedBy: "manager@andrino-academy.com",
        },
      }),
      // Image module (infographic)
      prisma.module.create({
        data: {
          title: "مخطط بنية HTML",
          description: "رسم توضيحي لبنية صفحة HTML",
          type: "IMAGE",
          category: "REFERENCE",
          fileUrl: "/uploads/modules/html-structure-diagram.png",
          fileName: "html-structure-diagram.png",
          fileSize: 524288, // 512KB
          mimeType: "image/png",
          order: 3,
          isPublished: true,
          trackId: tracks[4].id,
          uploadedBy: "manager@andrino-academy.com",
        },
      }),
      // Video for Python track
      prisma.module.create({
        data: {
          title: "البرمجة بـ Python - المتغيرات",
          description: "شرح المتغيرات وأنواع البيانات في Python",
          type: "VIDEO",
          category: "LECTURE",
          fileUrl: "/uploads/modules/python-variables.mp4",
          fileName: "python-variables.mp4",
          fileSize: 209715200, // 200MB
          mimeType: "video/mp4",
          duration: 2400, // 40 minutes
          order: 1,
          isPublished: true,
          trackId: tracks[5].id,
          uploadedBy: "manager@andrino-academy.com",
        },
      }),
      // Code examples document
      prisma.module.create({
        data: {
          title: "أمثلة كود Python",
          description: "أمثلة عملية على المتغيرات في Python",
          type: "DOCUMENT",
          category: "SUPPLEMENTARY",
          fileUrl: "/uploads/modules/python-code-examples.docx",
          fileName: "python-code-examples.docx",
          fileSize: 1048576, // 1MB
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          order: 2,
          isPublished: false, // Unpublished for testing
          trackId: tracks[5].id,
          uploadedBy: "manager@andrino-academy.com",
        },
      }),
    ]);

    console.log("✅ Created 10 sample course content modules");

    // Create cross-linking (attach PDFs to videos)
    await Promise.all([
      // Attach PDF summary to "مقدمة عن الحاسوب" video
      prisma.moduleAttachment.create({
        data: {
          parentModuleId: modules[0].id, // Video module
          attachedModuleId: modules[1].id, // PDF module
          order: 1,
        },
      }),
      // Attach slides to same video
      prisma.moduleAttachment.create({
        data: {
          parentModuleId: modules[0].id, // Video module
          attachedModuleId: modules[2].id, // Slides module
          order: 2,
        },
      }),
      // Attach exercises to Scratch video
      prisma.moduleAttachment.create({
        data: {
          parentModuleId: modules[3].id, // Scratch video
          attachedModuleId: modules[4].id, // Exercises PDF
          order: 1,
        },
      }),
      // Attach HTML reference to HTML video
      prisma.moduleAttachment.create({
        data: {
          parentModuleId: modules[5].id, // HTML video
          attachedModuleId: modules[6].id, // HTML reference PDF
          order: 1,
        },
      }),
      // Attach diagram image to HTML video
      prisma.moduleAttachment.create({
        data: {
          parentModuleId: modules[5].id, // HTML video
          attachedModuleId: modules[7].id, // Diagram image
          order: 2,
        },
      }),
      // Attach code examples to Python video
      prisma.moduleAttachment.create({
        data: {
          parentModuleId: modules[8].id, // Python video
          attachedModuleId: modules[9].id, // Code examples doc
          order: 1,
        },
      }),
    ]);

    console.log("✅ Created module attachments (cross-linking materials)");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📋 Complete Test Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("\n👑 Administrative Accounts:");
    console.log("CEO: ceo@andrino-academy.com / Andrino2024!");
    console.log("Manager: manager@andrino-academy.com / Manager2024!");
    console.log("Coordinator: coordinator@andrino-academy.com / Coord2024!");

    console.log("\n👨‍🏫 Instructor Accounts:");
    console.log(
      "Programming: ahmed.instructor@andrino-academy.com / Instructor123!"
    );
    console.log("Design: sara.instructor@andrino-academy.com / Instructor123!");
    console.log(
      "Data Science: omar.instructor@andrino-academy.com / Instructor123!"
    );

    console.log("\n👨‍🎓 Student Accounts:");
    console.log("Beginner: ali.student@andrino-academy.com / Student123!");
    console.log("Elementary: fatima.student@andrino-academy.com / Student123!");
    console.log(
      "Intermediate: mohammed.student@andrino-academy.com / Student123!"
    );
    console.log("Advanced: aisha.student@andrino-academy.com / Student123!");
    console.log("Unassigned: hassan.student@andrino-academy.com / Student123!");

    console.log("\n📚 Academic Structure Created:");
    console.log(`- ${grades.length} Grades (المستويات)`);
    console.log(`- ${tracks.length} Tracks (المسارات)`);
    console.log(`- ${modules.length} Course Content Modules (المواد التعليمية)`);
    console.log(`- Live Sessions scheduled for today and tomorrow`);

    console.log("\n🚀 Ready for Testing:");
    console.log("1. npm run dev");
    console.log("2. Visit http://localhost:3000");
    console.log("3. Login with any of the credentials above");
    console.log("4. Test the interactive features in Manager Dashboard!");
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
