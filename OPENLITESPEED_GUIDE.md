# OpenLiteSpeed Deployment Guide - Andrino Academy

## 🚀 Quick Deployment with OpenLiteSpeed

### Prerequisites

- Hostinger VPS with OpenLiteSpeed installed
- Root or sudo access
- IP: 88.223.94.192

---

## 📦 Method 1: Automated Script (Recommended)

**In your SSH terminal (as root or with sudo):**

```bash
# Download the deployment script
wget https://raw.githubusercontent.com/MAminn/andrino-academy/main/deploy-openlitespeed.sh

# Make it executable
chmod +x deploy-openlitespeed.sh

# Run it
sudo bash deploy-openlitespeed.sh
```

**That's it!** The script will handle everything automatically.

---

## 🔧 Method 2: Manual Configuration

If you prefer manual control or the script doesn't work:

### Step 1: Install Node.js and Dependencies

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs git postgresql postgresql-contrib build-essential

# Verify
node --version
npm --version
```

### Step 2: Setup PostgreSQL

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql

sudo -u postgres psql << 'EOF'
CREATE DATABASE andrino_academy_prod;
CREATE USER andrino_admin WITH ENCRYPTED PASSWORD 'Andrino2024!';
GRANT ALL PRIVILEGES ON DATABASE andrino_academy_prod TO andrino_admin;
\c andrino_academy_prod
GRANT ALL ON SCHEMA public TO andrino_admin;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
EOF
```

### Step 3: Clone and Configure Application

```bash
# Clone to web directory
cd /usr/local/lsws
sudo mkdir andrino-academy
cd andrino-academy
sudo git clone https://github.com/MAminn/andrino-academy.git .

# Create environment file
sudo tee .env << 'EOF'
DATABASE_URL="postgresql://andrino_admin:Andrino2024!@localhost:5432/andrino_academy_prod?schema=public"
NEXTAUTH_URL="http://88.223.94.192:3000"
NEXTAUTH_SECRET="your-secret-here"
NODE_ENV="production"
EOF

# Update Prisma schema
sudo sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
sudo sed -i 's/@default(cuid())/@default(uuid())/g' prisma/schema.prisma

# Install and build
npm ci
npx prisma generate
npx prisma db push
npx prisma db seed
npm run build
```

### Step 4: Setup PM2

```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start npm --name "andrino-academy" -- start
pm2 save
pm2 startup systemd
```

### Step 5: Configure OpenLiteSpeed Reverse Proxy

#### Option A: Using WebAdmin GUI (Easiest)

1. **Access WebAdmin**: https://88.223.94.192:7080
2. **Login** with your admin credentials
3. Navigate to **Virtual Hosts** → **Add**
4. Create new Virtual Host:

   - Name: `andrino-academy`
   - Virtual Host Root: `/usr/local/lsws/andrino-academy`
   - Document Root: `$VH_ROOT`
   - Domain Name: `88.223.94.192`

5. Add **External App**:

   - Go to **Server Configuration** → **External App**
   - Type: `Web Server (Proxy)`
   - Name: `andrino-node`
   - Address: `http://127.0.0.1:3000`
   - Max Connections: `100`

6. Configure **Context**:

   - Go to your Virtual Host → **Context**
   - URI: `/`
   - Type: `Proxy`
   - Web Server: `[External App] andrino-node`

7. **Graceful Restart** OpenLiteSpeed

#### Option B: Using Configuration Files

```bash
# Add external app to httpd_config.conf
sudo tee -a /usr/local/lsws/conf/httpd_config.conf << 'EOF'

extprocessor andrino {
  type                    proxy
  address                 http://127.0.0.1:3000
  maxConns                100
  pcKeepAliveTimeout      60
  initTimeout             60
  retryTimeout            0
  respBuffer              0
}
EOF

# Create virtual host directory
sudo mkdir -p /usr/local/lsws/conf/vhosts/andrino-academy

# Create virtual host config
sudo tee /usr/local/lsws/conf/vhosts/andrino-academy/vhconf.conf << 'EOF'
docRoot                   $VH_ROOT
vhDomain                  88.223.94.192
enableGzip                1

context / {
  type                    proxy
  handler                 andrino
  addDefaultCharset       off
}

rewrite  {
  enable                  1
  autoLoadHtaccess        1
}
EOF

# Create .htaccess for rewrite rules
sudo tee /usr/local/lsws/andrino-academy/.htaccess << 'EOF'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
EOF

# Restart OpenLiteSpeed
sudo /usr/local/lsws/bin/lswsctrl restart
```

