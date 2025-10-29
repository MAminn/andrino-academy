#!/bin/bash

# Andrino Academy - OpenLiteSpeed Production Deployment Script
# Auto-detects app location and configures everything

set -e

echo "🔍 Step 1: Detecting Environment"
echo "================================="

# Check if we're running as root/sudo
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run with sudo"
    exit 1
fi

# Get the actual user (not root if using sudo)
ACTUAL_USER="${SUDO_USER:-$USER}"
echo "✓ Running as: root (actual user: $ACTUAL_USER)"

# Try to find the app directory
POSSIBLE_PATHS=(
    "/home/andrino/apps/andrino-academy"
    "/home/andrino/andrino-academy"
    "/home/ubuntu/apps/andrino-academy"
    "/home/ubuntu/andrino-academy"
    "/var/www/andrino-academy"
    "/usr/local/lsws/andrino-academy"
)

APP_DIR=""
for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -d "$path" ]; then
        APP_DIR="$path"
        echo "✓ Found app directory: $APP_DIR"
        break
    fi
done

if [ -z "$APP_DIR" ]; then
    echo "❌ Could not find app directory. Searched in:"
    printf '%s\n' "${POSSIBLE_PATHS[@]}"
    echo ""
    echo "Please specify the correct path:"
    read -p "Enter app directory path: " APP_DIR
    
    if [ ! -d "$APP_DIR" ]; then
        echo "❌ Directory not found: $APP_DIR"
        exit 1
    fi
fi

# Configuration variables
VHOST_NAME="andrinoacademy"
DOMAIN="andrinoacademy.com"
NODE_PORT="3000"
OLS_ROOT="/usr/local/lsws"
VHOST_ROOT="$OLS_ROOT/$VHOST_NAME"
VHOST_CONF_DIR="$OLS_ROOT/conf/vhosts/$VHOST_NAME"

echo ""
echo "📋 Configuration:"
echo "  App Directory: $APP_DIR"
echo "  Domain: $DOMAIN"
echo "  Node.js Port: $NODE_PORT"
echo "  OpenLiteSpeed Root: $OLS_ROOT"
echo "  Virtual Host Root: $VHOST_ROOT"
echo ""

# Check Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed"
    exit 1
fi
echo "✓ Node.js version: $(node --version)"

# Check if .env exists
if [ ! -f "$APP_DIR/.env" ]; then
    echo "⚠️  .env file not found. Creating one..."
    cat > "$APP_DIR/.env" << 'EOENV'
DATABASE_URL="postgresql://andrino_admin:Andrino2024!@localhost:5432/andrino_academy_prod?schema=public"
NEXTAUTH_URL="http://andrinoacademy.com"
NEXTAUTH_SECRET="change-this-to-a-random-secret"
NODE_ENV="production"
NEXT_TELEMETRY_DISABLED=1
EOENV
    echo "✓ Created .env file (please update NEXTAUTH_SECRET)"
fi

# Check if Next.js is built
if [ ! -d "$APP_DIR/.next" ]; then
    echo "⚠️  Next.js not built. Building now (this may take 2-3 minutes)..."
    cd "$APP_DIR"
    
    # Pull latest code
    if [ -d "$APP_DIR/.git" ]; then
        echo "  Pulling latest code..."
        sudo -u $ACTUAL_USER git pull || true
    fi
    
    # Install dependencies
    echo "  Installing dependencies..."
    sudo -u $ACTUAL_USER npm ci
    
    # Generate Prisma client
    if [ -f "$APP_DIR/prisma/schema.prisma" ]; then
        echo "  Generating Prisma client..."
        sudo -u $ACTUAL_USER npx prisma generate
    fi
    
    # Build with lint disabled
    echo "  Building application..."
    sudo -u $ACTUAL_USER bash -c "cd $APP_DIR && NEXT_LINT_DURING_BUILD=0 npx next build"
    
    if [ ! -d "$APP_DIR/.next" ]; then
        echo "❌ Build failed. Please fix build errors and try again."
        exit 1
    fi
    echo "✓ Build completed"
