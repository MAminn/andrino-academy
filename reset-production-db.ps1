# Reset Production Database Script for Andrino Academy (PowerShell)
# WARNING: This will delete ALL data in the production database!

Write-Host "⚠️  WARNING: This will RESET your PRODUCTION database!" -ForegroundColor Yellow
Write-Host "⚠️  ALL DATA WILL BE LOST!" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Type 'RESET' to confirm"

if ($confirm -ne "RESET") {
    Write-Host "❌ Reset cancelled." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Starting production database reset..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Force reset the database schema
Write-Host "📦 Step 1/3: Resetting database schema..." -ForegroundColor Cyan
npx prisma db push --force-reset --skip-generate --accept-data-loss

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to reset database schema" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database schema reset complete" -ForegroundColor Green
Write-Host ""

# Step 2: Generate Prisma Client with proper permissions
Write-Host "🔧 Step 2/3: Generating Prisma Client..." -ForegroundColor Cyan

# Create the directory if it doesn't exist
New-Item -ItemType Directory -Path ".\src\generated" -Force | Out-Null

# Generate Prisma Client
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Step 3: Seed the database with production data
Write-Host "🌱 Step 3/3: Seeding production database..." -ForegroundColor Cyan
npm run db:seed-production

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: Seeding failed, but database schema is ready" -ForegroundColor Yellow
    Write-Host "You can manually seed later with: npm run db:seed-production" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Production database reset complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Database Summary:" -ForegroundColor Cyan
Write-Host "   - All tables created from schema"
Write-Host "   - Test accounts seeded (if seeding succeeded)"
Write-Host "   - Ready for production use"
Write-Host ""
Write-Host "🔐 Default test accounts (if seeded):" -ForegroundColor Cyan
Write-Host "   CEO: ceo@andrino-academy.com"
Write-Host "   Manager: manager@andrino-academy.com"
Write-Host "   Coordinator: coordinator@andrino-academy.com"
Write-Host "   Instructor: instructor@andrino-academy.com"
Write-Host "   Student: student@andrino-academy.com"
Write-Host ""
