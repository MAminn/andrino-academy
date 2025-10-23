# Migrating from SQLite to PostgreSQL - Andrino Academy

## 🎯 Overview

This guide walks you through migrating your Andrino Academy LMS database from **SQLite** (development) to **PostgreSQL** (production).

**Why migrate?**

- ✅ PostgreSQL handles concurrent connections better
- ✅ Better for multi-user web applications
- ✅ More robust data integrity
- ✅ Better performance at scale
- ✅ Industry standard for production deployments

---

## 📋 Prerequisites

- PostgreSQL 15+ installed on VPS
- Database created: `andrino_academy_prod`
- Database user created: `andrino_admin`
- Access to your current SQLite database (`prisma/dev.db`)

---

## 🔄 Migration Steps

### Step 1: Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
// BEFORE (SQLite)
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// AFTER (PostgreSQL)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 2: Update ID Fields (CRITICAL)

SQLite uses `cuid()` for IDs, but PostgreSQL needs `uuid()`:

```bash
# Find all instances and replace
sed -i 's/@default(cuid())/@default(uuid())/g' prisma/schema.prisma
```

**Manual verification needed:**
Open `prisma/schema.prisma` and verify all ID fields look like this:

```prisma
model User {
  id String @id @default(uuid())  // Changed from cuid()
  // ...
}
```

### Step 3: Handle DateTime Defaults

PostgreSQL is stricter about DateTime. Update these fields:

```prisma
// BEFORE
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// AFTER (same - but verify)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

### Step 4: Update Environment Variables

**Development (.env.local):**

```env
DATABASE_URL="file:./prisma/dev.db"
```

**Production (.env):**

```env
DATABASE_URL="postgresql://andrino_admin:YOUR_PASSWORD@localhost:5432/andrino_academy_prod?schema=public"
```

### Step 5: Generate New Prisma Client

```bash
# Generate Prisma Client for PostgreSQL
npx prisma generate

# This will regenerate src/generated/prisma with PostgreSQL types
```

### Step 6: Create Database Schema

```bash
# Push schema to PostgreSQL (creates tables)
npx prisma db push

# You'll see output like:
# ✔ Generated Prisma Client to ./src/generated/prisma
# ✔ Schema successfully pushed to database
```

### Step 7: Migrate Data (Optional - Two Methods)

#### Method A: Fresh Start with Seed Data (Recommended for Production)

```bash
# Run your seed script
npm run db:seed

# This will create:
# - 5 role-based test users
# - Sample grades and tracks
# - Test sessions and attendance records
```

#### Method B: Migrate Existing SQLite Data

If you have production data in SQLite that must be migrated:

```bash
# Export SQLite data to SQL
sqlite3 prisma/dev.db .dump > sqlite_dump.sql

# Clean up SQLite-specific syntax
sed -i 's/AUTOINCREMENT/SERIAL/g' sqlite_dump.sql
sed -i 's/INTEGER PRIMARY KEY/SERIAL PRIMARY KEY/g' sqlite_dump.sql

# Import to PostgreSQL (manual cleanup required)
# This is complex and may require custom migration scripts
```

**⚠️ Important:** Direct SQLite to PostgreSQL migration is complex. For production launch, using seed data is recommended.

---

## 🧪 Testing the Migration

### Test 1: Verify Schema

```bash
# Connect to PostgreSQL
psql -U andrino_admin -d andrino_academy_prod

# List all tables
\dt

# Should show:
# Account, Session, User, Grade, Track, LiveSession, etc.

# Check User table structure
\d "User"

# Exit
\q
```

### Test 2: Verify Data

```sql
-- Count records in each table
SELECT 'Users' as table_name, COUNT(*) FROM "User"
UNION ALL
SELECT 'Grades', COUNT(*) FROM "Grade"
UNION ALL
SELECT 'Tracks', COUNT(*) FROM "Track"
UNION ALL
SELECT 'LiveSessions', COUNT(*) FROM "LiveSession";
```

### Test 3: Test Application Locally

```bash
# Update local .env to use PostgreSQL temporarily
DATABASE_URL="postgresql://andrino_admin:PASSWORD@YOUR_VPS_IP:5432/andrino_academy_prod?schema=public"

# Start dev server
npm run dev

# Test login with seeded accounts:
# - ceo@andrino-academy.com / Andrino2024!
# - manager@andrino-academy.com / Manager2024!
# - ali.student@andrino-academy.com / Student123!
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "Type mismatch" errors

**Cause:** ID fields using wrong generator

**Solution:**

```prisma
// Ensure all models use uuid()
id String @id @default(uuid())
```

### Issue 2: "Relation constraint failed"

**Cause:** Foreign key references don't match

**Solution:**

```bash
# Drop and recreate schema
npx prisma db push --force-reset
npm run db:seed
```

### Issue 3: "Column does not exist"

**Cause:** Schema not synced

**Solution:**

