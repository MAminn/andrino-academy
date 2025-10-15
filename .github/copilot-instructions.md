# Andrino Academy AI Development Guide

## Project Overview

Arabic-first **External Learning Coordination Platform** built with Next.js 15, TypeScript, Prisma (SQLite), and NextAuth.js. Features a hierarchical academic structure: **Grade → Track → Session → Attendance** with comprehensive role-based access control.

**🚨 CRITICAL**: Andrino Academy is **NOT a self-hosted video platform**. It is a **coordination system** where all live sessions happen via **external links** (Zoom, Google Meet, Teams). No videos are hosted internally.

## Core Platform Concept

### External Session Coordination

- **All sessions are external**: Instructors provide meeting links to external platforms
- **No video hosting**: Platform manages scheduling, attendance, and coordination only
- **Link validation**: System validates external meeting URLs before allowing session start
- **Status-driven workflow**: Sessions progress through defined states based on link availability

### Session Lifecycle & Status System

```typescript
enum SessionStatus {
  DRAFT      // Session created without external link
  SCHEDULED  // Session scheduled with date/time but no external link
  READY      // Session has valid external link and is ready to start
  ACTIVE     // Session is currently in progress (external link active)
  COMPLETED  // Session finished successfully
  CANCELLED  // Session was cancelled
}
```

### External Link Validation Rules

- **Creation**: Sessions can be created without external links (status = DRAFT)
- **Scheduling**: Sessions can be scheduled without links (status = SCHEDULED)
- **Starting**: Sessions **CANNOT start** without valid external link
- **Joining**: Students can only join ACTIVE sessions with valid links
- **Validation**: Support for Zoom, Google Meet, Teams, and other HTTPS URLs

## Architecture Patterns

### Academic Hierarchy (Core Domain Model)

```
Grade (صف) → Track (مسار) → LiveSession (جلسة) → SessionAttendance (حضور)
```

- **Grades**: Age-based levels (المستوى الأول-الرابع)
- **Tracks**: Subject-specific learning paths within grades
- **Sessions**: Live classes with instructor, date/time, status, meetLink
- **Attendance**: Per-student, per-session tracking

### Role-Based Architecture (5 Roles)

- **Student**: View own data, join sessions, track progress
- **Instructor**: Manage assigned tracks/sessions, mark attendance
- **Coordinator**: Oversee tracks and session scheduling
- **Manager**: Academic administration, student-grade assignment
- **CEO**: Full system access, analytics across all roles

## Development Patterns

### External Link Management

All session operations must follow external coordination rules:

```typescript
// Session Creation - allowed without link
const newSession = {
  title: "Math Session",
  status: "DRAFT", // or "SCHEDULED" if date/time provided
  // externalLink is optional at creation
};

// Session Starting - requires validation
import {
  validateExternalMeetingLink,
  canStartSession,
} from "@/lib/sessionValidation";

if (!canStartSession(session.externalLink)) {
  throw new Error("Cannot start session without valid external meeting link");
}

// Student Joining - redirect to external platform
import { joinExternalMeeting } from "@/lib/sessionValidation";
joinExternalMeeting(session.externalLink); // Opens in new tab
```

### API Route Structure

All APIs follow this auth pattern with external link validation:

```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Role-based permission check
  const allowedRoles = ["manager", "ceo"];
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // External link validation for session operations
  if (action === "start") {
    const validation = validateExternalMeetingLink(externalLink);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Valid external meeting link required",
          details: validation.error,
        },
        { status: 400 }
      );
    }
  }
}
```

### Database Queries (Prisma Patterns)

- **Always include role-based filtering** in queries
- **Use include for related data** - sessions include track.grade.instructor
- **Consistent ordering**: `orderBy: [{ date: "asc" }, { startTime: "asc" }]`
- **Count relationships**: `_count: { select: { liveSessions: true } }`
- **External link support**: Use `externalLink` field (with `meetLink` legacy support)

### Session Status Management

```typescript
// Status transitions must follow external coordination rules
const validTransitions = {
  DRAFT: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["READY", "CANCELLED"], // when external link added
  READY: ["ACTIVE", "CANCELLED"], // when instructor starts
  ACTIVE: ["COMPLETED", "CANCELLED"],
  COMPLETED: [], // terminal state
  CANCELLED: [], // terminal state
};

// Automatic status updates based on external link
import { getSessionStatusFromLink } from "@/lib/sessionValidation";
const newStatus = getSessionStatusFromLink(
  externalLink,
  currentStatus,
  hasScheduledTime
);
```

