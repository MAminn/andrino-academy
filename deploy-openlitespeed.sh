#!/bin/bash
set -e

echo "🚀 Andrino Academy - OpenLiteSpeed VPS Deployment Script"
echo "========================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root or with sudo${NC}"
    echo "Run: sudo bash deploy-openlitespeed.sh"
    exit 1
fi

echo -e "${GREEN}✅ Running with root privileges${NC}"
echo ""

# Step 1: Install Node.js
echo -e "${YELLOW}📦 Step 1/9: Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi
echo ""

# Step 2: Install essential packages
echo -e "${YELLOW}📦 Step 2/9: Installing essential packages...${NC}"
apt install -y git postgresql postgresql-contrib build-essential
echo ""

# Step 3: Start PostgreSQL
echo -e "${YELLOW}🗄️  Step 3/9: Starting PostgreSQL...${NC}"
systemctl start postgresql
systemctl enable postgresql
echo -e "${GREEN}✅ PostgreSQL started${NC}"
echo ""

# Step 4: Create database and user
echo -e "${YELLOW}🗄️  Step 4/9: Setting up database...${NC}"
sudo -u postgres psql << 'EOSQL'
DROP DATABASE IF EXISTS andrino_academy_prod;
DROP USER IF EXISTS andrino_admin;

CREATE USER andrino_admin WITH ENCRYPTED PASSWORD 'Andrino2024!';
CREATE DATABASE andrino_academy_prod OWNER andrino_admin;
GRANT ALL PRIVILEGES ON DATABASE andrino_academy_prod TO andrino_admin;

\c andrino_academy_prod
GRANT ALL ON SCHEMA public TO andrino_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO andrino_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO andrino_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO andrino_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO andrino_admin;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT 'Database setup complete!' as status;
\q
EOSQL

echo -e "${GREEN}✅ Database created successfully${NC}"
echo ""

# Step 5: Setup application directory
echo -e "${YELLOW}📁 Step 5/9: Setting up application directory...${NC}"

# Determine web root (common OpenLiteSpeed paths)
if [ -d "/usr/local/lsws/Example/html" ]; then
    WEBROOT="/usr/local/lsws/andrino-academy"
elif [ -d "/var/www/html" ]; then
    WEBROOT="/var/www/andrino-academy"
else
    WEBROOT="/home/andrino/andrino-academy"
fi

echo "Using web root: $WEBROOT"

# Create directory if it doesn't exist
mkdir -p $WEBROOT

# Clone or update repository
if [ ! -d "$WEBROOT/.git" ]; then
    git clone https://github.com/MAminn/andrino-academy.git $WEBROOT
    echo -e "${GREEN}✅ Repository cloned${NC}"
else
    cd $WEBROOT && git pull
    echo -e "${GREEN}✅ Repository updated${NC}"
fi
echo ""

# Step 6: Configure environment
echo -e "${YELLOW}⚙️  Step 6/9: Configuring environment...${NC}"
NEXTAUTH_SECRET=$(openssl rand -base64 64 | tr -d '\n')

cat > $WEBROOT/.env << EOF
DATABASE_URL="postgresql://andrino_admin:Andrino2024!@localhost:5432/andrino_academy_prod?schema=public"
NEXTAUTH_URL="http://88.223.94.192:3000"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED=1
WATCHPACK_POLLING=false
EOF

echo -e "${GREEN}✅ Environment configured${NC}"
echo ""

# Step 7: Update Prisma schema for PostgreSQL
echo -e "${YELLOW}🔧 Step 7/9: Updating Prisma schema...${NC}"
cd $WEBROOT
cp prisma/schema.prisma prisma/schema.prisma.backup
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
sed -i 's/url.*=.*"file:.*/url      = env("DATABASE_URL")/' prisma/schema.prisma
sed -i 's/@default(cuid())/@default(uuid())/g' prisma/schema.prisma
echo -e "${GREEN}✅ Prisma schema updated${NC}"
echo ""

# Step 8: Build application
echo -e "${YELLOW}🏗️  Step 8/9: Building application (this may take 2-3 minutes)...${NC}"
cd $WEBROOT
npm ci
npx prisma generate
npx prisma db push --accept-data-loss
npx prisma db seed

# Build with environment variables
export USERPROFILE=$WEBROOT/.temp
export APPDATA=$WEBROOT/.temp/AppData
export LOCALAPPDATA=$WEBROOT/.temp/LocalAppData
mkdir -p .temp/AppData .temp/LocalAppData
npm run build