---

## ✅ Verify Deployment

```bash
# Check all services
pm2 status
sudo systemctl status postgresql
sudo /usr/local/lsws/bin/lswsctrl status

# Test Node.js app directly
curl http://localhost:3000

# Test through OpenLiteSpeed
curl http://88.223.94.192
```

**Visit**: http://88.223.94.192

**Login**:

- Email: `ceo@andrino-academy.com`
- Password: `Andrino2024!`

---

## 🔒 Security & SSL Setup

### Enable Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 7080  # OpenLiteSpeed WebAdmin
sudo ufw --force enable
```

### Setup SSL with Let's Encrypt

OpenLiteSpeed has built-in Let's Encrypt integration:

1. Access **WebAdmin**: https://88.223.94.192:7080
2. Go to **Virtual Hosts** → Your Virtual Host
3. Navigate to **SSL** tab
4. Click **Request SSL Certificate**
5. Enter your email and domain
6. Click **Request**

Or via command line:

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --webroot -w /usr/local/lsws/andrino-academy -d yourdomain.com

# Configure in OpenLiteSpeed WebAdmin:
# SSL Private Key: /etc/letsencrypt/live/yourdomain.com/privkey.pem
# SSL Certificate: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

---

## 📊 Monitoring & Maintenance

### Check Application Logs

```bash
# PM2 logs
pm2 logs andrino-academy

# OpenLiteSpeed error log
sudo tail -f /usr/local/lsws/logs/error.log

# OpenLiteSpeed access log
sudo tail -f /usr/local/lsws/logs/access.log
```

### Restart Services

```bash
# Restart Node.js app
pm2 restart andrino-academy

# Restart OpenLiteSpeed
sudo /usr/local/lsws/bin/lswsctrl restart

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Update Application

```bash
cd /usr/local/lsws/andrino-academy
sudo git pull
npm ci
npx prisma generate
npx prisma db push
npm run build
pm2 restart andrino-academy
```

---

## 🚨 Troubleshooting

### 503 Service Unavailable

```bash
# Check if Node.js app is running
pm2 status

# Check OpenLiteSpeed logs
sudo tail -100 /usr/local/lsws/logs/error.log

# Restart both services
pm2 restart andrino-academy
sudo /usr/local/lsws/bin/lswsctrl restart
```

### Database Connection Error

```bash
# Test database connection
psql -U andrino_admin -d andrino_academy_prod -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection string in .env file
cat /usr/local/lsws/andrino-academy/.env | grep DATABASE_URL
```

### Port Already in Use

```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill the process if needed
sudo kill -9 <PID>

# Restart PM2
pm2 restart andrino-academy
```

---

## 🎯 Performance Optimization

### OpenLiteSpeed Caching

Enable caching in WebAdmin:

- Go to **Server Configuration** → **Modules**
- Enable **Cache Module**
- Configure cache storage path and policies

### PM2 Cluster Mode

```bash
# Edit ecosystem.config.js
cat > /usr/local/lsws/andrino-academy/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'andrino-academy',
    script: 'npm',
    args: 'start',
    instances: 2,  // Use 2 instances for better performance
    exec_mode: 'cluster',
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

pm2 reload ecosystem.config.js
```

---

## 📞 Support

- **OpenLiteSpeed Docs**: https://openlitespeed.org/kb/
- **PM2 Docs**: https://pm2.keymetrics.io/docs/
- **Hostinger Support**: 24/7 live chat

---

**Your Andrino Academy LMS is now running on OpenLiteSpeed!** 🎉
