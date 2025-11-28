# API Routes Migration Guide: Prisma → Drizzle

## Status: IN PROGRESS
**Critical files converted:** users, tracks (examples completed)
**Remaining files:** ~40+ API route files need conversion

## Conversion Pattern

### 1. Import Changes
```typescript
// OLD (Prisma + NextAuth)
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { SomeModel } from "@prisma/client";

// NEW (Drizzle + better-auth)
import { auth } from "@/lib/auth";
import { db, schema, eq, and, or, desc, asc, count, sql } from "@/lib/db";
```

### 2. Authentication
```typescript
// OLD
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// NEW
const session = await auth.api.getSession({ headers: request.headers });
if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

### 3. Query Conversions

#### Find Many
```typescript
// OLD
const users = await prisma.user.findMany({
  where: { role: "student" },
  orderBy: { name: "asc" }
});

// NEW
const users = await db
  .select()
  .from(schema.users)
  .where(eq(schema.users.role, "student"))
  .orderBy(asc(schema.users.name));
```

#### Find Unique/First
```typescript
// OLD
const user = await prisma.user.findUnique({ where: { id: userId } });

// NEW
const [user] = await db
  .select()
  .from(schema.users)
  .where(eq(schema.users.id, userId))
  .limit(1);
```

#### Create
```typescript
// OLD
const user = await prisma.user.create({
  data: { name: "John", email: "john@example.com" }
});

// NEW
const [user] = await db
  .insert(schema.users)
  .values({ name: "John", email: "john@example.com" })
  .$returningId(); // or just .values() if you don't need the ID back
```

#### Update
```typescript
// OLD
const user = await prisma.user.update({
  where: { id: userId },
  data: { name: "Jane" }
});

// NEW
await db
  .update(schema.users)
  .set({ name: "Jane" })
  .where(eq(schema.users.id, userId));
```

#### Delete
```typescript
// OLD
await prisma.user.delete({ where: { id: userId } });

// NEW
await db
  .delete(schema.users)
  .where(eq(schema.users.id, userId));
```

### 4. Complex Queries

#### With Relations (Nested Includes)
```typescript
// OLD
const track = await prisma.track.findUnique({
  where: { id: trackId },
  include: {
    grade: true,
    instructor: true,
    liveSessions: { where: { status: "COMPLETED" } }
  }
});

// NEW - Option 1: Separate queries
const [track] = await db
  .select()
  .from(schema.tracks)
  .where(eq(schema.tracks.id, trackId))
  .limit(1);

const [grade] = await db
  .select()
  .from(schema.grades)
  .where(eq(schema.grades.id, track.gradeId))
  .limit(1);

const sessions = await db
  .select()
  .from(schema.liveSessions)
  .where(and(
    eq(schema.liveSessions.trackId, trackId),
    eq(schema.liveSessions.status, "COMPLETED")
  ));

// NEW - Option 2: Using joins
import { eq } from "drizzle-orm";

const trackWithGrade = await db
  .select({
    track: schema.tracks,
    grade: schema.grades,
  })
  .from(schema.tracks)
  .leftJoin(schema.grades, eq(schema.tracks.gradeId, schema.grades.id))
  .where(eq(schema.tracks.id, trackId));
```

#### Count Queries
```typescript
// OLD
const count = await prisma.user.count({ where: { role: "student" } });

// NEW
import { count, eq } from "drizzle-orm";

const [result] = await db
  .select({ count: count() })
  .from(schema.users)
  .where(eq(schema.users.role, "student"));
const userCount = result.count;
```

#### Multiple Conditions
```typescript
// OLD
const sessions = await prisma.liveSession.findMany({
  where: {
    trackId: trackId,
    date: { gte: startDate, lte: endDate },
    status: { in: ["SCHEDULED", "ACTIVE"] }
  }
});

// NEW
import { and, gte, lte, inArray } from "drizzle-orm";

const sessions = await db
  .select()
  .from(schema.liveSessions)
  .where(and(
    eq(schema.liveSessions.trackId, trackId),
    gte(schema.liveSessions.date, startDate),
    lte(schema.liveSessions.date, endDate),
    inArray(schema.liveSessions.status, ["SCHEDULED", "ACTIVE"])
  ));
```

### 5. Enum Usage
```typescript
// OLD
import { SessionStatus } from "@prisma/client";
if (session.status === SessionStatus.COMPLETED) { ... }

// NEW - Enums are now MySQL enums in schema, use string literals
if (session.status === "COMPLETED") { ... }
```

## Files Requiring Conversion

### High Priority (Core CRUD)
- [x] src/app/api/users/route.ts - DONE
- [ ] src/app/api/tracks/route.ts
- [ ] src/app/api/tracks/[id]/route.ts
- [ ] src/app/api/sessions/route.ts
- [ ] src/app/api/sessions/[id]/route.ts
- [ ] src/app/api/students/route.ts
- [ ] src/app/api/students/[id]/route.ts

### Medium Priority (Features)
- [ ] src/app/api/instructor/availability/route.ts
- [ ] src/app/api/instructor/bookings/route.ts
- [ ] src/app/api/student/book-session/route.ts
- [ ] src/app/api/student/bookings/route.ts
- [ ] src/app/api/sessions/[id]/attendance/route.ts
- [ ] src/app/api/modules/route.ts
- [ ] src/app/api/modules/[id]/route.ts

### Lower Priority (Reports/Settings)
- [ ] src/app/api/reports/attendance/route.ts
- [ ] src/app/api/settings/schedule/route.ts
- [ ] src/app/api/packages/route.ts
- [ ] src/app/api/grades/[id]/route.ts

## Next Steps
1. Convert high-priority files first
2. Test each converted endpoint
3. Update any TypeScript types that reference Prisma types
4. Remove @prisma/client imports once all files converted
