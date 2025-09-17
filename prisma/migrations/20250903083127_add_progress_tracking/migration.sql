-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "price" DECIMAL,
    "category" TEXT,
    "level" TEXT NOT NULL DEFAULT 'beginner',
    "duration" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "programmingLanguages" JSONB,
    "skillLevel" TEXT NOT NULL DEFAULT 'BEGINNER',
    "ageGroup" TEXT,
    "tools" JSONB,
    "githubRepo" TEXT,
    "meetingLink" TEXT,
    "schedulePattern" TEXT,
    "totalSessions" INTEGER,
    "prerequisites" JSONB,
    "currency" TEXT,
    "subscriptionEligible" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "instructorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CourseSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "timezone" TEXT,
    "meetingLink" TEXT NOT NULL,
    "recordingLink" TEXT,
    "materials" JSONB,
    "topics" JSONB,
    "videoUrl" TEXT,
    "duration" INTEGER,
    "order" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "courseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CourseSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "progress" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastAccessedAt" DATETIME,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "courseId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assignment_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssignmentSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submission" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grade" TEXT,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "examLink" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "courseId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Exam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Exam_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "markedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CourseSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attendance_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "method" TEXT,
    "transactionId" TEXT,
    "paidAt" DATETIME,
    "studentId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "dueDate" DATETIME,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    "items" JSONB,
    "studentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "watchPercentage" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SessionProgress_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CourseSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LearningActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT,
    "sessionId" TEXT,
    "assignmentId" TEXT,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LearningActivity_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LearningActivity_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LearningActivity_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CourseSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LearningActivity_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LearningStreak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" DATETIME,
    "streakStartDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LearningStreak_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressMilestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "milestoneType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "progressPercentage" REAL NOT NULL,
    "achievedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "points" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProgressMilestone_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgressMilestone_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgressMilestone_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Course_isActive_idx" ON "Course"("isActive");

-- CreateIndex
CREATE INDEX "Course_instructorId_idx" ON "Course"("instructorId");

-- CreateIndex
CREATE INDEX "CourseSession_courseId_startsAt_idx" ON "CourseSession"("courseId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_courseId_key" ON "Enrollment"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_studentId_key" ON "AssignmentSubmission"("assignmentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_sessionId_studentId_key" ON "Attendance"("sessionId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_studentId_courseId_key" ON "Certificate"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "SessionProgress_enrollmentId_idx" ON "SessionProgress"("enrollmentId");

-- CreateIndex
CREATE INDEX "SessionProgress_status_idx" ON "SessionProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SessionProgress_sessionId_studentId_key" ON "SessionProgress"("sessionId", "studentId");

-- CreateIndex
CREATE INDEX "LearningActivity_studentId_idx" ON "LearningActivity"("studentId");

-- CreateIndex
CREATE INDEX "LearningActivity_courseId_idx" ON "LearningActivity"("courseId");

-- CreateIndex
CREATE INDEX "LearningActivity_activityType_idx" ON "LearningActivity"("activityType");

-- CreateIndex
CREATE INDEX "LearningActivity_createdAt_idx" ON "LearningActivity"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LearningStreak_studentId_key" ON "LearningStreak"("studentId");

-- CreateIndex
CREATE INDEX "ProgressMilestone_studentId_idx" ON "ProgressMilestone"("studentId");

-- CreateIndex
CREATE INDEX "ProgressMilestone_courseId_idx" ON "ProgressMilestone"("courseId");

-- CreateIndex
CREATE INDEX "ProgressMilestone_milestoneType_idx" ON "ProgressMilestone"("milestoneType");
