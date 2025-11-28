import { relations, sql } from "drizzle-orm";
import {
  boolean,
  datetime,
  float,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";
import { nanoid } from "nanoid";

// ========================================
// USERS & AUTHENTICATION
// ========================================

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: varchar("password", { length: 255 }),
    role: varchar("role", { length: 50 }).default("student").notNull(), // student, instructor, coordinator, manager, ceo
    emailVerified: boolean("email_verified").default(false),
    image: varchar("image", { length: 500 }),
    
    // Student-specific fields
    age: int("age"),
    parentEmail: varchar("parent_email", { length: 255 }),
    parentPhone: varchar("parent_phone", { length: 50 }),
    parentName: varchar("parent_name", { length: 255 }),
    priorExperience: varchar("prior_experience", { length: 50 }), // "none", "basic", "intermediate", "advanced"
    gradeLevel: varchar("grade_level", { length: 50 }), // Calculated: "beginner", "elementary", "intermediate", "advanced"
    gradeId: varchar("grade_id", { length: 255 }),
    
    // Profile fields
    phone: varchar("phone", { length: 50 }),
    address: text("address"),
    emergencyContact: varchar("emergency_contact", { length: 255 }),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    roleIdx: index("role_idx").on(table.role),
    gradeIdIdx: index("grade_id_idx").on(table.gradeId),
  })
);

export const accounts = mysqlTable(
  "accounts",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: varchar("user_id", { length: 255 }).notNull(),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    expiresAt: datetime("expires_at"),
    password: varchar("password", { length: 255 }), // Passwords stored here for credential accounts
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    providerIdx: index("provider_idx").on(table.providerId, table.accountId),
  })
);

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: varchar("user_id", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    expiresAt: datetime("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    tokenIdx: index("token_idx").on(table.token),
  })
);

export const verificationTokens = mysqlTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).unique().notNull(),
    expires: timestamp("expires").notNull(),
  },
  (table) => ({
    identifierTokenIdx: unique("identifier_token_idx").on(table.identifier, table.token),
  })
);

// ========================================
// ACADEMIC STRUCTURE
// ========================================

export const grades = mysqlTable(
  "grades",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: varchar("name", { length: 255 }).unique().notNull(),
    description: text("description"),
    order: int("order"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    isActiveIdx: index("is_active_idx").on(table.isActive),
    orderIdx: index("order_idx").on(table.order),
  })
);

export const tracks = mysqlTable(
  "tracks",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    gradeId: varchar("grade_id", { length: 255 }).notNull(),
    instructorId: varchar("instructor_id", { length: 255 }).notNull(),
    coordinatorId: varchar("coordinator_id", { length: 255 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    order: int("order"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    gradeIdIdx: index("grade_id_idx").on(table.gradeId),
    instructorIdIdx: index("instructor_id_idx").on(table.instructorId),
    coordinatorIdIdx: index("coordinator_id_idx").on(table.coordinatorId),
    isActiveIdx: index("is_active_idx").on(table.isActive),
  })
);

export const sessionStatusEnum = mysqlEnum("session_status", [
  "DRAFT",
  "SCHEDULED",
  "READY",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
]);

export const liveSessions = mysqlTable(
  "live_sessions",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    trackId: varchar("track_id", { length: 255 }).notNull(),
    instructorId: varchar("instructor_id", { length: 255 }).notNull(),
    date: timestamp("date").notNull(),
    startTime: varchar("start_time", { length: 10 }).notNull(), // "HH:mm"
    endTime: varchar("end_time", { length: 10 }).notNull(), // "HH:mm"
    externalLink: varchar("external_link", { length: 500 }),
    linkAddedAt: datetime("link_added_at"),
    status: sessionStatusEnum.default("DRAFT").notNull(),
    materials: text("materials"), // JSON
    notes: text("notes"),
    feedbackCollected: boolean("feedback_collected").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    trackIdIdx: index("track_id_idx").on(table.trackId),
    instructorIdIdx: index("instructor_id_idx").on(table.instructorId),
    dateIdx: index("date_idx").on(table.date),
    statusIdx: index("status_idx").on(table.status),
  })
);

