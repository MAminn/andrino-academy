#!/bin/bash

# ===================================================================
# Force Restart PM2 - Andrino Academy
# ===================================================================
# This script forcefully cleans up ALL processes and restarts PM2
# Use this when PM2 shows "errored" despite the app working
# ===================================================================

set -e

echo "=========================================="
echo "Force Restart PM2 - Complete Cleanup"
echo "=========================================="
echo ""

# Step 1: Stop ALL PM2 processes
echo "Step 1: Stopping ALL PM2 processes..."
sudo -u andrino pm2 delete all 2>/dev/null || echo "No PM2 processes to delete"
sudo -u andrino pm2 kill 2>/dev/null || echo "PM2 daemon stopped"
echo ""

# Step 2: Find and kill ALL Node.js processes (except this script)
echo "Step 2: Killing ALL Node.js processes..."
sudo pkill -9 node 2>/dev/null || echo "No node processes found"
echo ""

# Step 3: Force kill anything on port 3000
echo "Step 3: Force killing port 3000..."
sudo fuser -k 3000/tcp 2>/dev/null || echo "Port 3000 was already free"
echo ""

# Step 4: Verify port 3000 is free
echo "Step 4: Verifying port 3000 is free..."
sleep 2
PORT_CHECK=$(sudo lsof -ti:3000 2>/dev/null || echo "")
if [ -n "$PORT_CHECK" ]; then
    echo "❌ Port 3000 still occupied by PID: $PORT_CHECK"
    echo "Attempting final kill..."
    sudo kill -9 $PORT_CHECK 2>/dev/null || true
    sleep 2
fi

PORT_CHECK=$(sudo lsof -ti:3000 2>/dev/null || echo "")
if [ -z "$PORT_CHECK" ]; then
    echo "✓ Port 3000 is now completely free"
else
    echo "❌ ERROR: Port 3000 still occupied. Manual intervention required."
    exit 1
fi
echo ""

# Step 5: Start PM2 fresh
echo "Step 5: Starting PM2 with fresh state..."
cd /home/andrino/apps/andrino-academy
sudo -u andrino pm2 start ecosystem.config.js
echo ""

# Step 6: Wait and check status
echo "Step 6: Waiting 5 seconds for app to start..."
sleep 5
sudo -u andrino pm2 list
echo ""

# Step 7: Check logs
echo "Step 7: Checking recent logs..."
sudo -u andrino pm2 logs andrino-academy --lines 15 --nostream
echo ""

# Step 8: Test the application
echo "Step 8: Testing application response..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$RESPONSE" = "200" ]; then
    echo "✓ Application is responding successfully (HTTP 200)"
else
    echo "⚠ Application returned HTTP $RESPONSE"
fi
echo ""

# Step 9: Save PM2 configuration
echo "Step 9: Saving PM2 configuration..."
sudo -u andrino pm2 save
sudo -u andrino pm2 startup systemd -u andrino --hp /home/andrino 2>/dev/null || true
echo ""

echo "=========================================="
echo "Summary"
echo "=========================================="
echo ""
echo "Check current status:"
echo "  sudo -u andrino pm2 list"
echo ""
echo "View live logs:"
echo "  sudo -u andrino pm2 logs andrino-academy"
echo ""
echo "Monitor resources:"
echo "  sudo -u andrino pm2 monit"
echo ""
echo "Test application:"
echo "  curl http://localhost:3000"
echo "  curl -I https://andrinoacademy.com"
echo ""
