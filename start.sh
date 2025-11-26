#!/bin/sh
# Production startup script for Andrino Academy
# This script initializes the database and starts the application

echo "🚀 Starting Andrino Academy..."

# Check if database exists, if not create it
if [ ! -f "prisma/dev.db" ]; then
  echo "📦 Initializing database..."
  npx prisma db push --accept-data-loss
  echo "✅ Database initialized"
else
  echo "✅ Database already exists"
fi

# Start the application
echo "🌐 Starting Next.js server..."
npm run start
