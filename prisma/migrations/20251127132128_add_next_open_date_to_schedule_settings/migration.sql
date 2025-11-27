-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gradeId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Track_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Track_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Track_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LiveSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "trackId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "externalLink" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "materials" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LiveSession_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LiveSession_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'absent',
    "markedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "markedBy" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SessionAttendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetAudience" TEXT NOT NULL DEFAULT 'student',
    "category" TEXT NOT NULL DEFAULT 'UNCATEGORIZED',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "trackId" TEXT NOT NULL,
    "sessionId" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "weekNumber" INTEGER,
    "startDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Module_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Module_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "duration" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "targetAudience" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentItem_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssignmentNew" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "dueDate" DATETIME,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssignmentNew_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssignmentSubmissionNew" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grade" REAL,
    "feedback" TEXT,
    "gradedAt" DATETIME,
    "gradedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssignmentSubmissionNew_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "AssignmentNew" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssignmentSubmissionNew_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssignmentSubmissionNew_gradedBy_fkey" FOREIGN KEY ("gradedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstructorAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instructorId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "weekStartDate" DATETIME NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startHour" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstructorAvailability_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InstructorAvailability_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "availabilityId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "sessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'booked',
    "studentNotes" TEXT,
    "instructorNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SessionBooking_availabilityId_fkey" FOREIGN KEY ("availabilityId") REFERENCES "InstructorAvailability" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionBooking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionBooking_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionBooking_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "LiveSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScheduleSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekResetDay" INTEGER NOT NULL DEFAULT 6,
    "weekResetHour" INTEGER NOT NULL DEFAULT 0,
    "availabilityOpenHours" INTEGER NOT NULL DEFAULT 24,
    "nextOpenDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "discountedPrice" REAL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "perks" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "sessionsPerLevel" INTEGER NOT NULL,
    "pricePerSession" REAL NOT NULL,
    "badge" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "price" DECIMAL,
    "category" TEXT,
    "level" TEXT NOT NULL DEFAULT 'beginner',
    "duration" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "programmingLanguages" TEXT,
    "skillLevel" TEXT NOT NULL DEFAULT 'BEGINNER',
    "ageGroup" TEXT,
    "tools" TEXT,
    "githubRepo" TEXT,
    "meetingLink" TEXT,
    "schedulePattern" TEXT,
    "totalSessions" INTEGER,
    "prerequisites" TEXT,
    "currency" TEXT,
    "subscriptionEligible" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "instructorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Course" ("ageGroup", "category", "createdAt", "currency", "description", "duration", "githubRepo", "id", "instructorId", "isActive", "isPublished", "level", "meetingLink", "prerequisites", "price", "programmingLanguages", "schedulePattern", "skillLevel", "subscriptionEligible", "thumbnail", "title", "tools", "totalSessions", "updatedAt") SELECT "ageGroup", "category", "createdAt", "currency", "description", "duration", "githubRepo", "id", "instructorId", "isActive", "isPublished", "level", "meetingLink", "prerequisites", "price", "programmingLanguages", "schedulePattern", "skillLevel", "subscriptionEligible", "thumbnail", "title", "tools", "totalSessions", "updatedAt" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE INDEX "Course_isActive_idx" ON "Course"("isActive");
CREATE INDEX "Course_instructorId_idx" ON "Course"("instructorId");
CREATE TABLE "new_CourseSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "timezone" TEXT,
    "meetingLink" TEXT NOT NULL,
    "recordingLink" TEXT,
    "materials" TEXT,
    "topics" TEXT,
    "videoUrl" TEXT,
    "duration" INTEGER,
    "order" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "courseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CourseSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CourseSession" ("courseId", "createdAt", "description", "duration", "endsAt", "id", "isPublished", "materials", "meetingLink", "order", "recordingLink", "startsAt", "timezone", "title", "topics", "updatedAt", "videoUrl") SELECT "courseId", "createdAt", "description", "duration", "endsAt", "id", "isPublished", "materials", "meetingLink", "order", "recordingLink", "startsAt", "timezone", "title", "topics", "updatedAt", "videoUrl" FROM "CourseSession";
DROP TABLE "CourseSession";
ALTER TABLE "new_CourseSession" RENAME TO "CourseSession";
CREATE INDEX "CourseSession_courseId_startsAt_idx" ON "CourseSession"("courseId", "startsAt");
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "dueDate" DATETIME,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    "items" TEXT,
    "studentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("amount", "createdAt", "currency", "dueDate", "id", "invoiceNumber", "issuedAt", "items", "paidAt", "status", "studentId", "updatedAt") SELECT "amount", "createdAt", "currency", "dueDate", "id", "invoiceNumber", "issuedAt", "items", "paidAt", "status", "studentId", "updatedAt" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'student',
    "emailVerified" DATETIME,
    "image" TEXT,
    "age" INTEGER,
    "parentEmail" TEXT,
    "parentPhone" TEXT,
    "parentName" TEXT,
    "priorExperience" TEXT,
    "gradeLevel" TEXT,
    "gradeId" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "emergencyContact" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Grade_name_key" ON "Grade"("name");

-- CreateIndex
CREATE INDEX "Grade_isActive_idx" ON "Grade"("isActive");

-- CreateIndex
CREATE INDEX "Grade_order_idx" ON "Grade"("order");

-- CreateIndex
CREATE INDEX "Track_gradeId_idx" ON "Track"("gradeId");

-- CreateIndex
CREATE INDEX "Track_instructorId_idx" ON "Track"("instructorId");

-- CreateIndex
CREATE INDEX "Track_coordinatorId_idx" ON "Track"("coordinatorId");

-- CreateIndex
CREATE INDEX "Track_isActive_idx" ON "Track"("isActive");

-- CreateIndex
CREATE INDEX "LiveSession_trackId_idx" ON "LiveSession"("trackId");

-- CreateIndex
CREATE INDEX "LiveSession_instructorId_idx" ON "LiveSession"("instructorId");

-- CreateIndex
CREATE INDEX "LiveSession_date_idx" ON "LiveSession"("date");

-- CreateIndex
CREATE INDEX "LiveSession_status_idx" ON "LiveSession"("status");

-- CreateIndex
CREATE INDEX "SessionAttendance_sessionId_idx" ON "SessionAttendance"("sessionId");

-- CreateIndex
CREATE INDEX "SessionAttendance_studentId_idx" ON "SessionAttendance"("studentId");

-- CreateIndex
CREATE INDEX "SessionAttendance_status_idx" ON "SessionAttendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SessionAttendance_sessionId_studentId_key" ON "SessionAttendance"("sessionId", "studentId");

-- CreateIndex
CREATE INDEX "Module_trackId_idx" ON "Module"("trackId");

-- CreateIndex
CREATE INDEX "Module_sessionId_idx" ON "Module"("sessionId");

-- CreateIndex
CREATE INDEX "Module_category_idx" ON "Module"("category");

-- CreateIndex
CREATE INDEX "Module_isPublished_idx" ON "Module"("isPublished");

-- CreateIndex
CREATE INDEX "Module_order_idx" ON "Module"("order");

-- CreateIndex
CREATE INDEX "Module_targetAudience_idx" ON "Module"("targetAudience");

-- CreateIndex
CREATE INDEX "Module_weekNumber_idx" ON "Module"("weekNumber");

-- CreateIndex
CREATE INDEX "Module_startDate_idx" ON "Module"("startDate");

-- CreateIndex
CREATE INDEX "ContentItem_moduleId_idx" ON "ContentItem"("moduleId");

-- CreateIndex
CREATE INDEX "ContentItem_order_idx" ON "ContentItem"("order");

-- CreateIndex
CREATE INDEX "Task_moduleId_idx" ON "Task"("moduleId");

-- CreateIndex
CREATE INDEX "Task_order_idx" ON "Task"("order");

-- CreateIndex
CREATE INDEX "AssignmentNew_moduleId_idx" ON "AssignmentNew"("moduleId");

-- CreateIndex
CREATE INDEX "AssignmentNew_order_idx" ON "AssignmentNew"("order");

-- CreateIndex
CREATE INDEX "AssignmentSubmissionNew_studentId_idx" ON "AssignmentSubmissionNew"("studentId");

-- CreateIndex
CREATE INDEX "AssignmentSubmissionNew_assignmentId_idx" ON "AssignmentSubmissionNew"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentSubmissionNew_assignmentId_studentId_key" ON "AssignmentSubmissionNew"("assignmentId", "studentId");

-- CreateIndex
CREATE INDEX "InstructorAvailability_instructorId_idx" ON "InstructorAvailability"("instructorId");

-- CreateIndex
CREATE INDEX "InstructorAvailability_trackId_idx" ON "InstructorAvailability"("trackId");

-- CreateIndex
CREATE INDEX "InstructorAvailability_weekStartDate_idx" ON "InstructorAvailability"("weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "InstructorAvailability_instructorId_trackId_weekStartDate_dayOfWeek_startHour_key" ON "InstructorAvailability"("instructorId", "trackId", "weekStartDate", "dayOfWeek", "startHour");

-- CreateIndex
CREATE INDEX "SessionBooking_studentId_idx" ON "SessionBooking"("studentId");

-- CreateIndex
CREATE INDEX "SessionBooking_trackId_idx" ON "SessionBooking"("trackId");

-- CreateIndex
CREATE INDEX "SessionBooking_availabilityId_idx" ON "SessionBooking"("availabilityId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionBooking_availabilityId_studentId_key" ON "SessionBooking"("availabilityId", "studentId");

-- CreateIndex
CREATE INDEX "Package_isActive_idx" ON "Package"("isActive");

-- CreateIndex
CREATE INDEX "Package_order_idx" ON "Package"("order");
