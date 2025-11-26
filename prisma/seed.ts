import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

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

async function seed() {
  console.log("🌱 Creating comprehensive test data for Andrino Academy...");

  try {
    // Clear existing data in correct order (child tables first)
    await prisma.contentItem.deleteMany();
    await prisma.task.deleteMany();
    await prisma.assignmentSubmissionNew.deleteMany();
    await prisma.assignmentNew.deleteMany();
    await prisma.sessionBooking.deleteMany();
    await prisma.instructorAvailability.deleteMany();
    await prisma.module.deleteMany();
    await prisma.sessionAttendance.deleteMany();
    await prisma.liveSession.deleteMany();
    await prisma.track.deleteMany();
    await prisma.user.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.scheduleSettings.deleteMany();

    console.log("🗑️  Cleared existing data");

    // Hash secure passwords for test accounts
    // These should be set via environment variables in production
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

    // Create Administrative Accounts with secure passwords
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
        name: "Testing Manager",
        email: "manager@andrino-academy.com",
        password: testingManagerPassword,
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

    // Create Instructor Accounts with secure password
    const instructors = await Promise.all([
      prisma.user.create({
        data: {
          name: "Test Instructor",
          email: "instructor@andrino-academy.com",
          password: instructorPassword,
          role: "instructor",
        },
      }),
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

    console.log("✅ Created 4 instructor accounts");

    // Create Student Accounts with secure password
    const studentUsers = await Promise.all([
      // Test student account
      prisma.user.create({
        data: {
          name: "Test Student",
          email: "student@andrino-academy.com",
          password: studentPassword,
          role: "student",
          age: 15,
          gradeId: grades[2].id, // المستوى الثالث - has 2 tracks
        },
      }),
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

    console.log("✅ Created 6 student accounts (5 assigned, 1 unassigned)");

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

    // Create ScheduleSettings (Manager control over weekly reset)
    await prisma.scheduleSettings.create({
      data: {
        weekResetDay: 0, // Sunday
        weekResetHour: 22, // 10 PM
        availabilityOpenHours: 168, // Open for full week (7 days * 24 hours)
      },
    });

    console.log("✅ Created schedule settings");

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

    // Create sample course content modules with ContentItems, Tasks, and Assignments
    const modules = await Promise.all([
      // Module 1: "مقدمة عن الحاسوب" - Student-facing with video + PDF
      prisma.module.create({
        data: {
          title: "مقدمة عن الحاسوب",
          description: "فيديو تعريفي عن أجزاء الحاسوب الأساسية مع ملخص PDF",
          category: "LECTURE",
          targetAudience: "student",
          order: 1,
          isPublished: true,
          trackId: tracks[0].id,
          uploadedBy: "manager@andrino-academy.com",
          contentItems: {
            create: [
              {
                type: "VIDEO",
                fileUrl: "/uploads/modules/intro-to-computer.mp4",
                fileName: "intro-to-computer.mp4",
                fileSize: 52428800, // 50MB
                mimeType: "video/mp4",
                duration: 900, // 15 minutes
                order: 1,
              },
              {
                type: "PDF",
                fileUrl: "/uploads/modules/computer-parts-summary.pdf",
                fileName: "computer-parts-summary.pdf",
                fileSize: 2097152, // 2MB
                mimeType: "application/pdf",
                order: 2,
              },
            ],
          },
          tasks: {
            create: [
              {
                title: "اكتب ملخص عن أجزاء الحاسوب",
                description: "اكتب فقرة صغيرة (100 كلمة) عن أهم 5 أجزاء في الحاسوب",
                order: 1,
              },
            ],
          },
        },
      }),

      // Module 2: "أساسيات الحاسوب - المتقدم" - Instructor-facing with slides
      prisma.module.create({
        data: {
          title: "أساسيات الحاسوب - دليل المعلم",
          description: "شرائح العرض ومواد تدريسية للمعلم",
          category: "SLIDES",
          targetAudience: "instructor",
          order: 2,
          isPublished: true,
          trackId: tracks[0].id,
          uploadedBy: "manager@andrino-academy.com",
          contentItems: {
            create: [
              {
                type: "DOCUMENT",
                fileUrl: "/uploads/modules/computer-basics-slides.pptx",
                fileName: "computer-basics-slides.pptx",
                fileSize: 5242880, // 5MB
                mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                order: 1,
              },
              {
                type: "PDF",
                fileUrl: "/uploads/modules/teacher-notes.pdf",
                fileName: "teacher-notes.pdf",
                fileSize: 1048576, // 1MB
                mimeType: "application/pdf",
                order: 2,
              },
            ],
          },
        },
      }),

      // Module 3: "أساسيات سكراتش" - Student module with video, exercise, and assignment
      prisma.module.create({
        data: {
          title: "أساسيات سكراتش - الدرس الأول",
          description: "تعلم واجهة سكراتش وإنشاء أول مشروع",
          category: "TUTORIAL",
          targetAudience: "student",
          order: 1,
          isPublished: true,
          trackId: tracks[2].id,
          uploadedBy: "manager@andrino-academy.com",
          contentItems: {
            create: [
              {
                type: "VIDEO",
                fileUrl: "/uploads/modules/scratch-basics.mp4",
                fileName: "scratch-basics.mp4",
                fileSize: 104857600, // 100MB
                mimeType: "video/mp4",
                duration: 1200, // 20 minutes
                order: 1,
              },
              {
                type: "PDF",
                fileUrl: "/uploads/modules/scratch-exercises.pdf",
                fileName: "scratch-exercises.pdf",
                fileSize: 3145728, // 3MB
                mimeType: "application/pdf",
                order: 2,
              },
            ],
          },
          tasks: {
            create: [
              {
                title: "قم بإنشاء حساب على موقع سكراتش",
                description: "سجل في موقع scratch.mit.edu واكتب اسم المستخدم الخاص بك",
                order: 1,
              },
              {
                title: "استكشف مشاريع سكراتش",
                description: "ابحث عن 3 مشاريع مثيرة للاهتمام واكتب أسماءها",
                order: 2,
              },
            ],
          },
          assignments: {
            create: [
              {
                title: "مشروع سكراتش الأول",
                description: "أنشئ مشروع بسيط في سكراتش يحتوي على شخصية تتحرك وتتكلم. قم بتصدير المشروع وتحميله.",
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                order: 1,
              },
            ],
          },
        },
      }),

      // Module 4: "مقدمة في HTML" - Student module with multiple content types
      prisma.module.create({
        data: {
          title: "مقدمة في HTML",
          description: "تعلم أساسيات HTML وبنية الصفحة",
          category: "LECTURE",
          targetAudience: "student",
          order: 1,
          isPublished: true,
          trackId: tracks[4].id,
          uploadedBy: "manager@andrino-academy.com",
          contentItems: {
            create: [
              {
                type: "VIDEO",
                fileUrl: "/uploads/modules/html-introduction.mp4",
                fileName: "html-introduction.mp4",
                fileSize: 157286400, // 150MB
                mimeType: "video/mp4",
                duration: 1800, // 30 minutes
                order: 1,
              },
              {
                type: "PDF",
                fileUrl: "/uploads/modules/html-reference.pdf",
                fileName: "html-reference.pdf",
                fileSize: 10485760, // 10MB
                mimeType: "application/pdf",
                order: 2,
              },
              {
                type: "IMAGE",
                fileUrl: "/uploads/modules/html-structure-diagram.png",
                fileName: "html-structure-diagram.png",
                fileSize: 524288, // 512KB
                mimeType: "image/png",
                order: 3,
              },
            ],
          },
          assignments: {
            create: [
              {
                title: "إنشاء صفحة HTML بسيطة",
                description: "أنشئ صفحة HTML تحتوي على عنوان، فقرة، صورة، وقائمة. احفظها كملف .html وقم بتحميلها.",
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
                order: 1,
              },
            ],
          },
        },
      }),

      // Module 5: "البرمجة بـ Python - المتغيرات" - Student module
      prisma.module.create({
        data: {
          title: "البرمجة بـ Python - المتغيرات",
          description: "شرح المتغيرات وأنواع البيانات في Python",
          category: "LECTURE",
          targetAudience: "student",
          order: 1,
          isPublished: true,
          trackId: tracks[5].id,
          uploadedBy: "manager@andrino-academy.com",
          contentItems: {
            create: [
              {
                type: "VIDEO",
                fileUrl: "/uploads/modules/python-variables.mp4",
                fileName: "python-variables.mp4",
                fileSize: 209715200, // 200MB
                mimeType: "video/mp4",
                duration: 2400, // 40 minutes
                order: 1,
              },
            ],
          },
          tasks: {
            create: [
              {
                title: "تثبيت Python",
                description: "قم بتثبيت Python 3.x على جهازك وتحقق من الإصدار باستخدام python --version",
                order: 1,
              },
            ],
          },
        },
      }),

      // Module 6: "Python - أمثلة عملية" - Instructor-facing
      prisma.module.create({
        data: {
          title: "Python - أمثلة عملية للمعلم",
          description: "أمثلة كود Python متقدمة للاستخدام في الشرح",
          category: "SUPPLEMENTARY",
          targetAudience: "instructor",
          order: 2,
          isPublished: false, // Unpublished for testing
          trackId: tracks[5].id,
          uploadedBy: "manager@andrino-academy.com",
          contentItems: {
            create: [
              {
                type: "DOCUMENT",
                fileUrl: "/uploads/modules/python-code-examples.docx",
                fileName: "python-code-examples.docx",
                fileSize: 1048576, // 1MB
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                order: 1,
              },
            ],
          },
        },
      }),

      // Module 7: "تطوير التطبيقات - المشروع النهائي" - Student module with assignment
      prisma.module.create({
        data: {
          title: "تطوير التطبيقات - المشروع النهائي",
          description: "تطبيق المهارات المكتسبة في مشروع شامل",
          category: "PROJECT",
          targetAudience: "student",
          order: 1,
          isPublished: true,
          trackId: tracks[6].id,
          uploadedBy: "manager@andrino-academy.com",
          contentItems: {
            create: [
              {
                type: "PDF",
                fileUrl: "/uploads/modules/final-project-requirements.pdf",
                fileName: "final-project-requirements.pdf",
                fileSize: 4194304, // 4MB
                mimeType: "application/pdf",
                order: 1,
              },
            ],
          },
          assignments: {
            create: [
              {
                title: "المشروع النهائي",
                description: "قم بتطوير تطبيق ويب أو موبايل كامل يطبق المفاهيم التي تعلمتها. يجب أن يحتوي على واجهة مستخدم، وظائف أساسية، وقاعدة بيانات بسيطة.",
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
                order: 1,
              },
            ],
          },
        },
      }),

      // Module 8: "الذكاء الاصطناعي - مقدمة" - Student module
      prisma.module.create({
        data: {
          title: "الذكاء الاصطناعي - مقدمة",
          description: "ما هو الذكاء الاصطناعي وكيف يعمل؟",
          category: "LECTURE",
          targetAudience: "student",
          order: 1,
          isPublished: true,
          trackId: tracks[7].id,
          uploadedBy: "manager@andrino-academy.com",
          contentItems: {
            create: [
              {
                type: "VIDEO",
                fileUrl: "/uploads/modules/ai-introduction.mp4",
                fileName: "ai-introduction.mp4",
                fileSize: 183500800, // 175MB
                mimeType: "video/mp4",
                duration: 2700, // 45 minutes
                order: 1,
              },
              {
                type: "IMAGE",
                fileUrl: "/uploads/modules/ai-diagram.jpg",
                fileName: "ai-diagram.jpg",
                fileSize: 768000, // 750KB
                mimeType: "image/jpeg",
                order: 2,
              },
            ],
          },
          tasks: {
            create: [
              {
                title: "ابحث عن تطبيقات الذكاء الاصطناعي",
                description: "ابحث عن 5 تطبيقات حقيقية للذكاء الاصطناعي في حياتنا اليومية واكتب قائمة بها",
                order: 1,
              },
            ],
          },
        },
      }),
    ]);

    console.log("✅ Created 8 modules with ContentItems, Tasks, and Assignments");

    // Create Instructor Availability (for next week)
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7));
    nextMonday.setHours(0, 0, 0, 0);

    const availabilitySlots = await Promise.all([
      // Ahmed - Track 1 (أساسيات الحاسوب) - Monday, Wednesday, Friday
      prisma.instructorAvailability.create({
        data: {
          instructorId: instructors[0].id,
          trackId: tracks[0].id,
          weekStartDate: nextMonday,
          dayOfWeek: 1, // Monday
          startHour: 14, // 2 PM
          endHour: 16, // 4 PM
          isBooked: false,
          isConfirmed: true,
        },
      }),
      prisma.instructorAvailability.create({
        data: {
          instructorId: instructors[0].id,
          trackId: tracks[0].id,
          weekStartDate: nextMonday,
          dayOfWeek: 3, // Wednesday
          startHour: 14,
          endHour: 16,
          isBooked: false,
          isConfirmed: true,
        },
      }),
      prisma.instructorAvailability.create({
        data: {
          instructorId: instructors[0].id,
          trackId: tracks[0].id,
          weekStartDate: nextMonday,
          dayOfWeek: 5, // Friday
          startHour: 14,
          endHour: 16,
          isBooked: false,
          isConfirmed: true,
        },
      }),

      // Sara - Track 2 (البرمجة للأطفال) - Tuesday, Thursday
      prisma.instructorAvailability.create({
        data: {
          instructorId: instructors[1].id,
          trackId: tracks[1].id,
          weekStartDate: nextMonday,
          dayOfWeek: 2, // Tuesday
          startHour: 15,
          endHour: 17,
          isBooked: false,
          isConfirmed: true,
        },
      }),
      prisma.instructorAvailability.create({
        data: {
          instructorId: instructors[1].id,
          trackId: tracks[1].id,
          weekStartDate: nextMonday,
          dayOfWeek: 4, // Thursday
          startHour: 15,
          endHour: 17,
          isBooked: false,
          isConfirmed: true,
        },
      }),

      // Ahmed - Track 3 (برمجة سكراتش) - Saturday, Sunday
      prisma.instructorAvailability.create({
        data: {
          instructorId: instructors[0].id,
          trackId: tracks[2].id,
          weekStartDate: nextMonday,
          dayOfWeek: 6, // Saturday
          startHour: 10,
          endHour: 12,
          isBooked: false,
          isConfirmed: true,
        },
      }),
      prisma.instructorAvailability.create({
        data: {
          instructorId: instructors[0].id,
          trackId: tracks[2].id,
          weekStartDate: nextMonday,
          dayOfWeek: 0, // Sunday
          startHour: 10,
          endHour: 12,
          isBooked: false,
          isConfirmed: true,
        },
      }),

      // Omar - Track 6 (Python) - Monday, Wednesday, Saturday
      prisma.instructorAvailability.create({
        data: {
          instructorId: instructors[2].id,
          trackId: tracks[5].id,
          weekStartDate: nextMonday,
          dayOfWeek: 1,
          startHour: 18, // 6 PM
          endHour: 20, // 8 PM
          isBooked: false,
          isConfirmed: true,
        },
      }),
      prisma.instructorAvailability.create({
        data: {
          instructorId: instructors[2].id,
          trackId: tracks[5].id,
          weekStartDate: nextMonday,
          dayOfWeek: 3,
          startHour: 18,
          endHour: 20,
          isBooked: false,
          isConfirmed: true,
        },
      }),
      prisma.instructorAvailability.create({
        data: {
          instructorId: instructors[2].id,
          trackId: tracks[5].id,
          weekStartDate: nextMonday,
          dayOfWeek: 6,
          startHour: 16,
          endHour: 18,
          isBooked: true, // This one is booked (example)
          isConfirmed: true,
        },
      }),
    ]);

    console.log("✅ Created instructor availability slots for next week");

    // Get student IDs
    const students = await prisma.user.findMany({
      where: { role: "student" },
      take: 4,
    });

    // Create sample session bookings
    await prisma.sessionBooking.create({
      data: {
        availabilityId: availabilitySlots[9].id, // Omar's Saturday Python slot
        studentId: students[2].id, // Mohammed (intermediate level)
        trackId: tracks[5].id,
        status: "booked",
        studentNotes: "متحمس جداً لتعلم Python!",
      },
    });

    console.log("✅ Created sample session bookings");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📋 Test Account Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  NOTE: Passwords are set via environment variables");
    console.log("Set TEST_*_PASSWORD variables in .env file for custom passwords");
    console.log("Default secure passwords are used if not set");

    console.log("\n👑 Primary Test Accounts:");
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

    console.log("\n👨‍🏫 Additional Instructor Accounts:");
    console.log(
      "ahmed.instructor@andrino-academy.com / (same as instructor password)"
    );
    console.log(
      "sara.instructor@andrino-academy.com / (same as instructor password)"
    );
    console.log(
      "omar.instructor@andrino-academy.com / (same as instructor password)"
    );

    console.log("\n👨‍🎓 Additional Student Accounts:");
    console.log(
      "ali.student@andrino-academy.com / (same as student password)"
    );
    console.log(
      "fatima.student@andrino-academy.com / (same as student password)"
    );
    console.log(
      "mohammed.student@andrino-academy.com / (same as student password)"
    );
    console.log(
      "aisha.student@andrino-academy.com / (same as student password)"
    );
    console.log(
      "hassan.student@andrino-academy.com / (same as student password)"
    );

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

seed();
