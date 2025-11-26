# Database Seeding Guide - Andrino Academy

## Overview

This project has **two seed scripts** for different environments:

### 1. Production Seed (`seed-production.ts`) ✅ **USE THIS IN PRODUCTION**
**Location**: `prisma/seed-production.ts`

Creates **ONLY** the 5 essential test accounts:
- CEO
- Manager
- Coordinator  
- Instructor
- Student

**No other data is created** - no grades, tracks, modules, sessions, etc.

### 2. Development Seed (`seed.ts`) 🧪 **USE THIS FOR LOCAL DEVELOPMENT**
**Location**: `prisma/seed.ts`

Creates comprehensive test data including:
- 5 test accounts
- 4 grades
- 8 tracks
- Multiple modules with content
- Live sessions
- Instructor availability
- Sample bookings

## Usage

### For Production Deployment

Run this command **after deploying**:

```bash
npm run db:seed-production
```

Or using Prisma directly:
```bash
npx prisma db seed
```
(This uses the production seed by default)

### For Local Development

```bash
npm run db:seed
```

This runs the full development seed with all test data.

### Reset Database (Development Only)

```bash
npm run db:reset
```

⚠️ **WARNING**: This deletes all data and re-seeds with development data.

## Environment Variables

Set these in your deployment platform (Coolify, Vercel, etc.):

```env
TEST_CEO_PASSWORD=your-secure-password-here
TEST_MANAGER_PASSWORD=your-secure-password-here
TEST_COORDINATOR_PASSWORD=your-secure-password-here
TEST_INSTRUCTOR_PASSWORD=your-secure-password-here
TEST_STUDENT_PASSWORD=your-secure-password-here
```

### Password Requirements
- Minimum 12 characters
- Include uppercase, lowercase, numbers, special characters
- Example: `SecureManager#2024!Production`

### Default Passwords (if not set)

If environment variables are not set, these secure defaults are used:
- CEO: `CEO#2024!Secure`
- Manager: `Manager#2024!Secure`
- Coordinator: `Coordinator#2024!Secure`
- Instructor: `Instructor#2024!Secure`
- Student: `Student#2024!Secure`

## Test Account Emails

All test accounts use the `@andrino-academy.com` domain:

| Role | Email |
|------|-------|
| CEO | ceo@andrino-academy.com |
| Manager | manager@andrino-academy.com |
| Coordinator | coordinator@andrino-academy.com |
| Instructor | instructor@andrino-academy.com |
| Student | student@andrino-academy.com |

## Production Deployment Checklist

1. ✅ Deploy your application to production
2. ✅ Set environment variables (TEST_*_PASSWORD)
3. ✅ Run migration: `npx prisma db push`
4. ✅ Run seed: `npm run db:seed-production`
5. ✅ Verify login with test accounts

## Important Notes

### Production Safety
- ✅ `seed-production.ts` is **idempotent** - it checks if accounts exist before creating
- ✅ Running it multiple times won't create duplicates
- ✅ Only creates user accounts - **NO other data**

### Development vs Production
- 🧪 Development seed (`seed.ts`): **922 lines** - creates full test ecosystem
- ✅ Production seed (`seed-production.ts`): **133 lines** - creates only 5 accounts

### Security Best Practices

1. **Never commit `.env`** to git
2. **Set strong passwords** in production environment
3. **Rotate passwords** after initial deployment
4. **Delete or disable** test accounts when no longer needed
5. **Use real accounts** for actual users (these are for testing only)

## Troubleshooting

### TypeScript Errors about `process`
These are cosmetic and won't affect runtime. The seed scripts declare the `process` type internally.

### "Test accounts already exist" 
The production seed script detects existing accounts and skips creation. This is safe.

### Passwords Not Working
1. Check environment variables are set correctly
2. Re-run the seed script
3. Verify the password in the seed output log

### Need to Reset Production Database
⚠️ **DANGEROUS** - Only do this if absolutely necessary:
```bash
# SSH into production server
npx prisma db push --force-reset
npm run db:seed-production
```

## Support

For questions about:
- **Seed scripts**: Check this file
- **Environment variables**: See `.env.example`
- **Database schema**: See `prisma/schema.prisma`
- **Deployment**: See `DEPLOYMENT_FIX_SUMMARY.md`

---

**Last Updated**: November 26, 2025
