#!/bin/bash
# Quick Production Database Fix - Run this in your Coolify terminal

echo "🔧 Quick Production Database Fix"
echo ""

# Step 1: Create directories
echo "Creating directories..."
mkdir -p /app/src/generated
mkdir -p /app/prisma

# Step 2: Fix permissions (if running as root, uncomment below)
# chown -R nextjs:nodejs /app/src
# chown -R nextjs:nodejs /app/prisma

# Step 3: Reset database
echo "Resetting database..."
npx prisma db push --force-reset --accept-data-loss

# Step 4: Generate client
echo "Generating Prisma Client..."
npx prisma generate

# Step 5: Seed data
echo "Seeding database..."
npm run db:seed-production

echo ""
echo "✅ Done! Restart your application now."
