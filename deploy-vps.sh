#!/bin/bash
set -e

echo "🚀 Andrino Academy - Automated VPS Deployment Script"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (you are: $(whoami))${NC}"
    echo "Run: sudo bash deploy-vps.sh"
    exit 1
fi

echo -e "${GREEN}✅ Running as root${NC}"
echo ""

# Step 1: Install Node.js
echo -e "${YELLOW}📦 Step 1/10: Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi
echo ""

# Step 2: Install essential packages
echo -e "${YELLOW}📦 Step 2/10: Installing essential packages...${NC}"
apt install -y git nginx postgresql postgresql-contrib build-essential
echo ""

# Step 3: Start PostgreSQL
echo -e "${YELLOW}🗄️  Step 3/10: Starting PostgreSQL...${NC}"
systemctl start postgresql
systemctl enable postgresql
systemctl status postgresql --no-pager | head -3
echo ""

# Step 4: Create database and user
echo -e "${YELLOW}🗄️  Step 4/10: Setting up database...${NC}"
sudo -u postgres psql << 'EOSQL'
-- Drop existing if any
DROP DATABASE IF EXISTS andrino_academy_prod;
DROP USER IF EXISTS andrino_admin;

-- Create fresh
CREATE USER andrino_admin WITH ENCRYPTED PASSWORD 'Andrino2024!';
CREATE DATABASE andrino_academy_prod OWNER andrino_admin;
GRANT ALL PRIVILEGES ON DATABASE andrino_academy_prod TO andrino_admin;

-- Connect and grant schema permissions
\c andrino_academy_prod
GRANT ALL ON SCHEMA public TO andrino_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO andrino_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO andrino_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO andrino_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO andrino_admin;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT 'Database setup complete!' as status;
\q
EOSQL

echo -e "${GREEN}✅ Database created successfully${NC}"
echo ""

# Step 5: Create application user
echo -e "${YELLOW}👤 Step 5/10: Creating application user...${NC}"
if ! id -u andrino &> /dev/null; then
    useradd -m -s /bin/bash andrino
    usermod -aG sudo andrino
    echo -e "${GREEN}✅ User 'andrino' created${NC}"
else
    echo "User 'andrino' already exists"
fi
echo ""

# Step 6: Clone repository as andrino user
echo -e "${YELLOW}📥 Step 6/10: Cloning repository...${NC}"
if [ ! -d "/home/andrino/andrino-academy" ]; then
    sudo -u andrino git clone https://github.com/MAminn/andrino-academy.git /home/andrino/andrino-academy
    echo -e "${GREEN}✅ Repository cloned${NC}"
else
    echo "Repository already exists, pulling latest..."
    sudo -u andrino bash -c "cd /home/andrino/andrino-academy && git pull"
fi
echo ""

# Step 7: Configure environment
echo -e "${YELLOW}⚙️  Step 7/10: Configuring environment...${NC}"
cat > /home/andrino/andrino-academy/.env << 'EOF'
DATABASE_URL="postgresql://andrino_admin:Andrino2024!@localhost:5432/andrino_academy_prod?schema=public"
NEXTAUTH_URL="http://88.223.94.192:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 64 | tr -d '\n')"
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED=1
WATCHPACK_POLLING=false
EOF

chown andrino:andrino /home/andrino/andrino-academy/.env
echo -e "${GREEN}✅ Environment configured${NC}"
echo ""

# Step 8: Update Prisma schema for PostgreSQL
echo -e "${YELLOW}🔧 Step 8/10: Updating Prisma schema...${NC}"
sudo -u andrino bash -c "cd /home/andrino/andrino-academy && cp prisma/schema.prisma prisma/schema.prisma.backup"
sudo -u andrino bash -c "cd /home/andrino/andrino-academy && sed -i 's/provider = \"sqlite\"/provider = \"postgresql\"/' prisma/schema.prisma"
sudo -u andrino bash -c "cd /home/andrino/andrino-academy && sed -i 's/url.*=.*\"file:.*/url      = env(\"DATABASE_URL\")/' prisma/schema.prisma"
sudo -u andrino bash -c "cd /home/andrino/andrino-academy && sed -i 's/@default(cuid())/@default(uuid())/g' prisma/schema.prisma"
echo -e "${GREEN}✅ Prisma schema updated${NC}"
echo ""

# Step 9: Build application
echo -e "${YELLOW}🏗️  Step 9/10: Building application (this may take 2-3 minutes)...${NC}"
sudo -u andrino bash -c "cd /home/andrino/andrino-academy && npm ci"
sudo -u andrino bash -c "cd /home/andrino/andrino-academy && npx prisma generate"
sudo -u andrino bash -c "cd /home/andrino/andrino-academy && npx prisma db push --accept-data-loss"
sudo -u andrino bash -c "cd /home/andrino/andrino-academy && npx prisma db seed"

# Build with environment variables to avoid permission issues
sudo -u andrino bash -c "cd /home/andrino/andrino-academy && export USERPROFILE=/home/andrino/andrino-academy/.temp && export APPDATA=/home/andrino/andrino-academy/.temp/AppData && export LOCALAPPDATA=/home/andrino/andrino-academy/.temp/LocalAppData && mkdir -p .temp/AppData .temp/LocalAppData && npm run build"

echo -e "${GREEN}✅ Application built successfully${NC}"
echo ""

# Step 10: Setup PM2 and Nginx
echo -e "${YELLOW}🚀 Step 10/10: Setting up PM2 and Nginx...${NC}"

# Install PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Create PM2 ecosystem file
cat > /home/andrino/andrino-academy/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'andrino-academy',
    script: 'npm',
    args: 'start',
    cwd: '/home/andrino/andrino-academy',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

chown andrino:andrino /home/andrino/andrino-academy/ecosystem.config.js

# Start with PM2 as andrino user
sudo -u andrino bash -c "cd /home/andrino/andrino-academy && pm2 start ecosystem.config.js"
sudo -u andrino bash -c "pm2 save"

# Setup PM2 startup
sudo -u andrino bash -c "pm2 startup systemd -u andrino --hp /home/andrino" | grep "sudo" | bash

# Configure Nginx
cat > /etc/nginx/sites-available/andrino-academy << 'EOF'
server {
    listen 80;
    server_name 88.223.94.192;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/andrino-academy /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# Basic firewall
ufw allow 22
ufw allow 80
ufw allow 443
echo "y" | ufw enable

echo ""
echo -e "${GREEN}✅ Nginx configured and started${NC}"
echo ""

# Final status check
echo "=================================================="
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "=================================================="
echo ""
echo "📊 Service Status:"
echo "  PostgreSQL: $(systemctl is-active postgresql)"
echo "  Nginx: $(systemctl is-active nginx)"
echo "  PM2 App: $(sudo -u andrino pm2 list | grep andrino-academy | awk '{print $10}')"
echo ""
echo "🌐 Access your application:"
echo "  URL: http://88.223.94.192"
echo ""
echo "🔐 Test Login Credentials:"
echo "  Email: ceo@andrino-academy.com"
echo "  Password: Andrino2024!"
echo ""
echo "📝 Useful Commands:"
echo "  Check logs: sudo -u andrino pm2 logs andrino-academy"
echo "  Restart app: sudo -u andrino pm2 restart andrino-academy"
echo "  Check database: psql -U andrino_admin -d andrino_academy_prod -h localhost"
echo ""
echo "=================================================="