### Arabic RTL Requirements

- **ALL components must have `dir='rtl'`** in containers
- **Icons use `ml-2` (margin-left)** not `mr-2` for RTL spacing
- **Date formatting**: `toLocaleDateString("ar-SA")` for Arabic dates
- **Time formatting**: `toLocaleTimeString("ar-SA", { hour12: true })`

### Dashboard Component Pattern

```typescript
// Required props for all dashboards
interface DashboardProps {
  title: string; // Arabic title
  role: string; // For auth verification
}

// Standard layout wrapper
<DashboardLayout title='لوحة تحكم الطالب' role='student'>
  <WelcomeCard name={user.name} description='...' />
  <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
    <StatCard title='...' value={count} icon={<Icon />} />
  </div>
</DashboardLayout>;
```

## Critical Workflows

### External Link Workflow

```typescript
// 1. Session Creation (no link required)
const session = await prisma.liveSession.create({
  data: {
    title: "Math Session",
    status: "DRAFT", // Default status
    // externalLink is optional
  },
});

// 2. Adding External Link (updates status automatically)
const validation = validateExternalMeetingLink(linkUrl);
if (validation.isValid) {
  await prisma.liveSession.update({
    where: { id: sessionId },
    data: {
      externalLink: linkUrl,
      status: "READY", // Auto-transition to READY
    },
  });
}

// 3. Starting Session (requires valid link)
if (canStartSession(session.externalLink)) {
  await prisma.liveSession.update({
    where: { id: sessionId },
    data: { status: "ACTIVE" },
  });
}

// 4. Student Joining (redirect to external platform)
if (canJoinSession(session.externalLink, session.status)) {
  joinExternalMeeting(session.externalLink); // Opens in new tab
}
```

### Development Setup

```bash
npm run dev          # Start dev server (usually port 3001)
npx prisma db push   # Apply schema changes
npx prisma db seed   # Load test data with all roles
```

### Authentication Testing

Use these pre-seeded accounts from `prisma/seed.ts`:

```
CEO: ceo@andrino-academy.com / Andrino2024!
Manager: manager@andrino-academy.com / Manager2024!
Coordinator: coordinator@andrino-academy.com / Coord2024!
Instructor: ahmed.instructor@andrino-academy.com / Instructor123!
Student: ali.student@andrino-academy.com / Student123!
```

### Database Schema Evolution

- **Prisma client location**: `src/generated/prisma` (custom output)
- **Always run `npx prisma generate`** after schema changes
- **Seed data maintains referential integrity** - modify `prisma/seed.ts` for test scenarios

## Integration Points

### Modal Components

Follow the established pattern in `src/app/components/`:

- **SessionLinkModal**: Instructor session management example
- **AttendanceModal**: Role-based data access example
- **Modal**: Base reusable modal with Arabic RTL support

### API Response Format

**Consistent wrapping** - APIs return `{ sessions }`, `{ tracks }`, `{ students }`:

```typescript
// Frontend must destructure properly
const response = await fetch("/api/sessions");
const { sessions } = await response.json(); // Not sessions directly
```

### State Management

- **React hooks only** - no external state management
- **useCallback for handlers** passed to child components
- **Modal state pattern**: `[showModal, setShowModal] = useState(false)`

## Project-Specific Conventions

### File Organization

- **Dashboard pages**: `src/app/[role]/dashboard/page.tsx`
- **Role-specific components**: `src/app/components/[role]/`
- **Shared components**: `src/app/components/dashboard/`
- **API routes**: `src/app/api/[resource]/[id]/route.ts`

### Error Handling

- **API errors**: Return `{ error: "message" }` with proper HTTP status
- **Frontend errors**: Display Arabic error messages in UI
- **Loading states**: Always show Arabic "جاري التحميل..." for UX

### Session Management

- **externalLink field**: Required before sessions can start (instructor responsibility)
- **Session status flow**: "DRAFT" → "SCHEDULED" → "READY" → "ACTIVE" → "COMPLETED"
- **Attendance tracking**: Only after session is created
- **External link validation**: Use `validateExternalMeetingLink()` utility

This LMS prioritizes **Arabic-first UX**, **role-based security**, **external coordination workflow**, and **academic workflow integrity**. Follow these patterns for consistent, maintainable code that respects the educational domain model and external platform integration.