export const sessionAttendances = mysqlTable(
  "session_attendances",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    sessionId: varchar("session_id", { length: 255 }).notNull(),
    studentId: varchar("student_id", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).default("absent").notNull(), // present, absent, late, excused
    markedAt: timestamp("marked_at").defaultNow().notNull(),
    markedBy: varchar("marked_by", { length: 255 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    sessionStudentIdx: unique("session_student_idx").on(table.sessionId, table.studentId),
    sessionIdIdx: index("session_id_idx").on(table.sessionId),
    studentIdIdx: index("student_id_idx").on(table.studentId),
    statusIdx: index("status_idx").on(table.status),
  })
);

// ========================================
// CONTENT MANAGEMENT
// ========================================

export const moduleCategoryEnum = mysqlEnum("module_category", [
  "LECTURE",
  "TUTORIAL",
  "EXERCISE",
  "REFERENCE",
  "SLIDES",
  "HANDOUT",
  "ASSIGNMENT",
  "SOLUTION",
  "SUPPLEMENTARY",
  "PROJECT",
  "UNCATEGORIZED",
]);

export const modules = mysqlTable(
  "modules",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    targetAudience: varchar("target_audience", { length: 50 }).default("student").notNull(),
    category: moduleCategoryEnum.default("UNCATEGORIZED").notNull(),
    order: int("order").default(0).notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    trackId: varchar("track_id", { length: 255 }).notNull(),
    sessionId: varchar("session_id", { length: 255 }),
    uploadedBy: varchar("uploaded_by", { length: 255 }).notNull(),
    weekNumber: int("week_number"),
    startDate: datetime("start_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    trackIdIdx: index("track_id_idx").on(table.trackId),
    sessionIdIdx: index("session_id_idx").on(table.sessionId),
    categoryIdx: index("category_idx").on(table.category),
    isPublishedIdx: index("is_published_idx").on(table.isPublished),
    orderIdx: index("order_idx").on(table.order),
    targetAudienceIdx: index("target_audience_idx").on(table.targetAudience),
    weekNumberIdx: index("week_number_idx").on(table.weekNumber),
    startDateIdx: index("start_date_idx").on(table.startDate),
  })
);

export const moduleTypeEnum = mysqlEnum("module_type", ["VIDEO", "PDF", "DOCUMENT", "IMAGE"]);

