#!/bin/bash
set -e

# ============================================
# Andrino Academy - Database Backup Script
# ============================================
# This script creates compressed backups of the PostgreSQL database
# Usage: ./scripts/backup-database.sh
# Cron: 0 2 * * * /home/andrino/andrino-academy/scripts/backup-database.sh
# ============================================

# Configuration
BACKUP_DIR="/home/andrino/backups/database"
DB_NAME="andrino_academy_prod"
DB_USER="andrino_admin"
DB_HOST="localhost"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/andrino_$DATE.sql.gz"
LOG_FILE="/home/andrino/logs/backup.log"
RETENTION_DAYS=7

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Log function
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error_message() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

success_message() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

# Start backup
log_message "Starting database backup for $DB_NAME..."

# Create backup with compression
if pg_dump -U "$DB_USER" -h "$DB_HOST" "$DB_NAME" | gzip > "$BACKUP_FILE"; then
    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    success_message "Backup completed: $BACKUP_FILE ($BACKUP_SIZE)"
    
    # Verify backup file is not empty
    if [ -s "$BACKUP_FILE" ]; then
        success_message "Backup file verified (size: $BACKUP_SIZE)"
    else
        error_message "Backup file is empty!"
        exit 1
    fi
else
    error_message "Backup failed!"
    exit 1
fi

# Cleanup old backups (keep only last N days)
log_message "Cleaning up backups older than $RETENTION_DAYS days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "andrino_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)

if [ "$DELETED_COUNT" -gt 0 ]; then
    log_message "Deleted $DELETED_COUNT old backup(s)"
else
    log_message "No old backups to delete"
fi

# List current backups
log_message "Current backups in $BACKUP_DIR:"
ls -lh "$BACKUP_DIR"/andrino_*.sql.gz | tail -5 | tee -a "$LOG_FILE"

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log_message "Total backup directory size: $TOTAL_SIZE"

success_message "Database backup process completed successfully"

exit 0