```bash
npx prisma generate
npx prisma db push
```

### Issue 4: Connection refused

**Cause:** PostgreSQL not accepting connections

**Solution:**

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string format
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

### Issue 5: "Unique constraint violation"

**Cause:** Seed data already exists

**Solution:**

```bash
# Reset database
npx prisma db push --force-reset

# Re-seed
npm run db:seed
```

---

## 📊 Schema Comparison

### SQLite vs PostgreSQL Data Types

| SQLite Type | PostgreSQL Type  | Usage       |
| ----------- | ---------------- | ----------- |
| INTEGER     | INTEGER / SERIAL | Numbers     |
| TEXT        | VARCHAR / TEXT   | Strings     |
| REAL        | REAL / NUMERIC   | Decimals    |
| BLOB        | BYTEA            | Binary data |
| -           | UUID             | Unique IDs  |
| -           | TIMESTAMP        | Date/time   |

### ID Generation

```prisma
// SQLite (Development)
id String @id @default(cuid())

// PostgreSQL (Production)
id String @id @default(uuid())
```

---

## 🚀 Production Deployment Workflow

1. **Local Development:**

   - Keep using SQLite: `file:./prisma/dev.db`
   - Fast, simple, no setup needed

2. **Before Production Deployment:**

   - Update schema: `cuid()` → `uuid()`
   - Test with PostgreSQL locally
   - Verify all queries work

3. **Production Server:**

   - Use PostgreSQL: `postgresql://...`
   - Run migrations: `npx prisma db push`
   - Seed initial data: `npm run db:seed`

4. **Environment Variables:**

   ```bash
   # Development
   DATABASE_URL="file:./prisma/dev.db"

   # Production
   DATABASE_URL="postgresql://andrino_admin:PASSWORD@localhost:5432/andrino_academy_prod"
   ```

---

## 🔐 Security Checklist

After migration:

- [ ] Database password is strong (20+ characters)
- [ ] PostgreSQL only listens on localhost
- [ ] Database user has limited privileges (not superuser)
- [ ] Connection string not committed to git
- [ ] SSL enabled for remote connections (if needed)
- [ ] Daily backups configured
- [ ] Firewall allows only necessary connections

---

## 📈 Performance Tuning (PostgreSQL)

After migration, optimize PostgreSQL:

```sql
-- Create indexes on frequently queried columns
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_session_instructor ON "LiveSession"("instructorId");
CREATE INDEX idx_session_track ON "LiveSession"("trackId");
CREATE INDEX idx_attendance_session ON "SessionAttendance"("sessionId");
CREATE INDEX idx_attendance_student ON "SessionAttendance"("studentId");
CREATE INDEX idx_track_grade ON "Track"("gradeId");

-- Update statistics
ANALYZE;

-- Check index usage (after some usage)
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 🔄 Rollback Plan

If migration fails:

1. **Restore application to SQLite:**

   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. **Regenerate Prisma Client:**

   ```bash
   npx prisma generate
   ```

3. **Restart application:**

   ```bash
   pm2 restart andrino-academy
   ```

4. **Investigate issues** before attempting PostgreSQL again

---

## ✅ Migration Checklist

- [ ] Prisma schema updated (provider = "postgresql")
- [ ] All `@default(cuid())` changed to `@default(uuid())`
- [ ] Environment variables configured
- [ ] Prisma client regenerated
- [ ] Database schema created (`prisma db push`)
- [ ] Seed data loaded (`npm run db:seed`)
- [ ] Local testing completed
- [ ] All 5 role dashboards tested
- [ ] Session creation/attendance works
- [ ] No TypeScript errors
- [ ] Production deployment successful
- [ ] Backups configured
- [ ] Monitoring set up

---

## 📞 Support

**Common PostgreSQL Commands:**

```bash
# Connect to database
psql -U andrino_admin -d andrino_academy_prod

# List databases
\l

# List tables
\dt

# Describe table
\d "User"

# Show table size
SELECT pg_size_pretty(pg_total_relation_size('"User"'));

# Export data
pg_dump -U andrino_admin andrino_academy_prod > backup.sql

# Import data
psql -U andrino_admin andrino_academy_prod < backup.sql

# Exit
\q
```

**Prisma Commands:**

```bash
# Generate client
npx prisma generate

# Push schema changes
npx prisma db push

# Reset database (CAUTION: deletes all data)
npx prisma db push --force-reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Validate schema
npx prisma validate
```

---

## 🎓 Summary

**Before Migration:**

- Development: SQLite
- Fast, file-based
- Single connection

**After Migration:**

- Production: PostgreSQL
- Scalable, robust
- Multi-user ready

**Key Changes:**

1. Schema provider: `sqlite` → `postgresql`
2. ID generation: `cuid()` → `uuid()`
3. Connection string: file path → PostgreSQL URL
4. Deployment: Single file → Database server

Your Andrino Academy LMS is now production-ready with PostgreSQL! 🚀
