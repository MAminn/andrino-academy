#!/bin/bash

# Andrino Academy - OpenLiteSpeed Production Deployment Script
# This script configures OpenLiteSpeed to serve your Next.js app via reverse proxy

set -e

echo "🔍 Step 1: Checking Current Environment"
echo "========================================"

# Check if we're running as root/sudo
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run with sudo"
    exit 1
fi

# Get the actual user (not root if using sudo)
ACTUAL_USER="${SUDO_USER:-$USER}"
echo "✓ Running as: root (actual user: $ACTUAL_USER)"

# Configuration variables
APP_DIR="/home/ubuntu/apps/andrino-academy"
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

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo "❌ App directory not found: $APP_DIR"
    echo "Please update APP_DIR variable in this script"
    exit 1
fi

echo "✓ App directory exists"

# Check if Node.js app is built
if [ ! -d "$APP_DIR/.next" ]; then
    echo "⚠️  Next.js build not found. Building now..."
    cd "$APP_DIR"
    sudo -u ubuntu npm run build
    echo "✓ Build completed"
else
    echo "✓ Next.js build exists"
fi

# Check if PM2 is running the app
if ! sudo -u ubuntu pm2 list | grep -q "andrino-academy"; then
    echo "⚠️  App not running on PM2. Starting now..."
    cd "$APP_DIR"
    sudo -u ubuntu pm2 start npm --name "andrino-academy" -- start
    sudo -u ubuntu pm2 save
    echo "✓ PM2 started"
else
    echo "✓ PM2 is running the app"
fi

# Test if Node.js app responds
if curl -s http://localhost:$NODE_PORT > /dev/null; then
    echo "✓ Node.js app responding on port $NODE_PORT"
else
    echo "❌ Node.js app not responding on port $NODE_PORT"
    echo "Please check PM2 logs: sudo -u ubuntu pm2 logs andrino-academy"
    exit 1
fi

echo ""
echo "🏗️  Step 2: Creating Virtual Host Directory Structure"
echo "====================================================="

# Create virtual host directories
mkdir -p "$VHOST_ROOT"/{html,logs,conf}
mkdir -p "$VHOST_CONF_DIR"

# Create symbolic link to Next.js static files
if [ -d "$APP_DIR/.next/static" ]; then
    rm -rf "$VHOST_ROOT/html/_next"
    ln -sf "$APP_DIR/.next/static" "$VHOST_ROOT/html/_next"
    echo "✓ Linked Next.js static files"
fi

# Create a maintenance page (backup)
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

echo "✓ Created directory structure and maintenance page"

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
  logFormat               "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-agent}i\""
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

# Serve Next.js static assets directly (optimization)
context /_next/static/ {
  location                $APP_DIR/.next/static/
  allowBrowse             1
  enableExpires           1
  expiresDefault          A604800
  
  extraHeaders            <<<END_extraHeaders
Cache-Control: public, max-age=31536000, immutable
END_extraHeaders
}

# Serve public static files directly
context /favicon.ico {
  location                $APP_DIR/public/favicon.ico
  allowBrowse             0
  enableExpires           1
  expiresDefault          A86400
}

context /robots.txt {
  location                $APP_DIR/public/robots.txt
  allowBrowse             0
}

# Enable rewrite rules
rewrite  {
  enable                  1
  autoLoadHtaccess        1
  logLevel                0
}
EOVHOST

echo "✓ Created vhconf.conf"

echo ""
echo "🔌 Step 4: Configuring External App (Node.js Backend)"
echo "======================================================"

# Check if external app already exists in httpd_config.conf
if grep -q "extprocessor nodejs_backend" "$OLS_ROOT/conf/httpd_config.conf"; then
    echo "⚠️  External app 'nodejs_backend' already exists, skipping..."
else
    # Add external app configuration
    cat >> "$OLS_ROOT/conf/httpd_config.conf" << EOEXT

# Andrino Academy Node.js Backend Configuration
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
  notes                   Andrino Academy Next.js Backend
}
EOEXT
    echo "✓ Added nodejs_backend external app"
fi

echo ""
echo "🎧 Step 5: Configuring Listeners"
echo "================================="

# We'll configure this via WebAdmin, but let's prepare the config

