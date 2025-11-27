# Production Database Reset Guide

## Problem
Production database has permission issues when trying to reset or generate Prisma Client. Error: `EACCES: permission denied, mkdir '/app/src/generated'`

## Root Cause
The Docker container runs as a non-root user (`nextjs`), but the `/app/src/generated` directory wasn't created during the build, causing permission errors when Prisma tries to generate the client at runtime.

---

## ✅ Solution Applied

### 1. **Updated Dockerfile**
Added creation of `/app/src/generated` directory with proper permissions:
```dockerfile
mkdir -p /app/src/generated
chown -R nextjs:nodejs /app/src
```

### 2. **Updated start.sh**
Added directory creation at startup to ensure directories exist:
```bash
mkdir -p /app/src/generated
mkdir -p /app/prisma
```

### 3. **Created Reset Scripts**
- `reset-production-db.sh` - Bash script for Linux/Mac/VPS
- `reset-production-db.ps1` - PowerShell script for Windows

---

## 🚀 How to Reset Production Database

### **On Production Server (VPS/Coolify)**

**Method 1: Using Coolify Terminal**
```bash
cd /app
./reset-production-db.sh
```

**Method 2: Manual Commands**
```bash
# 1. Reset database schema
npx prisma db push --force-reset --skip-generate --accept-data-loss

# 2. Create directory (if needed)
mkdir -p ./src/generated

# 3. Generate Prisma Client
npx prisma generate

# 4. Seed production data
npm run db:seed-production
```

**Method 3: Using Docker Exec (if using Docker)**
```bash
docker exec -it <container-name> sh
cd /app
npx prisma db push --force-reset --accept-data-loss
npx prisma generate
npm run db:seed-production
```

### **On Local Windows (Testing)**
```powershell
cd e:\full-stack-training\parts\andrino-academy
.\reset-production-db.ps1
```

---

## 🔄 Rebuild & Redeploy (Recommended)

Since we updated the Dockerfile, you should rebuild and redeploy:

### **Using Coolify**
1. Go to your Coolify dashboard
2. Navigate to Andrino Academy project
3. Click "Redeploy" or "Restart" button
4. Coolify will rebuild the Docker image with the fixes

### **Manual Docker Build**
```bash
# Build new image
docker build -t andrino-academy:latest .

# Stop old container
docker stop andrino-academy
docker rm andrino-academy

# Run new container
docker run -d \
  --name andrino-academy \
  -p 3000:3000 \
  -v /path/to/prisma:/app/prisma \
  -e DATABASE_URL="file:./prisma/dev.db" \
  andrino-academy:latest
```

---

## 📋 Verification Checklist

After reset, verify everything is working:

```bash
# 1. Check Prisma Client exists
ls -la /app/src/generated/prisma/

# 2. Check database file exists
ls -la /app/prisma/dev.db

# 3. Check tables were created
npx prisma studio

# 4. Test login with default accounts
# CEO: ceo@andrino-academy.com
# Manager: manager@andrino-academy.com
# Coordinator: coordinator@andrino-academy.com
# Instructor: instructor@andrino-academy.com
# Student: student@andrino-academy.com
```

---

## 🔐 Default Test Accounts

After seeding, these accounts are available:

| Role | Email | Password (from .env) |
|------|-------|---------------------|
| CEO | ceo@andrino-academy.com | `TEST_CEO_PASSWORD` |
| Manager | manager@andrino-academy.com | `TEST_MANAGER_PASSWORD` |
| Coordinator | coordinator@andrino-academy.com | `TEST_COORDINATOR_PASSWORD` |
| Instructor | instructor@andrino-academy.com | `TEST_INSTRUCTOR_PASSWORD` |
| Student | student@andrino-academy.com | `TEST_STUDENT_PASSWORD` |

Check your `.env` file for the actual passwords.

---

## 🛠️ Troubleshooting

### Issue: Still getting permission errors
**Solution:**
```bash
# Fix permissions manually
chmod -R 755 /app/src
chown -R nextjs:nodejs /app/src
```

### Issue: Database locked
**Solution:**
```bash
# Stop the application first
pm2 stop andrino-academy
# Or stop Docker container
docker stop andrino-academy

# Then run reset
npx prisma db push --force-reset --accept-data-loss
```

### Issue: Seeding fails
**Solution:**
```bash
# Run seed manually with more details
npx tsx prisma/seed-production.ts
# Or check what's failing
npm run db:seed-production 2>&1 | tee seed.log
```

### Issue: "Cannot find module '@prisma/client'"
**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# If still fails, reinstall
npm install @prisma/client
npx prisma generate
```

---

## 📚 Database Schema Info

Your schema includes these main models:
- ✅ User (with roles: student, instructor, coordinator, manager, ceo)
- ✅ Course, CourseSession, Enrollment
- ✅ Assignment, AssignmentSubmission
- ✅ Exam, Attendance, Certificate
- ✅ Payment, Invoice
- ✅ Grade, Track, LiveSession
- ✅ Module, ContentItem, Task
- ✅ InstructorAvailability, SessionBooking
- ✅ Package (subscription packages)

Total: 25+ models with proper relations and indexes.

---

## 🎯 Next Steps

1. **Rebuild Docker image** (if using Docker/Coolify)
2. **Run reset script** on production
3. **Verify database** is working
4. **Test login** with default accounts
5. **Create real users** and data
6. **Backup database** regularly

---

## 💾 Backup Before Reset (Important!)

**Before running reset on production:**
```bash
# Backup current database
cp /app/prisma/dev.db /app/prisma/backup-$(date +%Y%m%d-%H%M%S).db

# Or export data
npx prisma db pull
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script > backup.sql
```

---

## 🚨 Production Migration (Future)

Currently using SQLite. For production scale, consider migrating to PostgreSQL:
- See `POSTGRESQL_MIGRATION_GUIDE.md` for full guide
- PostgreSQL handles concurrent connections better
- Better for multi-user applications
- More robust data integrity

---

**Need Help?** Check the error logs:
```bash
# Application logs
pm2 logs andrino-academy
# Or Docker logs
docker logs andrino-academy
```
