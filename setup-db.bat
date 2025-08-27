@echo off
echo Choose your database setup:
echo 1. Local PostgreSQL with Docker
echo 2. SQLite (Instant)
echo 3. Keep Supabase (when restored)
echo.
set /p choice=Enter choice (1-3): 

if "%choice%"=="1" (
    echo Setting up local PostgreSQL...
    copy .env.local.dev .env.local
    docker-compose up -d
    timeout /t 5
    npx prisma migrate dev --name local_init
    echo Local database ready!
) else if "%choice%"=="2" (
    echo Setting up SQLite...
    copy .env.local.sqlite .env.local
    copy prisma\schema.sqlite.prisma prisma\schema.prisma
    npx prisma migrate dev --name sqlite_init
    echo SQLite database ready!
) else (
    echo Keeping current Supabase setup
)

echo Starting development server...
npm run dev
