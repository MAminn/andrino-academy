"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function seed() {
    console.log("🌱 Creating comprehensive test data for Andrino Academy...");
    try {
        // Clear existing data
        await prisma.user.deleteMany();
        await prisma.grade.deleteMany();
        console.log("🗑️  Cleared existing data");
        // Hash passwords
        const ceoPassword = await bcryptjs_1.default.hash("Andrino2024!", 12);
        const managerPassword = await bcryptjs_1.default.hash("Manager2024!", 12);
        const coordinatorPassword = await bcryptjs_1.default.hash("Coord2024!", 12);
        const instructorPassword = await bcryptjs_1.default.hash("Instructor123!", 12);
        const studentPassword = await bcryptjs_1.default.hash("Student123!", 12);
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
        const students = await Promise.all([
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
                    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0), // 10:00 AM
                    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0), // 11:00 AM
                    trackId: tracks[0].id,
                    instructorId: instructors[0].id,
                },
            }),
            prisma.liveSession.create({
                data: {
                    title: "برمجة سكراتش - مشروع ممتع",
                    description: "إنشاء لعبة بسيطة في سكراتش",
                    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0), // 2:00 PM
                    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0), // 3:00 PM
                    trackId: tracks[2].id,
                    instructorId: instructors[0].id,
                },
            }),
            prisma.liveSession.create({
                data: {
                    title: "تطوير المواقع - HTML الأساسي",
                    description: "تعلم أساسيات HTML",
                    startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), // 4:00 PM
                    endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0), // 5:00 PM
                    trackId: tracks[4].id,
                    instructorId: instructors[0].id,
                },
            }),
            // Tomorrow's sessions
            prisma.liveSession.create({
                data: {
                    title: "البرمجة بـ Python - المتغيرات",
                    description: "تعلم استخدام المتغيرات في Python",
                    startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0),
                    endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0),
                    trackId: tracks[5].id,
                    instructorId: instructors[2].id,
                },
            }),
            prisma.liveSession.create({
                data: {
                    title: "الذكاء الاصطناعي - مقدمة",
                    description: "ما هو الذكاء الاصطناعي؟",
                    startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0),
                    endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0),
                    trackId: tracks[7].id,
                    instructorId: instructors[2].id,
                },
            }),
        ]);
        console.log("✅ Created live sessions for today and tomorrow");
        console.log("\n🎉 Database seeded successfully!");
        console.log("\n📋 Complete Test Credentials:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("\n👑 Administrative Accounts:");
        console.log("CEO: ceo@andrino-academy.com / Andrino2024!");
        console.log("Manager: manager@andrino-academy.com / Manager2024!");
        console.log("Coordinator: coordinator@andrino-academy.com / Coord2024!");
        console.log("\n👨‍🏫 Instructor Accounts:");
        console.log("Programming: ahmed.instructor@andrino-academy.com / Instructor123!");
        console.log("Design: sara.instructor@andrino-academy.com / Instructor123!");
        console.log("Data Science: omar.instructor@andrino-academy.com / Instructor123!");
        console.log("\n👨‍🎓 Student Accounts:");
        console.log("Beginner: ali.student@andrino-academy.com / Student123!");
        console.log("Elementary: fatima.student@andrino-academy.com / Student123!");
        console.log("Intermediate: mohammed.student@andrino-academy.com / Student123!");
        console.log("Advanced: aisha.student@andrino-academy.com / Student123!");
        console.log("Unassigned: hassan.student@andrino-academy.com / Student123!");
        console.log("\n📚 Academic Structure Created:");
        console.log(`- ${grades.length} Grades (المستويات)`);
        console.log(`- ${tracks.length} Tracks (المسارات)`);
        console.log(`- Live Sessions scheduled for today and tomorrow`);
        console.log("\n🚀 Ready for Testing:");
        console.log("1. npm run dev");
        console.log("2. Visit http://localhost:3000");
        console.log("3. Login with any of the credentials above");
        console.log("4. Test the interactive features in Manager Dashboard!");
    }
    catch (error) {
        console.error("❌ Error seeding database:", error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
seed()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