echo -e "${GREEN}✅ Application built successfully${NC}"
echo ""

# Step 9: Setup PM2 and configure OpenLiteSpeed
echo -e "${YELLOW}🚀 Step 9/9: Setting up PM2 and OpenLiteSpeed proxy...${NC}"

# Install PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Create PM2 ecosystem file
cat > $WEBROOT/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'andrino-academy',
    script: 'npm',
    args: 'start',
    cwd: '$WEBROOT',
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

# Replace $WEBROOT placeholder with actual path
sed -i "s|\$WEBROOT|$WEBROOT|g" $WEBROOT/ecosystem.config.js

# Stop existing PM2 process if any
pm2 delete andrino-academy 2>/dev/null || true

# Start with PM2
cd $WEBROOT
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u $(logname) --hp $(eval echo ~$(logname)) | grep "sudo" | bash || true

echo -e "${GREEN}✅ PM2 configured and started${NC}"
echo ""

# Configure OpenLiteSpeed Virtual Host
echo -e "${YELLOW}🌐 Configuring OpenLiteSpeed Virtual Host...${NC}"

# OpenLiteSpeed configuration directory
OLS_CONF="/usr/local/lsws/conf"

# Create virtual host configuration
cat > $OLS_CONF/vhosts/andrino-academy.conf << 'EOVHOST'
docRoot                   $VH_ROOT/html/
vhDomain                  88.223.94.192
vhAliases                 www.88.223.94.192
enableGzip                1
enableIpGeo               1

context / {
  type                    proxy
  handler                 lsapi:andrino
  addDefaultCharset       off
}

context /lsws {
  location                $SERVER_ROOT/share/autoindex
  allowBrowse             1
  indexFiles              index.html
}

rewrite  {
  enable                  1
  autoLoadHtaccess        1
}
EOVHOST

# Create external app configuration for Node.js proxy
cat >> $OLS_CONF/httpd_config.conf << 'EOAPP'

extprocessor andrino {
  type                    proxy
  address                 http://127.0.0.1:3000
  maxConns                100
  pcKeepAliveTimeout      60
  initTimeout             60
  retryTimeout            0
  respBuffer              0
}
EOAPP

# Create .htaccess for OpenLiteSpeed rewrite rules
cat > $WEBROOT/.htaccess << 'EOHTACCESS'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
EOHTACCESS

echo -e "${GREEN}✅ OpenLiteSpeed configured${NC}"
echo ""

# Restart OpenLiteSpeed
echo -e "${YELLOW}🔄 Restarting OpenLiteSpeed...${NC}"
/usr/local/lsws/bin/lswsctrl restart
echo ""

# Basic firewall
echo -e "${YELLOW}🔒 Configuring firewall...${NC}"
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 7080  # OpenLiteSpeed WebAdmin
ufw allow 3000  # Node.js (for debugging)
echo "y" | ufw enable || true
echo ""

# Set proper permissions
chown -R nobody:nogroup $WEBROOT || chown -R www-data:www-data $WEBROOT

# Final status check
echo "========================================================="
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "========================================================="
echo ""
echo "📊 Service Status:"
echo "  PostgreSQL: $(systemctl is-active postgresql)"
echo "  OpenLiteSpeed: $(/usr/local/lsws/bin/lswsctrl status | head -1)"
echo "  PM2 App: $(pm2 list | grep andrino-academy | awk '{print $10}' || echo 'online')"
echo ""
echo "📁 Application Directory: $WEBROOT"
echo ""
echo "🌐 Access your application:"
echo "  Frontend: http://88.223.94.192"
echo "  OpenLiteSpeed WebAdmin: https://88.223.94.192:7080"
echo ""
echo "🔐 Test Login Credentials:"
echo "  Email: ceo@andrino-academy.com"
echo "  Password: Andrino2024!"
echo ""
echo "📝 Useful Commands:"
echo "  Check logs: pm2 logs andrino-academy"
echo "  Restart app: pm2 restart andrino-academy"
echo "  Restart OLS: /usr/local/lsws/bin/lswsctrl restart"
echo "  Check database: psql -U andrino_admin -d andrino_academy_prod -h localhost"
echo ""
echo "⚠️  Next Steps:"
echo "  1. Configure OpenLiteSpeed Virtual Host in WebAdmin (port 7080)"
echo "  2. Point your domain to this server"
echo "  3. Setup SSL certificate"
echo ""
echo "========================================================="