export const contentItems = mysqlTable(
  "content_items",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    moduleId: varchar("module_id", { length: 255 }).notNull(),
    type: moduleTypeEnum.notNull(),
    fileUrl: varchar("file_url", { length: 500 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileSize: int("file_size").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    duration: int("duration"), // Video duration in seconds
    order: int("order").default(0).notNull(),
    targetAudience: varchar("target_audience", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    moduleIdIdx: index("module_id_idx").on(table.moduleId),
    orderIdx: index("order_idx").on(table.order),
  })
);

export const tasks = mysqlTable(
  "tasks",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    moduleId: varchar("module_id", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    order: int("order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    moduleIdIdx: index("module_id_idx").on(table.moduleId),
    orderIdx: index("order_idx").on(table.order),
  })
);

export const assignments = mysqlTable(
  "assignments",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    moduleId: varchar("module_id", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    fileUrl: varchar("file_url", { length: 500 }),
    fileName: varchar("file_name", { length: 255 }),
    fileSize: int("file_size"),
    mimeType: varchar("mime_type", { length: 100 }),
    dueDate: datetime("due_date"),
    order: int("order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    moduleIdIdx: index("module_id_idx").on(table.moduleId),
    orderIdx: index("order_idx").on(table.order),
  })
);

export const assignmentSubmissions = mysqlTable(
  "assignment_submissions",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    assignmentId: varchar("assignment_id", { length: 255 }).notNull(),
    studentId: varchar("student_id", { length: 255 }).notNull(),
    fileUrl: varchar("file_url", { length: 500 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileSize: int("file_size").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    submittedAt: timestamp("submitted_at", { mode: "date" }).defaultNow().notNull(),
    grade: float("grade"),
    feedback: text("feedback"),
    gradedAt: datetime("graded_at"),
    gradedBy: varchar("graded_by", { length: 255 }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    assignmentStudentIdx: unique("assignment_student_idx").on(table.assignmentId, table.studentId),
    studentIdIdx: index("student_id_idx").on(table.studentId),
    assignmentIdIdx: index("assignment_id_idx").on(table.assignmentId),
  })
);

// ========================================
// INSTRUCTOR AVAILABILITY & BOOKING
// ========================================

export const instructorAvailabilities = mysqlTable(
  "instructor_availabilities",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    instructorId: varchar("instructor_id", { length: 255 }).notNull(),
    trackId: varchar("track_id", { length: 255 }).notNull(),
    weekStartDate: timestamp("week_start_date").notNull(),
    dayOfWeek: int("day_of_week").notNull(), // 0=Sunday, 1=Monday, etc.
    startHour: int("start_hour").notNull(), // 13-22
    endHour: int("end_hour").notNull(), // 13-22
    isBooked: boolean("is_booked").default(false).notNull(),
    isConfirmed: boolean("is_confirmed").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    instructorTrackWeekDayHourIdx: unique("instructor_track_week_day_hour_idx").on(
      table.instructorId,
      table.trackId,
      table.weekStartDate,
      table.dayOfWeek,
      table.startHour
    ),
    instructorIdIdx: index("instructor_id_idx").on(table.instructorId),
    trackIdIdx: index("track_id_idx").on(table.trackId),
    weekStartDateIdx: index("week_start_date_idx").on(table.weekStartDate),
  })
);

export const sessionBookings = mysqlTable(
  "session_bookings",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    availabilityId: varchar("availability_id", { length: 255 }).notNull(),
    studentId: varchar("student_id", { length: 255 }).notNull(),
    trackId: varchar("track_id", { length: 255 }).notNull(),
    sessionId: varchar("session_id", { length: 255 }),
    status: varchar("status", { length: 50 }).default("booked").notNull(), // booked, confirmed, completed, cancelled
    studentNotes: text("student_notes"),
    instructorNotes: text("instructor_notes"),
    feedbackGivenAt: datetime("feedback_given_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    availabilityStudentIdx: unique("availability_student_idx").on(table.availabilityId, table.studentId),
    studentIdIdx: index("student_id_idx").on(table.studentId),
    trackIdIdx: index("track_id_idx").on(table.trackId),
    availabilityIdIdx: index("availability_id_idx").on(table.availabilityId),
  })
);

