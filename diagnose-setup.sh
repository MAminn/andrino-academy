#!/bin/bash

# ===================================================================
# Diagnose OpenLiteSpeed + PM2 Setup
# ===================================================================
# This script checks if OpenLiteSpeed is managing the Node.js process
# instead of PM2, which would explain the "errored" status
# ===================================================================

echo "=========================================="
echo "Diagnostic Report - Andrino Academy Setup"
echo "=========================================="
echo ""

# Check 1: What's running on port 3000?
echo "1. Process using port 3000:"
sudo lsof -i :3000 | head -20
echo ""

# Check 2: All Node.js processes
echo "2. All Node.js processes running:"
ps aux | grep node | grep -v grep
echo ""

# Check 3: PM2 Status
echo "3. PM2 Status:"
sudo -u andrino pm2 list
echo ""

# Check 4: OpenLiteSpeed Status
echo "4. OpenLiteSpeed Status:"
sudo systemctl status lsws --no-pager | head -20
echo ""

# Check 5: OpenLiteSpeed Virtual Host Config
echo "5. OpenLiteSpeed Virtual Host Configuration:"
if [ -f "/usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf" ]; then
    echo "Found vhconf.conf - checking for App Server settings..."
    grep -A 10 "extprocessor\|context" /usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf | head -30
else
    echo "Config file not found at expected location"
fi
echo ""

# Check 6: Test Application Response
echo "6. Testing Application:"
echo "Testing localhost:3000..."
RESPONSE_3000=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
echo "  Port 3000: HTTP $RESPONSE_3000"

echo "Testing HTTPS domain..."
RESPONSE_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://andrinoacademy.com 2>/dev/null || echo "000")
echo "  HTTPS: HTTP $RESPONSE_HTTPS"
echo ""

# Check 7: OpenLiteSpeed External App
echo "7. OpenLiteSpeed External App Configuration:"
if [ -f "/usr/local/lsws/conf/httpd_config.conf" ]; then
    echo "Checking for Node.js app configuration..."
    grep -A 20 "extprocessor.*node" /usr/local/lsws/conf/httpd_config.conf | head -30 || echo "No Node.js external processor found"
fi
echo ""

# Check 8: Check if LiteSpeed is managing Node
echo "8. LiteSpeed-managed processes:"
ps aux | grep lsnode | grep -v grep || echo "No LiteSpeed Node.js processes found"
echo ""

echo "=========================================="
echo "Analysis"
echo "=========================================="
echo ""
echo "Based on the output above:"
echo ""
echo "If you see 'lsnode' processes:"
echo "  → OpenLiteSpeed is managing Node.js directly"
echo "  → PM2 is NOT needed (can be stopped)"
echo "  → This is a valid production setup"
echo ""
echo "If you DON'T see 'lsnode' processes:"
echo "  → OpenLiteSpeed is reverse proxying to port 3000"
echo "  → PM2 should be managing the Node.js app"
echo "  → We need to fix PM2 to stay running"
echo ""
