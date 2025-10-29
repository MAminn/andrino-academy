#!/bin/bash

# OpenLiteSpeed Diagnostic Script
# Run this on your VPS to diagnose configuration issues

echo "========================================"
echo "OpenLiteSpeed Diagnostic Tool"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check PM2
echo -e "${YELLOW}[1/10] Checking PM2 Status...${NC}"
if sudo -u andrino pm2 list | grep -q "online"; then
    echo -e "${GREEN}✓ PM2 is running${NC}"
    sudo -u andrino pm2 list
else
    echo -e "${RED}✗ PM2 not running or app is stopped${NC}"
    sudo -u andrino pm2 list
fi
echo ""

# Check Node.js App
echo -e "${YELLOW}[2/10] Testing Node.js App on localhost:3000...${NC}"
if curl -s http://localhost:3000 | grep -q "Andrino"; then
    echo -e "${GREEN}✓ Node.js app is responding correctly${NC}"
    echo "Response preview:"
    curl -s http://localhost:3000 | head -5
else
    echo -e "${RED}✗ Node.js app not responding or showing wrong content${NC}"
    curl -s http://localhost:3000 | head -10
fi
echo ""

# Check OpenLiteSpeed Status
echo -e "${YELLOW}[3/10] Checking OpenLiteSpeed Status...${NC}"
if sudo systemctl is-active --quiet lsws; then
    echo -e "${GREEN}✓ OpenLiteSpeed is running${NC}"
    sudo systemctl status lsws --no-pager | head -10
else
    echo -e "${RED}✗ OpenLiteSpeed is not running${NC}"
    sudo systemctl status lsws --no-pager
fi
echo ""

# Check Virtual Host Config File
echo -e "${YELLOW}[4/10] Checking Virtual Host Configuration File...${NC}"
if [ -f /usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf ]; then
    echo -e "${GREEN}✓ Virtual host config file exists${NC}"
    echo "File permissions:"
    ls -la /usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf
    echo ""
    echo "File content:"
    sudo cat /usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf
else
    echo -e "${RED}✗ Virtual host config file not found${NC}"
fi
echo ""

# Check External App Configuration
echo -e "${YELLOW}[5/10] Checking External App (nodejs_backend) Configuration...${NC}"
if sudo grep -q "extprocessor nodejs_backend" /usr/local/lsws/conf/httpd_config.conf; then
    echo -e "${GREEN}✓ External app nodejs_backend is configured${NC}"
    echo "Configuration:"
    sudo grep -A 10 "extprocessor nodejs_backend" /usr/local/lsws/conf/httpd_config.conf
else
    echo -e "${RED}✗ External app nodejs_backend not found in config${NC}"
fi
echo ""

# Check Virtual Host Directory Structure
echo -e "${YELLOW}[6/10] Checking Virtual Host Directory Structure...${NC}"
if [ -d /usr/local/lsws/andrinoacademy ]; then
    echo -e "${GREEN}✓ Virtual host directory exists${NC}"
    echo "Directory structure:"
    ls -laR /usr/local/lsws/andrinoacademy/ | head -30
else
    echo -e "${RED}✗ Virtual host directory not found${NC}"
fi
echo ""

# Check Symbolic Links
echo -e "${YELLOW}[7/10] Checking Symbolic Links...${NC}"
if [ -L /usr/local/lsws/andrinoacademy/html/_next ]; then
    echo -e "${GREEN}✓ _next symbolic link exists${NC}"
    ls -la /usr/local/lsws/andrinoacademy/html/_next
else
    echo -e "${RED}✗ _next symbolic link missing${NC}"
fi
if [ -L /usr/local/lsws/andrinoacademy/html/public ]; then
    echo -e "${GREEN}✓ public symbolic link exists${NC}"
    ls -la /usr/local/lsws/andrinoacademy/html/public
else
    echo -e "${RED}✗ public symbolic link missing${NC}"
fi
echo ""

