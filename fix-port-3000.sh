#!/bin/bash

# Fix port 3000 already in use issue
# This script finds and kills the process using port 3000, then restarts PM2

echo "========================================"
echo "Fixing Port 3000 Conflict"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Finding process using port 3000...${NC}"
PORT_PID=$(lsof -ti:3000)

if [ -z "$PORT_PID" ]; then
    echo -e "${GREEN}✓ Port 3000 is free${NC}"
else
    echo -e "${YELLOW}Found process(es) using port 3000: $PORT_PID${NC}"
    echo ""
    echo "Process details:"
    lsof -i:3000
    echo ""
    
    echo -e "${YELLOW}Killing process(es)...${NC}"
    kill -9 $PORT_PID
    echo -e "${GREEN}✓ Killed process(es): $PORT_PID${NC}"
fi
echo ""

echo -e "${YELLOW}Step 2: Checking for any node processes...${NC}"
ps aux | grep node | grep -v grep
echo ""

echo -e "${YELLOW}Step 3: Stopping PM2...${NC}"
sudo -u andrino pm2 delete all 2>/dev/null || echo "No PM2 processes to delete"
echo ""

echo -e "${YELLOW}Step 4: Double-checking port 3000...${NC}"
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${RED}Port still in use, force killing...${NC}"
    fuser -k 3000/tcp
else
    echo -e "${GREEN}✓ Port 3000 is now free${NC}"
fi
echo ""

echo -e "${YELLOW}Step 5: Waiting 3 seconds...${NC}"
sleep 3
echo ""

echo -e "${YELLOW}Step 6: Starting PM2...${NC}"
cd /home/andrino/apps/andrino-academy
sudo -u andrino pm2 start ecosystem.config.js
echo ""

echo -e "${YELLOW}Step 7: Checking PM2 status after 5 seconds...${NC}"
sleep 5
sudo -u andrino pm2 list
echo ""

echo -e "${YELLOW}Step 8: Verifying application is running...${NC}"
if curl -s http://localhost:3000 | grep -q "Andrino"; then
    echo -e "${GREEN}✓ Application is responding on port 3000${NC}"
else
    echo -e "${RED}✗ Application not responding${NC}"
    echo "Checking logs..."
    sudo -u andrino pm2 logs andrino-academy --lines 20 --nostream
fi
echo ""

echo -e "${YELLOW}Step 9: Saving PM2 configuration...${NC}"
sudo -u andrino pm2 save
echo ""

echo "========================================"
echo "Summary"
echo "========================================"
echo ""
echo "Check status:"
echo "  sudo -u andrino pm2 list"
echo ""
echo "View logs:"
echo "  sudo -u andrino pm2 logs andrino-academy"
echo ""
echo "Test application:"
echo "  curl http://localhost:3000"
echo "  curl -I https://andrinoacademy.com"
echo ""
