#!/bin/bash

# Script to update HTTP URLs to HTTPS for production
# Run this on your VPS server

echo "========================================"
echo "Update HTTP to HTTPS - Andrino Academy"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get domain or use default
DOMAIN="${1:-andrinoacademy.com}"

echo -e "${YELLOW}Domain: $DOMAIN${NC}"
echo ""

# App directory
APP_DIR="/home/andrino/apps/andrino-academy"

if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Error: App directory not found: $APP_DIR${NC}"
    exit 1
fi

cd "$APP_DIR"

echo -e "${YELLOW}Step 1: Backing up current .env file...${NC}"
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✓ Backup created${NC}"
else
    echo -e "${YELLOW}! No .env file found, will create new one${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Updating .env file with HTTPS URLs...${NC}"

# Create or update .env file
cat > .env << EOF
# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_SECRET="$(openssl rand -base64 32 2>/dev/null || echo 'your-secure-secret-key-here')"
NEXTAUTH_URL="https://$DOMAIN"

# Node Environment
NODE_ENV="production"
EOF

echo -e "${GREEN}✓ .env file updated${NC}"
cat .env
echo ""

echo -e "${YELLOW}Step 3: Updating PM2 ecosystem config...${NC}"

# Update ecosystem.config.js
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

echo -e "${GREEN}✓ PM2 config updated${NC}"
echo ""

echo -e "${YELLOW}Step 4: Checking OpenLiteSpeed SSL configuration...${NC}"

# Check if SSL certificates exist
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo -e "${GREEN}✓ SSL certificates found for $DOMAIN${NC}"
    ls -l /etc/letsencrypt/live/$DOMAIN/
else
    echo -e "${RED}✗ SSL certificates not found${NC}"
    echo ""
    echo "To install SSL certificate, run:"
    echo "  sudo systemctl stop lsws"
    echo "  sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN"
    echo "  sudo systemctl start lsws"
    echo ""
fi

echo ""
echo -e "${YELLOW}Step 5: Checking OpenLiteSpeed HTTPS listener...${NC}"

# Check if HTTPS listener is configured
if sudo grep -q "listener.*443" /usr/local/lsws/conf/httpd_config.conf; then
    echo -e "${GREEN}✓ HTTPS listener configured${NC}"
else
    echo -e "${YELLOW}! HTTPS listener may need configuration in WebAdmin${NC}"
    echo "  Go to: https://$(curl -s ifconfig.me):7080"
    echo "  Configuration → Listeners → HTTPS (443)"
fi

echo ""
echo -e "${YELLOW}Step 6: Restarting services...${NC}"

# Restart PM2
echo "Restarting PM2..."
sudo -u andrino pm2 restart andrino-academy --update-env
sudo -u andrino pm2 save

# Reload OpenLiteSpeed
echo "Reloading OpenLiteSpeed..."
sudo /usr/local/lsws/bin/lswsctrl restart

echo -e "${GREEN}✓ Services restarted${NC}"
echo ""

echo "========================================"
echo "Testing Configuration"
echo "========================================"
echo ""

# Test Node.js app
echo -e "${YELLOW}Testing Node.js app on port 3000...${NC}"
if curl -s http://localhost:3000 | grep -q "Andrino"; then
    echo -e "${GREEN}✓ Node.js app responding${NC}"
else
    echo -e "${RED}✗ Node.js app not responding correctly${NC}"
fi

echo ""

# Test HTTPS
echo -e "${YELLOW}Testing HTTPS...${NC}"
if curl -sk "https://$DOMAIN" | grep -q "Andrino"; then
    echo -e "${GREEN}✓ HTTPS working correctly${NC}"
else
    echo -e "${YELLOW}! HTTPS may need additional configuration${NC}"
fi

echo ""
echo "========================================"
echo "Next Steps"
echo "========================================"
echo ""
echo "1. Test your site: https://$DOMAIN"
echo "2. If SSL not working, configure HTTPS listener in OpenLiteSpeed WebAdmin:"
echo "   - URL: https://$(curl -s ifconfig.me):7080"
echo "   - Configuration → Listeners → HTTPS (443)"
echo "   - SSL Tab:"
echo "     • Private Key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo "     • Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "   - Virtual Host Mappings Tab:"
echo "     • Add: $DOMAIN, www.$DOMAIN → andrinoacademy"
echo "   - Actions → Graceful Restart"
echo ""
echo "3. Verify environment variables:"
echo "   sudo -u andrino pm2 env andrino-academy"
echo ""
echo "4. Check PM2 logs:"
echo "   sudo -u andrino pm2 logs andrino-academy --lines 50"
echo ""

echo -e "${GREEN}✓ Update complete!${NC}"
