#!/bin/sh
# Production startup script for Andrino Academy
# This script initializes the database and starts the application

echo "🚀 Starting Andrino Academy..."

# Check if database exists, if not create it
if [ ! -f "prisma/dev.db" ]; then
  echo "📦 Initializing database..."
  npx prisma db push --accept-data-loss
  echo "✅ Database initialized"
fi

# Always generate Prisma client to ensure it's up to date
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Start the application
echo "🌐 Starting Next.js server..."
npm run start