# Check if HTTP listener exists
LISTENER_CONF="$OLS_ROOT/conf/httpd_config.conf"

echo "✓ Listeners will be configured via WebAdmin"
echo "  HTTP (80) and HTTPS (443) listeners needed"

echo ""
echo "🔐 Step 6: SSL Certificate Setup"
echo "================================="

# Check if Let's Encrypt is installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    apt update
    apt install -y certbot
fi

echo "✓ Certbot is installed"
echo ""
echo "To get SSL certificate, run:"
echo "  sudo systemctl stop lsws"
echo "  sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN"
echo "  sudo systemctl start lsws"
echo ""
echo "Then configure in WebAdmin:"
echo "  Private Key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo "  Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"

echo ""
echo "🔒 Step 7: Firewall Configuration"
echo "=================================="

# Configure UFW firewall
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 7080/tcp  # WebAdmin
    ufw --force enable
    echo "✓ Firewall configured"
else
    echo "⚠️  UFW not installed, skipping firewall configuration"
fi

echo ""
echo "♻️  Step 8: Restarting Services"
echo "================================"

# Set proper permissions
chown -R lsadm:lsadm "$VHOST_CONF_DIR"
chown -R nobody:nogroup "$VHOST_ROOT/html" 2>/dev/null || chown -R www-data:www-data "$VHOST_ROOT/html"

# Restart PM2 to ensure it's fresh
sudo -u ubuntu pm2 restart andrino-academy

# Graceful restart OpenLiteSpeed
$OLS_ROOT/bin/lswsctrl restart

echo "✓ Services restarted"

echo ""
echo "✅ Step 9: Verification"
echo "======================="

sleep 3

# Test Node.js directly
if curl -s http://localhost:$NODE_PORT > /dev/null; then
    echo "✓ Node.js app responding on port $NODE_PORT"
else
    echo "❌ Node.js app not responding"
fi

# Test OpenLiteSpeed
if curl -s http://localhost > /dev/null; then
    echo "✓ OpenLiteSpeed responding on port 80"
else
    echo "⚠️  OpenLiteSpeed not responding on port 80"
fi

echo ""
echo "=========================================="
echo "🎉 Configuration Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps in WebAdmin (https://88.223.94.192:7080):"
echo ""
echo "1. Add Virtual Host:"
echo "   Navigation: Configuration > Virtual Hosts > Add"
echo "   - Virtual Host Name: $VHOST_NAME"
echo "   - Virtual Host Root: $VHOST_ROOT"
echo "   - Config File: $VHOST_CONF_DIR/vhconf.conf"
echo "   - Follow Symbolic Link: Yes"
echo "   - Enable Scripts/ExtApps: Yes"
echo ""
echo "2. Configure HTTP Listener (Port 80):"
echo "   Navigation: Configuration > Listeners > Add"
echo "   - Listener Name: HTTP"
echo "   - IP Address: ANY IPv4"
echo "   - Port: 80"
echo "   Then add Virtual Host Mapping:"
echo "   - Virtual Host: $VHOST_NAME"
echo "   - Domains: $DOMAIN, www.$DOMAIN"
echo ""
echo "3. Configure HTTPS Listener (Port 443):"
echo "   Navigation: Configuration > Listeners > Add"
echo "   - Listener Name: HTTPS"
echo "   - IP Address: ANY IPv4"
echo "   - Port: 443"
echo "   - Secure: Yes"
echo "   Then configure SSL and add Virtual Host Mapping"
echo ""
echo "4. Click 'Graceful Restart' in WebAdmin"
echo ""
echo "🔗 Access Points:"
echo "  App: http://$DOMAIN"
echo "  WebAdmin: https://88.223.94.192:7080"
echo ""
echo "📝 Useful Commands:"
echo "  Check PM2: sudo -u ubuntu pm2 status"
echo "  PM2 Logs: sudo -u ubuntu pm2 logs andrino-academy"
echo "  OLS Restart: sudo $OLS_ROOT/bin/lswsctrl restart"
echo "  OLS Logs: sudo tail -f $OLS_ROOT/logs/error.log"
echo "  VHost Logs: sudo tail -f $VHOST_ROOT/logs/error.log"
echo ""
echo "=========================================="