# Check DNS Resolution
echo -e "${YELLOW}[8/10] Checking DNS Resolution...${NC}"
DNS_IP=$(dig +short andrinoacademy.com @8.8.8.8 | head -1)
if [ "$DNS_IP" = "88.223.94.192" ]; then
    echo -e "${GREEN}✓ DNS is correctly configured${NC}"
    echo "andrinoacademy.com → $DNS_IP"
else
    echo -e "${RED}✗ DNS not configured or incorrect${NC}"
    echo "Current DNS: $DNS_IP (Expected: 88.223.94.192)"
    echo "You may need to configure DNS A records at your domain registrar"
fi
echo ""

# Check OpenLiteSpeed Logs
echo -e "${YELLOW}[9/10] Checking Recent OpenLiteSpeed Errors...${NC}"
if [ -f /usr/local/lsws/logs/error.log ]; then
    echo "Last 15 lines of error log:"
    sudo tail -15 /usr/local/lsws/logs/error.log
else
    echo -e "${RED}✗ Error log not found${NC}"
fi
echo ""

# Check Virtual Host Logs
echo -e "${YELLOW}[10/10] Checking Virtual Host Logs...${NC}"
if [ -d /usr/local/lsws/andrinoacademy/logs ]; then
    echo -e "${GREEN}✓ Virtual host logs directory exists${NC}"
    if [ -f /usr/local/lsws/andrinoacademy/logs/error.log ]; then
        echo "Last 10 lines of virtual host error log:"
        sudo tail -10 /usr/local/lsws/andrinoacademy/logs/error.log
    else
        echo "Virtual host error log is empty or doesn't exist yet"
    fi
else
    echo -e "${RED}✗ Virtual host logs directory not found${NC}"
    echo "Creating logs directory..."
    sudo mkdir -p /usr/local/lsws/andrinoacademy/logs
    sudo chown andrino:andrino /usr/local/lsws/andrinoacademy/logs
    sudo chmod 755 /usr/local/lsws/andrinoacademy/logs
    echo -e "${GREEN}✓ Created logs directory${NC}"
fi
echo ""

echo "========================================"
echo "Diagnostic Summary"
echo "========================================"
echo ""

# Test with Host header
echo -e "${YELLOW}Testing with Host header...${NC}"
RESPONSE=$(curl -s -H "Host: andrinoacademy.com" http://localhost | head -10)
if echo "$RESPONSE" | grep -q "Andrino"; then
    echo -e "${GREEN}✓ OpenLiteSpeed correctly proxies to Node.js app${NC}"
    echo "Your site should be working!"
else
    echo -e "${RED}✗ OpenLiteSpeed is NOT proxying correctly${NC}"
    echo "Response preview:"
    echo "$RESPONSE"
    echo ""
    echo -e "${YELLOW}ACTION REQUIRED:${NC}"
    echo "1. Login to WebAdmin: https://88.223.94.192:7080"
    echo "2. Go to Configuration → Virtual Hosts"
    echo "3. Check if 'andrinoacademy' virtual host exists"
    echo "4. If not, click 'Add' and create it with config file:"
    echo "   /usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf"
    echo "5. Go to Configuration → Listeners → Default"
    echo "6. Add Virtual Host Mapping:"
    echo "   Virtual Host: andrinoacademy"
    echo "   Domains: andrinoacademy.com, www.andrinoacademy.com"
    echo "7. Click Actions → Graceful Restart"
fi
echo ""

echo "========================================"
echo "Quick Fix Commands"
echo "========================================"
echo ""
echo "If virtual host isn't configured in WebAdmin, you can try:"
echo ""
echo "1. Get WebAdmin password:"
echo "   sudo cat /home/andrino/.litespeed_password"
echo ""
echo "2. Login to WebAdmin and configure virtual host manually"
echo ""
echo "3. Or restart OpenLiteSpeed:"
echo "   sudo /usr/local/lsws/bin/lswsctrl restart"
echo ""
echo "4. Check configuration syntax:"
echo "   sudo /usr/local/lsws/bin/lswsctrl configtest"
echo ""

echo "========================================"
echo "Diagnostic Complete"
echo "========================================"
