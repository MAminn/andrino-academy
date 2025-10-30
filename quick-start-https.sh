#!/bin/bash

# Quick start script for Andrino Academy with HTTPS
# Run this on your VPS

echo "========================================"
echo "Starting Andrino Academy with HTTPS"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# App directory
APP_DIR="/home/andrino/apps/andrino-academy"

if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Error: App directory not found: $APP_DIR${NC}"
    exit 1
fi

cd "$APP_DIR"

echo -e "${YELLOW}Step 1: Checking current PM2 processes...${NC}"
sudo -u andrino pm2 list
echo ""

echo -e "${YELLOW}Step 2: Updating .env file with HTTPS...${NC}"

# Backup existing .env
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✓ Backed up existing .env${NC}"
fi

# Generate random secret if needed
RANDOM_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "$(date +%s | sha256sum | base64 | head -c 32)")

# Create/update .env file
cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://andrino_admin:Andrino2024!@localhost:5432/andrino_academy_prod?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="$RANDOM_SECRET"
NEXTAUTH_URL="https://andrinoacademy.com"

# Node Environment
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED=1
EOF

echo -e "${GREEN}✓ Updated .env file${NC}"
cat .env
echo ""

echo -e "${YELLOW}Step 3: Setting correct permissions...${NC}"
sudo chown andrino:andrino .env
sudo chmod 600 .env
echo -e "${GREEN}✓ Permissions set${NC}"
echo ""

echo -e "${YELLOW}Step 4: Checking ecosystem.config.js...${NC}"
if [ ! -f ecosystem.config.js ]; then
    echo "Creating ecosystem.config.js..."
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'andrino-academy',
    script: 'npm',
    args: 'start',
    cwd: '/home/andrino/apps/andrino-academy',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF
    sudo chown andrino:andrino ecosystem.config.js
    echo -e "${GREEN}✓ Created ecosystem.config.js${NC}"
else
    echo -e "${GREEN}✓ ecosystem.config.js exists${NC}"
fi
echo ""

echo -e "${YELLOW}Step 5: Checking if Next.js is built...${NC}"
if [ ! -d .next ]; then
    echo "Building Next.js application..."
    sudo -u andrino npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Build failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Build complete${NC}"
else
    echo -e "${GREEN}✓ Build exists${NC}"
fi
echo ""

echo -e "${YELLOW}Step 6: Stopping any existing PM2 processes...${NC}"
sudo -u andrino pm2 delete andrino-academy 2>/dev/null || echo "No existing process to delete"
echo ""

echo -e "${YELLOW}Step 7: Starting PM2 with ecosystem config...${NC}"
sudo -u andrino pm2 start ecosystem.config.js
echo ""

echo -e "${YELLOW}Step 8: Saving PM2 configuration...${NC}"
sudo -u andrino pm2 save
echo ""

echo -e "${YELLOW}Step 9: Setting up PM2 startup script...${NC}"
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u andrino --hp /home/andrino
echo ""

echo -e "${YELLOW}Step 10: Verifying application...${NC}"
echo ""
echo "PM2 Status:"
sudo -u andrino pm2 list
echo ""

echo "Environment Variables:"
sudo -u andrino pm2 env andrino-academy | grep -E "NODE_ENV|NEXTAUTH_URL|PORT"
echo ""

echo "Testing Node.js app on localhost:3000..."
sleep 3
if curl -s http://localhost:3000 | grep -q "Andrino"; then
    echo -e "${GREEN}✓ Node.js app is responding correctly${NC}"
else
    echo -e "${RED}✗ Node.js app not responding correctly${NC}"
    echo "PM2 logs:"
    sudo -u andrino pm2 logs andrino-academy --lines 20 --nostream
fi
echo ""

echo -e "${YELLOW}Step 11: Restarting OpenLiteSpeed...${NC}"
sudo /usr/local/lsws/bin/lswsctrl restart
echo ""

echo "========================================"
echo "Configuration Complete!"
echo "========================================"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Test HTTPS: https://andrinoacademy.com"
echo "2. Check logs: sudo -u andrino pm2 logs andrino-academy"
echo "3. Monitor: sudo -u andrino pm2 monit"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  sudo -u andrino pm2 list                 # List processes"
echo "  sudo -u andrino pm2 logs andrino-academy # View logs"
echo "  sudo -u andrino pm2 restart andrino-academy # Restart app"
echo "  sudo -u andrino pm2 env andrino-academy  # View environment"
echo ""
