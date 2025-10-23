# PostgreSQL Schema Migration Instructions

## Quick Reference: Required Changes for PostgreSQL

### 1. Update datasource in `prisma/schema.prisma`

**Change Line 12-14 from:**

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**To:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Replace all ID generators

**Find and Replace:**

- Find: `@default(cuid())`
- Replace with: `@default(uuid())`

**Or use this command in terminal:**

```bash
# On Linux/Mac
sed -i 's/@default(cuid())/@default(uuid())/g' prisma/schema.prisma

# On Windows (PowerShell)
(Get-Content prisma/schema.prisma) -replace '@default\(cuid\(\)\)', '@default(uuid())' | Set-Content prisma/schema.prisma
```

### 3. Verify Changes

After replacement, your ID fields should look like:

```prisma
model User {
  id String @id @default(uuid())
  // ... rest of fields
}

model Account {
  id String @id @default(uuid())
  // ... rest of fields
}

model Session {
  id String @id @default(uuid())
  // ... rest of fields
}

// ... and so on for all models
```

### 4. Update Environment Variables

**Development (.env or .env.local):**

```env
DATABASE_URL="file:./prisma/dev.db"
```

**Production (.env on VPS):**

```env
DATABASE_URL="postgresql://andrino_admin:YOUR_PASSWORD@localhost:5432/andrino_academy_prod?schema=public"
```

### 5. Regenerate Prisma Client

```bash
npx prisma generate
```

### 6. Apply Schema to PostgreSQL

```bash
npx prisma db push
```

### 7. Seed Database

```bash
npm run db:seed
```

---

## PostgreSQL vs SQLite - What Changed?

| Aspect               | SQLite (Dev)    | PostgreSQL (Prod)        |
| -------------------- | --------------- | ------------------------ |
| **Provider**         | `sqlite`        | `postgresql`             |
| **Connection**       | `file:./dev.db` | `postgresql://...`       |
| **ID Generation**    | `cuid()`        | `uuid()`                 |
| **Concurrent Users** | Limited         | Unlimited                |
| **Performance**      | Good for dev    | Optimized for production |
| **Transactions**     | Basic           | Advanced                 |
| **Data Integrity**   | Good            | Excellent                |

---

## Affected Models (39 Total)

All these models have `id` fields that need updating:

1. User
2. Account
3. Session
4. VerificationToken
5. Grade
6. Track
7. LiveSession
8. SessionAttendance
9. Course
10. Module
11. Lesson
12. Enrollment
13. Assignment
14. AssignmentSubmission
15. Exam
16. ExamQuestion
17. ExamAttempt
18. ExamAnswer
19. Attendance
20. Certificate
21. Payment
22. Invoice
23. InvoiceItem
24. SessionProgress
25. LearningActivity
26. LearningStreak
27. ProgressMilestone
28. Category
29. Quiz
30. QuizQuestion
31. QuizAttempt
32. QuizAnswer
33. Forum
34. ForumPost
35. ForumReply
36. Notification
37. Message
38. Announcement
39. SystemLog

**All of these will be updated by the find/replace command.**

---

## Validation Checklist

After making changes:

- [ ] `datasource db` provider is `postgresql`
- [ ] `datasource db` url is `env("DATABASE_URL")`
- [ ] All `@default(cuid())` changed to `@default(uuid())`
- [ ] No `@default(cuid())` remaining: `grep -r "cuid()" prisma/schema.prisma` returns nothing
- [ ] Schema validates: `npx prisma validate`
- [ ] Prisma client generates: `npx prisma generate`

---

## Rollback (If Needed)

If you need to go back to SQLite:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Then revert ID generators:

```bash
# Find and replace back
sed -i 's/@default(uuid())/@default(cuid())/g' prisma/schema.prisma

# Regenerate
npx prisma generate
```

---

## Next Steps After Schema Update

1. **Commit changes to git:**

   ```bash
   git add prisma/schema.prisma
   git commit -m "Update schema for PostgreSQL production deployment"
   git push
   ```

2. **Deploy to VPS** (follow DEPLOYMENT_CHECKLIST.md)

3. **Run migrations on VPS:**

   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

4. **Build and start application:**
   ```bash
   npm run build
   pm2 start ecosystem.config.js
   ```

---

## Important Notes

⚠️ **Do NOT run this on production with existing data without backup!**

✅ **Safe for:**

- New deployments
- Fresh installations
- Development → Production migration

❌ **Not safe for:**

- Production databases with existing user data
- Live systems without testing

For production data migration, see: `POSTGRESQL_MIGRATION_GUIDE.md`

---

## Quick Command Summary

```bash
# 1. Update schema provider manually (edit file)

# 2. Replace cuid() with uuid()
sed -i 's/@default(cuid())/@default(uuid())/g' prisma/schema.prisma

# 3. Validate
npx prisma validate

# 4. Generate client
npx prisma generate

# 5. Push to database
npx prisma db push

# 6. Seed data
npm run db:seed

# 7. Build app
npm run build

# 8. Start with PM2
pm2 start ecosystem.config.js
```

Done! Your schema is now PostgreSQL-ready. 🚀