else
    echo "✓ Next.js build exists"
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Check if PM2 is running the app
if ! pm2 list | grep -q "andrino-academy"; then
    echo "⚠️  App not running on PM2. Starting now..."
    cd "$APP_DIR"
    
    # Create PM2 ecosystem file
    cat > "$APP_DIR/ecosystem.config.js" << EOECO
module.exports = {
  apps: [{
    name: 'andrino-academy',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
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
EOECO
    
    sudo -u $ACTUAL_USER pm2 start "$APP_DIR/ecosystem.config.js"
    sudo -u $ACTUAL_USER pm2 save
    
    # Setup PM2 startup
    env PATH=$PATH:/usr/bin pm2 startup systemd -u $ACTUAL_USER --hp /home/$ACTUAL_USER | grep "sudo" | bash || true
    
    echo "✓ PM2 started"
else
    echo "✓ PM2 is running the app"
    sudo -u $ACTUAL_USER pm2 restart andrino-academy
fi

# Test if Node.js app responds
sleep 2
if curl -s http://localhost:$NODE_PORT > /dev/null; then
    echo "✓ Node.js app responding on port $NODE_PORT"
else
    echo "❌ Node.js app not responding on port $NODE_PORT"
    echo "Check PM2 logs: sudo -u $ACTUAL_USER pm2 logs andrino-academy"
    exit 1
fi

echo ""
echo "🏗️  Step 2: Creating Virtual Host Directory Structure"
echo "====================================================="

# Create virtual host directories
mkdir -p "$VHOST_ROOT"/{html,logs,conf}
mkdir -p "$VHOST_CONF_DIR"

# Create symbolic links to Next.js static files
if [ -d "$APP_DIR/.next/static" ]; then
    rm -rf "$VHOST_ROOT/html/_next"
    ln -sf "$APP_DIR/.next" "$VHOST_ROOT/html/_next"
    echo "✓ Linked Next.js build files"
fi

# Link public directory
if [ -d "$APP_DIR/public" ]; then
    rm -rf "$VHOST_ROOT/html/public"
    ln -sf "$APP_DIR/public" "$VHOST_ROOT/html/public"
    echo "✓ Linked public directory"
fi

# Create a maintenance page
cat > "$VHOST_ROOT/html/maintenance.html" << 'EOMAINT'
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>أكاديمية أندرينو - قيد الصيانة</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 3em; margin: 0; }
        p { font-size: 1.2em; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 قيد الصيانة</h1>
        <p>أكاديمية أندرينو قيد التحديث</p>
        <p>سنعود قريباً بتجربة أفضل</p>
    </div>
</body>
</html>
EOMAINT

echo "✓ Created directory structure"

echo ""
echo "📝 Step 3: Creating Virtual Host Configuration"
echo "==============================================="

# Create the main virtual host configuration
cat > "$VHOST_CONF_DIR/vhconf.conf" << EOVHOST
# Andrino Academy Virtual Host Configuration
# Generated: $(date)

docRoot                   \$VH_ROOT/html
vhDomain                  $DOMAIN, www.$DOMAIN
enableGzip                1
enableIpGeo               1

errorlog \$VH_ROOT/logs/error.log {
  useServer               0
  logLevel                WARN
  rollingSize             10M
  keepDays                30
}

accesslog \$VH_ROOT/logs/access.log {
  useServer               0
  logFormat               "%h %l %u %t \"%r\" %>s %b"
  rollingSize             10M
  keepDays                30  
  compressArchive         1
}

index  {
  useServer               0
  indexFiles              index.html
}

errorpage 503 {
  url                     /maintenance.html
}

# Proxy all requests to Node.js app
context / {
  type                    proxy
  handler                 nodejs_backend
  addDefaultCharset       off
}

# Enable rewrite rules
rewrite  {
  enable                  1
  autoLoadHtaccess        1
  logLevel                0
}
EOVHOST

echo "✓ Created vhconf.conf"

# Create .htaccess for fallback rewrite
cat > "$VHOST_ROOT/html/.htaccess" << 'EOHTACCESS'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
EOHTACCESS

echo "✓ Created .htaccess"

echo ""
echo "🔌 Step 4: Configuring External App (Node.js Backend)"
echo "======================================================"

# Check if external app already exists
if grep -q "extprocessor nodejs_backend" "$OLS_ROOT/conf/httpd_config.conf"; then
    echo "✓ External app 'nodejs_backend' already exists"
else
    # Add external app configuration
    cat >> "$OLS_ROOT/conf/httpd_config.conf" << EOEXT

# Andrino Academy Node.js Backend
extprocessor nodejs_backend {
  type                    proxy
  address                 http://127.0.0.1:$NODE_PORT
  maxConns                500
  env                     NODE_ENV=production
  initTimeout             60
  retryTimeout            0
  persistConn             1
  pcKeepAliveTimeout      60
  respBuffer              0
  autoStart               0
}
EOEXT
    echo "✓ Added nodejs_backend external app"
fi

echo ""
echo "🔒 Step 5: Firewall Configuration"
echo "=================================="

if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 7080/tcp
    ufw --force enable
    echo "✓ Firewall configured"
else
    echo "⚠️  UFW not installed, skipping"
fi

echo ""
echo "♻️  Step 6: Setting Permissions and Restarting"
echo "=============================================="

# Set proper permissions
chown -R lsadm:lsadm "$VHOST_CONF_DIR"
chown -R nobody:nogroup "$VHOST_ROOT" 2>/dev/null || chown -R www-data:www-data "$VHOST_ROOT"

# Restart PM2
sudo -u $ACTUAL_USER pm2 restart andrino-academy

# Restart OpenLiteSpeed
$OLS_ROOT/bin/lswsctrl restart

echo "✓ Services restarted"

echo ""
echo "✅ Step 7: Verification"
echo "======================="

sleep 3

if curl -s http://localhost:$NODE_PORT > /dev/null; then
    echo "✓ Node.js app responding"
else
    echo "⚠️  Node.js app not responding"
fi

if curl -s http://localhost > /dev/null; then
    echo "✓ OpenLiteSpeed responding"
else
    echo "⚠️  OpenLiteSpeed not responding"
fi

echo ""
echo "=========================================="
echo "🎉 Configuration Complete!"
echo "=========================================="
echo ""
echo "📋 WebAdmin Configuration Required:"
echo ""
echo "Access WebAdmin: https://88.223.94.192:7080"
echo "Get password: sudo cat /home/$ACTUAL_USER/.litespeed_password"
echo ""
echo "1. Virtual Hosts > Add:"
echo "   - Name: $VHOST_NAME"
echo "   - Root: $VHOST_ROOT"
echo "   - Config: $VHOST_CONF_DIR/vhconf.conf"
echo ""
echo "2. Listeners > Add HTTP (80):"
echo "   - Map to: $VHOST_NAME"
echo "   - Domains: $DOMAIN, www.$DOMAIN"
echo ""
echo "3. Listeners > Add HTTPS (443):"
echo "   - Configure SSL certificate"
echo "   - Map to: $VHOST_NAME"
echo ""
echo "4. Click 'Graceful Restart'"
echo ""
echo "📝 Commands:"
echo "  PM2 status: sudo -u $ACTUAL_USER pm2 status"
echo "  PM2 logs: sudo -u $ACTUAL_USER pm2 logs andrino-academy"
echo "  OLS restart: sudo $OLS_ROOT/bin/lswsctrl restart"
echo "  OLS logs: sudo tail -f $OLS_ROOT/logs/error.log"
echo ""
echo "=========================================="
