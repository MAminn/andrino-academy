#!/bin/sh
# Production startup script for Andrino Academy
# This script initializes the database and starts the application

echo "🚀 Starting Andrino Academy with Drizzle + MySQL..."

# Wait for MySQL to be ready (if DATABASE_URL is set)
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Waiting for MySQL to be ready..."
  sleep 5
fi

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:migrate || echo "⚠️  Migrations failed or already applied"

# Seed database if needed
echo "🌱 Seeding database..."
npm run db:seed || echo "⚠️  Seeding skipped or failed"

# Start the application directly (not via npm script to avoid double-seeding)
echo "🌐 Starting Next.js server..."
exec node_modules/.bin/next start
