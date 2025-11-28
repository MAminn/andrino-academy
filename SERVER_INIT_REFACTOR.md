# Server Initialization Refactor

## Problem
Production deployments were failing with:
1. **Drizzle Query Error**: `Table 'accounts' already exists` when using `drizzle-kit migrate`
2. **Password Hash Error**: Invalid password hash from bcrypt compatibility issues
3. **Shell Script Management**: Using bash scripts that are hard to maintain and debug

## Solution
Removed all shell scripts and replaced with **Next.js instrumentation** for server startup initialization.

## Changes Made

### 1. Created `instrumentation.ts`
- Next.js built-in hook that runs once when server starts
- Automatically handles both development and production
- No need for custom scripts or startup wrappers

### 2. Created `backend/database/init.ts`
New server initialization module with three functions:

#### `syncDatabaseSchema()`
- Runs `drizzle-kit push` instead of `migrate`
- **Idempotent**: Safe to run multiple times
- Handles existing tables gracefully (no "table already exists" errors)

#### `resetTestAccounts()`
- **Deletes** all test accounts from both `users` and `accounts` tables
- **Recreates** them with fresh bcrypt hashes (12 salt rounds for Better Auth)
- Ensures clean state on every deployment
- Test accounts:
  - `ceo@andrino.academy`
  - `manager@andrino.academy`
  - `coordinator@andrino.academy`
  - `instructor@andrino.academy`
  - `student@andrino.academy`

#### `initializeServer()`
- Runs once per server startup (singleton pattern)
- Syncs database schema
- Resets test accounts
- Logs all operations for visibility

### 3. Updated `package.json`
Simplified scripts:
```json
"dev": "next dev",
"build": "next build",
"start": "next start"
```

Removed:
- `dev-with-seed.js`
- `start-with-seed.js`
- `build.js`
- `db:seed` script
- `db:migrate` script

### 4. Updated `Dockerfile`
- Removed `start.sh` and `scripts/` directory copies
- Added `instrumentation.ts` copy
- Changed CMD to direct Next.js start: `CMD ["node_modules/.bin/next", "start"]`
- Removed shell script execution

### 5. Deleted Files
- `start.sh` - No longer needed
- `scripts/start-with-seed.js` - Replaced by instrumentation
- `scripts/dev-with-seed.js` - Replaced by instrumentation
- `scripts/build.js` - Replaced by direct `next build`
- `backend/database/seed.ts` - Functionality moved to `init.ts`

### 6. Updated `.dockerignore`
Added exclusions:
```
scripts/
*.sh
```

## How It Works

### Development
```bash
npm run dev
```
1. Next.js starts
2. `instrumentation.ts` runs automatically
3. `initializeServer()` syncs DB and resets test accounts
4. Server ready with fresh test accounts

### Production
```bash
npm run build && npm run start
```
1. Build completes
2. Next.js starts
3. `instrumentation.ts` runs automatically
4. `initializeServer()` syncs DB and resets test accounts
5. Production server ready

## Benefits

1. **No More Migration Errors**: `drizzle-kit push` is idempotent
2. **Fresh Test Accounts**: Deleted and recreated on every startup
3. **No Shell Scripts**: Pure TypeScript, easier to debug
4. **Built-in Next.js Feature**: No custom startup wrappers needed
5. **Singleton Pattern**: Initialization runs only once per server lifetime
6. **Better Auth Compatible**: Uses 12 bcrypt salt rounds

## Environment Variables
No changes needed. Same variables as before:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `NEXTAUTH_URL`
- `TEST_*_PASSWORD` (optional, defaults provided)

## Deployment
Just commit and push. Coolify will:
1. Build with instrumentation included
2. Start server
3. Instrumentation runs automatically
4. Database synced, test accounts reset
5. Ready to use!
