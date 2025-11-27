#!/bin/sh
# Production startup script for Andrino Academy
# This script initializes the database and starts the application

echo "🚀 Starting Andrino Academy..."

# Ensure src/generated directory exists with proper permissions
echo "📁 Creating necessary directories..."
mkdir -p /app/src/generated
mkdir -p /app/prisma

# Only sync database schema if database doesn't exist
if [ ! -f "/app/prisma/dev.db" ]; then
  echo "📦 Database not found. Creating new database..."
  npx prisma db push --accept-data-loss
  echo "✅ Database created"
  
  echo "🌱 Seeding production data..."
  npm run db:seed-production || echo "⚠️  Seeding skipped or failed"
else
  echo "✅ Database exists. Skipping schema sync."
fi

# Always generate Prisma client to ensure it's up to date
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Start the application
echo "🌐 Starting Next.js server..."
npm run start
