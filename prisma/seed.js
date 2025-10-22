"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_1 = require("../src/generated/prisma");
var bcryptjs_1 = require("bcryptjs");
var prisma = new prisma_1.PrismaClient();
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var ceoPassword, managerPassword, coordinatorPassword, instructorPassword, studentPassword, grades, coordinator, instructors, tracks, today, tomorrow, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🌱 Creating comprehensive test data for Andrino Academy...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 17, 18, 20]);
                    // Clear existing data
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 2:
                    // Clear existing data
                    _a.sent();
                    return [4 /*yield*/, prisma.grade.deleteMany()];
                case 3:
                    _a.sent();
                    console.log("🗑️  Cleared existing data");
                    return [4 /*yield*/, bcryptjs_1.default.hash("Andrino2024!", 12)];
                case 4:
                    ceoPassword = _a.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("Manager2024!", 12)];
                case 5:
                    managerPassword = _a.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("Coord2024!", 12)];
                case 6:
                    coordinatorPassword = _a.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("Instructor123!", 12)];
                case 7:
                    instructorPassword = _a.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("Student123!", 12)];
                case 8:
                    studentPassword = _a.sent();
                    return [4 /*yield*/, Promise.all([
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
                        ])];
                case 9:
                    grades = _a.sent();
                    console.log("✅ Created 4 grades");
                    // Create Administrative Accounts
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: "المدير التنفيذي",
                                email: "ceo@andrino-academy.com",
                                password: ceoPassword,
                                role: "ceo",
                            },
                        })];
                case 10:
                    // Create Administrative Accounts
                    _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: "المدير الأكاديمي",
                                email: "manager@andrino-academy.com",
                                password: managerPassword,
                                role: "manager",
                            },
                        })];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: "منسق الأكاديمية",
                                email: "coordinator@andrino-academy.com",
                                password: coordinatorPassword,
                                role: "coordinator",
                            },
                        })];
                case 12:
                    coordinator = _a.sent();
                    console.log("✅ Created administrative accounts");
                    return [4 /*yield*/, Promise.all([
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
                        ])];
                case 13:
                    instructors = _a.sent();
                    console.log("✅ Created 3 instructor accounts");
                    // Create Student Accounts
                    return [4 /*yield*/, Promise.all([
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
                        ])];
                case 14:
                    // Create Student Accounts
                    _a.sent();
                    console.log("✅ Created 5 student accounts (4 assigned, 1 unassigned)");
                    return [4 /*yield*/, Promise.all([
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
                        ])];
                case 15:
                    tracks = _a.sent();
                    console.log("✅ Created 8 tracks across all grades");
                    today = new Date();
                    tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return [4 /*yield*/, Promise.all([
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
                        ])];
                case 16:
                    _a.sent();
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
                    console.log("- ".concat(grades.length, " Grades (\u0627\u0644\u0645\u0633\u062A\u0648\u064A\u0627\u062A)"));
                    console.log("- ".concat(tracks.length, " Tracks (\u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A)"));
                    console.log("- Live Sessions scheduled for today and tomorrow");
                    console.log("\n🚀 Ready for Testing:");
                    console.log("1. npm run dev");
                    console.log("2. Visit http://localhost:3000");
                    console.log("3. Login with any of the credentials above");
                    console.log("4. Test the interactive features in Manager Dashboard!");
                    return [3 /*break*/, 20];
                case 17:
                    error_1 = _a.sent();
                    console.error("❌ Error seeding database:", error_1);
                    throw error_1;
                case 18: return [4 /*yield*/, prisma.$disconnect()];
                case 19:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 20: return [2 /*return*/];
            }
        });
    });
}
seed()
    .then(function () { return process.exit(0); })
    .catch(function (error) {
    console.error(error);
    process.exit(1);
});
