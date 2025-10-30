#!/bin/bash

# Fix PM2 errored status - Andrino Academy
# This script fixes the PM2 configuration issue

echo "========================================"
echo "Fixing PM2 Configuration"
echo "========================================"
echo ""

cd /home/andrino/apps/andrino-academy

echo "Step 1: Checking current PM2 status..."
sudo -u andrino pm2 list
echo ""

echo "Step 2: Deleting all PM2 processes..."
sudo -u andrino pm2 delete all
echo ""

echo "Step 3: Creating correct ecosystem.config.js..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'andrino-academy',
    script: 'node_modules/next/dist/bin/next',
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
    },
    error_file: '/home/andrino/.pm2/logs/andrino-academy-error.log',
    out_file: '/home/andrino/.pm2/logs/andrino-academy-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
EOF

sudo chown andrino:andrino ecosystem.config.js
echo "✓ Created ecosystem.config.js"
cat ecosystem.config.js
echo ""

echo "Step 4: Starting PM2 with new configuration..."
sudo -u andrino pm2 start ecosystem.config.js
echo ""

echo "Step 5: Waiting for app to start..."
sleep 5
echo ""

echo "Step 6: Checking PM2 status..."
sudo -u andrino pm2 list
echo ""

echo "Step 7: Checking if app is running..."
if curl -s http://localhost:3000 | grep -q "Andrino"; then
    echo "✓ Application is running correctly!"
else
    echo "✗ Application may have issues. Checking logs..."
    sudo -u andrino pm2 logs andrino-academy --lines 30 --nostream
fi
echo ""

echo "Step 8: Saving PM2 configuration..."
sudo -u andrino pm2 save
echo ""

echo "Step 9: Restarting OpenLiteSpeed..."
sudo /usr/local/lsws/bin/lswsctrl restart
echo ""

echo "========================================"
echo "Fix Complete!"
echo "========================================"
echo ""
echo "Check status:"
echo "  sudo -u andrino pm2 list"
echo ""
echo "View logs:"
echo "  sudo -u andrino pm2 logs andrino-academy"
echo ""
echo "Test HTTPS:"
echo "  curl -I https://andrinoacademy.com"
echo ""
