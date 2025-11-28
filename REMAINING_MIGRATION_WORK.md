# Migration Status - Remaining Work

## TypeScript Errors: 236 across 56 files

### Current Status
- ✅ **Infrastructure**: Complete (schema, db, migrations, seed, dockerfile)
- ✅ **Auth System**: Partially migrated (server-side better-auth working, client needs types)
- ⚠️ **API Routes**: ~40 files still have Prisma code that needs manual Drizzle conversion
- ⚠️ **Client Components**: ~20 files need better-auth type extensions for `role` field

### Critical Blocker Issues

#### 1. Better-Auth Type Extension Needed
Better-auth doesn't include custom fields like `role` by default. Need to extend types:

**Solution**: Create `types/better-auth.d.ts`:
```typescript
import type { auth } from "@/lib/auth";

declare module "better-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string; // Add custom role field
      image?: string | null;
    };
  }
}
```

#### 2. Better-Auth Client API Differences
- **signIn**: Better-auth uses different API
  - OLD: `signIn("credentials", { email, password })`
  - NEW: `authClient.signIn.email({ email, password })`

- **signOut**: Different options
  - OLD: `signOut({ callbackUrl: "/" })`
  - NEW: `authClient.signOut()` then manual redirect

- **useSession**: Returns different shape
  - OLD: `{ data: session, status }`
  - NEW: `{ data: session, isPending }` (use `isPending` instead of `status`)

####3. Remaining Prisma→Drizzle Conversions

**Files with Multiple Prisma Calls** (need extensive rewrites):
1. `src/app/api/sessions/route.ts` (12 prisma calls)
2. `src/app/api/sessions/manage/route.ts` (9 prisma calls)
3. `src/app/api/sessions/meeting-link/route.ts` (9 prisma calls)
4. `src/app/api/sessions/control/[sessionId]/route.ts` (9 prisma calls)
5. `src/app/api/tracks/route.ts` (7 prisma calls)
6. `src/app/api/student/book-session/route.ts` (7 prisma calls)
7. `src/app/api/instructor/availability/route.ts` (6 prisma calls)
8. `src/app/api/modules/route.ts` (5 prisma calls)
9. `src/app/api/settings/schedule/route.ts` (5 prisma calls)
10. `src/app/api/students/assign-grade/route.ts` (4 prisma calls)

**Files with 1-3 Prisma Calls** (simpler conversions):
- 30+ additional files

### Estimation
- **Time to fix**: 12-16 hours for one developer
- **Complexity**: High (each Prisma query needs manual Drizzle conversion)
- **Testing required**: Extensive (each endpoint needs verification)

### Recommended Approach

**Phase 1: Fix Type System** (1 hour)
1. Create `types/better-auth.d.ts` with role extension
2. Update `src/lib/auth.ts` to include role in user config
3. Fix signIn/signOut calls in signin page
4. Replace `status` with `isPending` in all useSession calls

**Phase 2: Convert High-Priority API Routes** (6-8 hours)
Convert files in order of importance:
1. Authentication routes (register already done)
2. User/Student CRUD routes
3. Track CRUD routes
4. Session CRUD routes
5. Booking/Availability routes
6. Module/Content routes
7. Reports/Analytics routes

**Phase 3: Test & Fix Remaining** (4-6 hours)
1. Run `npx tsc --noEmit` after each batch
2. Test each endpoint with Postman/Thunder Client
3. Fix runtime errors as discovered

### Quick Wins Available
Some files just need import changes (already done by PowerShell script):
- All API routes have auth imports updated
- All client components have auth imports updated
- Just need to fix:
  - prisma query conversions
  - Type definitions
  - API call patterns

### What's Working Now
- ✅ Database schema (all 25+ tables defined)
- ✅ Database connection pooling
- ✅ Auth server configuration
- ✅ Seed data script
- ✅ Docker configuration
- ✅ 2 API routes fully converted (users, grades)
- ✅ Client auth imports updated

### What's Broken
- ❌ 40+ API routes still calling `prisma.*`
- ❌ Client components missing `role` type
- ❌ signIn/signOut implementations incorrect
- ❌ Type errors preventing build

### Next Immediate Steps
1. Create better-auth type extension file
2. Fix auth.ts to include role in session
3. Update signin page signIn call
4. Convert top 10 high-traffic API routes
5. Run tsc and fix remaining errors iteratively
