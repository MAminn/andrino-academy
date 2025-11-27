#!/bin/bash
# Reset Production Database Script for Andrino Academy
# WARNING: This will delete ALL data in the production database!

echo "⚠️  WARNING: This will RESET your PRODUCTION database!"
echo "⚠️  ALL DATA WILL BE LOST!"
echo ""
read -p "Type 'RESET' to confirm: " confirm

if [ "$confirm" != "RESET" ]; then
    echo "❌ Reset cancelled."
    exit 1
fi

echo ""
echo "🔄 Starting production database reset..."
echo ""

# Step 1: Force reset the database schema
echo "📦 Step 1/3: Resetting database schema..."
npx prisma db push --force-reset --skip-generate --accept-data-loss

if [ $? -ne 0 ]; then
    echo "❌ Failed to reset database schema"
    exit 1
fi

echo "✅ Database schema reset complete"
echo ""

# Step 2: Generate Prisma Client with proper permissions
echo "🔧 Step 2/3: Generating Prisma Client..."

# Create the directory if it doesn't exist
mkdir -p ./src/generated

# Generate Prisma Client
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

# Step 3: Seed the database with production data
echo "🌱 Step 3/3: Seeding production database..."
npm run db:seed-production

if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Seeding failed, but database schema is ready"
    echo "You can manually seed later with: npm run db:seed-production"
fi

echo ""
echo "✅ Production database reset complete!"
echo ""
echo "📊 Database Summary:"
echo "   - All tables created from schema"
echo "   - Test accounts seeded (if seeding succeeded)"
echo "   - Ready for production use"
echo ""
echo "🔐 Default test accounts (if seeded):"
echo "   CEO: ceo@andrino-academy.com"
echo "   Manager: manager@andrino-academy.com"
echo "   Coordinator: coordinator@andrino-academy.com"
echo "   Instructor: instructor@andrino-academy.com"
echo "   Student: student@andrino-academy.com"
echo ""
