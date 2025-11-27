#!/bin/sh
# Production startup script for Andrino Academy
# This script initializes the database and starts the application

echo "🚀 Starting Andrino Academy..."

# Always apply schema changes to ensure database is up to date
echo "📦 Syncing database schema..."
npx prisma db push --accept-data-loss
echo "✅ Database schema synchronized"

# Always generate Prisma client to ensure it's up to date
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Start the application
echo "🌐 Starting Next.js server..."
npm run start