export const scheduleSettings = mysqlTable("schedule_settings", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  weekResetDay: int("week_reset_day").default(6).notNull(), // 6=Saturday
  weekResetHour: int("week_reset_hour").default(0).notNull(), // 0=midnight
  availabilityOpenHours: int("availability_open_hours").default(24).notNull(),
  nextOpenDate: datetime("next_open_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ========================================
// PACKAGES
// ========================================

export const packages = mysqlTable(
  "packages",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: varchar("name", { length: 255 }).notNull(),
    price: float("price").notNull(),
    discountedPrice: float("discounted_price"),
    minAge: int("min_age").notNull(),
    maxAge: int("max_age").notNull(),
    description: text("description").notNull(),
    perks: text("perks").notNull(), // JSON
    durationMonths: int("duration_months").notNull(),
    sessionsPerLevel: int("sessions_per_level").notNull(),
    pricePerSession: float("price_per_session").notNull(),
    badge: varchar("badge", { length: 100 }),
    order: int("order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    isActiveIdx: index("is_active_idx").on(table.isActive),
    orderIdx: index("order_idx").on(table.order),
  })
);

// ========================================
// RELATIONS (for Drizzle ORM query builder)
// ========================================

export const usersRelations = relations(users, ({ one, many }) => ({
  grade: one(grades, {
    fields: [users.gradeId],
    references: [grades.id],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  instructedTracks: many(tracks, { relationName: "trackInstructor" }),
  coordinatedTracks: many(tracks, { relationName: "trackCoordinator" }),
  instructedSessions: many(liveSessions),
  sessionAttendances: many(sessionAttendances),
  instructorAvailabilities: many(instructorAvailabilities),
  studentBookings: many(sessionBookings),
  assignmentSubmissions: many(assignmentSubmissions, { relationName: "studentSubmissions" }),
  gradedSubmissions: many(assignmentSubmissions, { relationName: "graderSubmissions" }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const gradesRelations = relations(grades, ({ many }) => ({
  students: many(users),
  tracks: many(tracks),
}));

export const tracksRelations = relations(tracks, ({ one, many }) => ({
  grade: one(grades, {
    fields: [tracks.gradeId],
    references: [grades.id],
  }),
  instructor: one(users, {
    fields: [tracks.instructorId],
    references: [users.id],
    relationName: "trackInstructor",
  }),
  coordinator: one(users, {
    fields: [tracks.coordinatorId],
    references: [users.id],
    relationName: "trackCoordinator",
  }),
  liveSessions: many(liveSessions),
  modules: many(modules),
  instructorAvailabilities: many(instructorAvailabilities),
  sessionBookings: many(sessionBookings),
}));

export const liveSessionsRelations = relations(liveSessions, ({ one, many }) => ({
  track: one(tracks, {
    fields: [liveSessions.trackId],
    references: [tracks.id],
  }),
  instructor: one(users, {
    fields: [liveSessions.instructorId],
    references: [users.id],
  }),
  attendances: many(sessionAttendances),
  modules: many(modules),
  bookings: many(sessionBookings),
}));

export const sessionAttendancesRelations = relations(sessionAttendances, ({ one }) => ({
  session: one(liveSessions, {
    fields: [sessionAttendances.sessionId],
    references: [liveSessions.id],
  }),
  student: one(users, {
    fields: [sessionAttendances.studentId],
    references: [users.id],
  }),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  track: one(tracks, {
    fields: [modules.trackId],
    references: [tracks.id],
  }),
  session: one(liveSessions, {
    fields: [modules.sessionId],
    references: [liveSessions.id],
  }),
  contentItems: many(contentItems),
  tasks: many(tasks),
  assignments: many(assignments),
}));

export const contentItemsRelations = relations(contentItems, ({ one }) => ({
  module: one(modules, {
    fields: [contentItems.moduleId],
    references: [modules.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  module: one(modules, {
    fields: [tasks.moduleId],
    references: [modules.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  module: one(modules, {
    fields: [assignments.moduleId],
    references: [modules.id],
  }),
  submissions: many(assignmentSubmissions),
}));

export const assignmentSubmissionsRelations = relations(assignmentSubmissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentSubmissions.assignmentId],
    references: [assignments.id],
  }),
  student: one(users, {
    fields: [assignmentSubmissions.studentId],
    references: [users.id],
    relationName: "studentSubmissions",
  }),
  grader: one(users, {
    fields: [assignmentSubmissions.gradedBy],
    references: [users.id],
    relationName: "graderSubmissions",
  }),
}));

export const instructorAvailabilitiesRelations = relations(instructorAvailabilities, ({ one, many }) => ({
  instructor: one(users, {
    fields: [instructorAvailabilities.instructorId],
    references: [users.id],
  }),
  track: one(tracks, {
    fields: [instructorAvailabilities.trackId],
    references: [tracks.id],
  }),
  bookings: many(sessionBookings),
}));

export const sessionBookingsRelations = relations(sessionBookings, ({ one }) => ({
  availability: one(instructorAvailabilities, {
    fields: [sessionBookings.availabilityId],
    references: [instructorAvailabilities.id],
  }),
  student: one(users, {
    fields: [sessionBookings.studentId],
    references: [users.id],
  }),
  track: one(tracks, {
    fields: [sessionBookings.trackId],
    references: [tracks.id],
  }),
  session: one(liveSessions, {
    fields: [sessionBookings.sessionId],
    references: [liveSessions.id],
  }),
}));
