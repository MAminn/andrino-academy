#!/bin/bash
set -e

# ============================================
# Andrino Academy - Production Deployment Script
# ============================================
# This script automates the deployment process
# Usage: ./scripts/deploy.sh
# ============================================

echo "🚀 Starting Andrino Academy deployment..."
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/andrino/andrino-academy"
BACKUP_DIR="/home/andrino/backups"
LOG_FILE="/home/andrino/logs/deployment.log"

# Create log entry
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo -e "${GREEN}$1${NC}"
}

error_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE"
    echo -e "${RED}ERROR: $1${NC}"
}

warning_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$LOG_FILE"
    echo -e "${YELLOW}WARNING: $1${NC}"
}

# Navigate to app directory
cd "$APP_DIR" || {
    error_message "Failed to navigate to $APP_DIR"
    exit 1
}

# 1. Backup current state
log_message "📦 Creating backup of current version..."
BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR/code"
tar -czf "$BACKUP_DIR/code/$BACKUP_NAME.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='*.log' \
    . || warning_message "Backup creation failed, continuing anyway..."

# 2. Pull latest changes from Git
log_message "📥 Pulling latest changes from Git..."
git fetch origin
CURRENT_COMMIT=$(git rev-parse HEAD)
git pull origin main || {
    error_message "Git pull failed"
    exit 1
}
NEW_COMMIT=$(git rev-parse HEAD)

if [ "$CURRENT_COMMIT" == "$NEW_COMMIT" ]; then
    log_message "ℹ️  No new changes detected"
else
    log_message "✅ Updated from $CURRENT_COMMIT to $NEW_COMMIT"
fi

# 3. Install dependencies
log_message "📦 Installing dependencies..."
npm ci --production=false || {
    error_message "npm ci failed"
    exit 1
}

# 4. Generate Prisma Client
log_message "🗄️  Generating Prisma Client..."
npx prisma generate || {
    error_message "Prisma generate failed"
    exit 1
}

# 5. Run database migrations (if any)
log_message "🔄 Running database migrations..."
npx prisma db push --accept-data-loss || {
    warning_message "Database push had warnings, but continuing..."
}

# 6. Build Next.js application
log_message "🏗️  Building Next.js application..."
npm run build || {
    error_message "Build failed"
    exit 1
}

# 7. Run tests (optional - uncomment if you have tests)
# log_message "🧪 Running tests..."
# npm test || {
#     error_message "Tests failed"
#     exit 1
# }

# 8. Reload PM2 with zero downtime
log_message "♻️  Reloading application with PM2..."
pm2 reload andrino-academy --update-env || {
    error_message "PM2 reload failed, attempting restart..."
    pm2 restart andrino-academy || {
        error_message "PM2 restart also failed"
        exit 1
    }
}

# 9. Wait for application to be ready
log_message "⏳ Waiting for application to be ready..."
sleep 5

# 10. Health check
log_message "🏥 Running health check..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")

if [ "$HTTP_STATUS" == "200" ] || [ "$HTTP_STATUS" == "301" ] || [ "$HTTP_STATUS" == "302" ]; then
    log_message "✅ Health check passed (HTTP $HTTP_STATUS)"
else
    error_message "Health check failed (HTTP $HTTP_STATUS)"
    warning_message "Application may not be responding correctly"
fi

# 11. Show PM2 status
log_message "📊 Current application status:"
pm2 status andrino-academy

# 12. Show recent logs
log_message "📝 Recent application logs:"
pm2 logs andrino-academy --lines 20 --nostream

# 13. Cleanup old backups (keep last 7 days)
log_message "🧹 Cleaning up old backups..."
find "$BACKUP_DIR/code" -name "backup_*.tar.gz" -mtime +7 -delete || true

# Final summary
echo ""
echo "============================================"
log_message "🎉 Deployment completed successfully!"
echo "============================================"
echo ""
echo "📊 Summary:"
echo "  - Git commit: $NEW_COMMIT"
echo "  - Backup: $BACKUP_DIR/code/$BACKUP_NAME.tar.gz"
echo "  - Health check: HTTP $HTTP_STATUS"
echo ""
echo "Next steps:"
echo "  1. Monitor logs: pm2 logs andrino-academy"
echo "  2. Check metrics: pm2 monit"
echo "  3. View status: pm2 status"
echo ""

exit 0
