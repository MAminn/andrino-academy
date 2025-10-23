# Hostinger VPS Deployment Guide - Andrino Academy LMS

## 📋 Executive Summary

This guide provides a **production-ready deployment strategy** for Andrino Academy LMS on **Hostinger VPS** for real business use. The platform is an Arabic-first external learning coordination system built with Next.js 15, Prisma, and NextAuth.js.

**Deployment Stack:**

- **VPS**: Hostinger VPS (recommended: VPS 2 or higher)
- **OS**: Ubuntu 22.04 LTS
- **Runtime**: Node.js 20.x LTS
- **Process Manager**: PM2
- **Web Server**: Nginx (reverse proxy)
- **Database**: PostgreSQL 15+ (migrating from SQLite)
- **SSL**: Let's Encrypt (free)

---

## 🎯 Quick Deployment Checklist

- [ ] VPS provisioned (min 2GB RAM, 2 CPU cores)
- [ ] Domain configured and pointing to VPS IP
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Application deployed and running on PM2
- [ ] Nginx reverse proxy configured
- [ ] Database migrated and seeded
- [ ] Monitoring and backups configured
- [ ] Security hardening completed

---

## 📦 Phase 1: VPS Setup & Server Requirements

### 1.1 Hostinger VPS Selection

**Recommended Plan**: **VPS 2** or higher

| Specification | Minimum          | Recommended      | Notes                           |
| ------------- | ---------------- | ---------------- | ------------------------------- |
| RAM           | 2GB              | 4GB+             | Next.js can be memory-intensive |
| CPU Cores     | 2                | 4+               | Better for concurrent users     |
| Storage       | 40GB SSD         | 100GB SSD        | Database growth + backups       |
| Bandwidth     | 1TB              | 2TB+             | For media assets                |
| OS            | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS | Stability & long-term support   |

**Monthly Cost Estimate**: $7-15/month (VPS 2-3)

### 1.2 Initial Server Access

```bash
# SSH into your Hostinger VPS
ssh root@your-vps-ip-address

# Update system packages
apt update && apt upgrade -y

# Set timezone to your region (e.g., Asia/Riyadh for Saudi Arabia)
timedatectl set-timezone Asia/Riyadh

# Create a non-root user for security
adduser andrino
usermod -aG sudo andrino

# Switch to new user
su - andrino
```

### 1.3 Install Required Software

```bash
# Install Node.js 20.x LTS (use NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Install Git
sudo apt install -y git

# Install build essentials (needed for some npm packages)
sudo apt install -y build-essential

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

---

## 🗄️ Phase 2: PostgreSQL Database Configuration

### 2.1 Create Production Database

**⚠️ CRITICAL**: You **must migrate from SQLite to PostgreSQL** for production. SQLite is file-based and not suitable for multi-user web applications.

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL console:
CREATE DATABASE andrino_academy_prod;
CREATE USER andrino_admin WITH ENCRYPTED PASSWORD 'YOUR_SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE andrino_academy_prod TO andrino_admin;

# Grant schema permissions (PostgreSQL 15+)
\c andrino_academy_prod
GRANT ALL ON SCHEMA public TO andrino_admin;
ALTER DATABASE andrino_academy_prod OWNER TO andrino_admin;

# Exit PostgreSQL
\q
```

### 2.2 Configure PostgreSQL for Remote Access (if needed)

```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/15/main/postgresql.conf

# Find and modify:
listen_addresses = 'localhost'  # Keep localhost only for security

# Edit pg_hba.conf for authentication
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Add this line (for local connections):
local   all             andrino_admin                           scram-sha-256

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 2.3 Test Database Connection

```bash
# Test connection
psql -U andrino_admin -d andrino_academy_prod -h localhost

# Should prompt for password, then connect successfully
# Exit with \q
```

### 2.4 Database Security Best Practices

```bash
# Create daily backup script
sudo nano /usr/local/bin/backup-andrino-db.sh
```

Add this content:

```bash
#!/bin/bash
BACKUP_DIR="/home/andrino/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup with compression
pg_dump -U andrino_admin -h localhost andrino_academy_prod | gzip > $BACKUP_DIR/andrino_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "andrino_*.sql.gz" -mtime +7 -delete

echo "Backup completed: andrino_$DATE.sql.gz"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-andrino-db.sh

# Add to crontab (runs daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /usr/local/bin/backup-andrino-db.sh >> /home/andrino/backups/backup.log 2>&1
```

---

## 🚀 Phase 3: Application Deployment

### 3.1 Clone Repository

```bash
# Navigate to home directory
cd /home/andrino

# Clone your repository
git clone https://github.com/MAminn/andrino-academy.git
cd andrino-academy

# Checkout production branch (if you have one)
# git checkout production
```

### 3.2 Update Prisma Schema for PostgreSQL

**⚠️ CRITICAL CHANGE REQUIRED**: Update `prisma/schema.prisma`

```bash
nano prisma/schema.prisma
```

**Change datasource block:**

```prisma
// BEFORE (SQLite - Development)
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// AFTER (PostgreSQL - Production)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Important Prisma Model Changes for PostgreSQL:**

1. **Remove `@default(cuid())` where PostgreSQL doesn't support it**
2. **Use `@default(uuid())` or `@default(autoincrement())` instead**

Example changes needed in your schema:

```prisma
// BEFORE
model User {
  id String @id @default(cuid())
  // ...
}

// AFTER (Option 1: UUID)
model User {
  id String @id @default(uuid())
  // ...
}

// AFTER (Option 2: Auto-increment - better for performance)
model User {
  id Int @id @default(autoincrement())
  // But this requires changing all String foreign keys to Int
}
```

**Recommended Approach**: Use UUID for PostgreSQL:

```bash
# Find and replace all instances
sed -i 's/@default(cuid())/@default(uuid())/g' prisma/schema.prisma
```

### 3.3 Configure Environment Variables

```bash
# Create production .env file
nano .env
```

**Production .env configuration:**

```env
# Database - PostgreSQL Connection String
DATABASE_URL="postgresql://andrino_admin:YOUR_SECURE_PASSWORD_HERE@localhost:5432/andrino_academy_prod?schema=public"

# NextAuth.js Configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="GENERATE_A_NEW_STRONG_SECRET_HERE"

# Node Environment
NODE_ENV="production"

# Optional: Supabase (if you plan to use it for file storage)
# NEXT_PUBLIC_SUPABASE_URL=""
# NEXT_PUBLIC_SUPABASE_ANON_KEY=""
# SUPABASE_SERVICE_ROLE_KEY=""

# Optional: Email service (for future notifications)
# SMTP_HOST=""
# SMTP_PORT=""
# SMTP_USER=""
# SMTP_PASSWORD=""
```

**Generate NEXTAUTH_SECRET:**

```bash
# Generate a secure random secret
openssl rand -base64 64
# Copy the output and paste in .env as NEXTAUTH_SECRET
```

### 3.4 Install Dependencies and Build

```bash
# Install production dependencies
npm ci --production=false

# Generate Prisma Client for PostgreSQL
npx prisma generate

# Run database migrations
npx prisma db push

# Seed database with initial data
npm run db:seed

# Build Next.js for production
npm run build

# Test that build succeeded
ls -la .next/
# You should see standalone, static, server folders
```

### 3.5 Configure PM2 Ecosystem File

Create PM2 configuration for process management:

```bash
nano ecosystem.config.js
```

Add this content:

```javascript
module.exports = {
  apps: [
    {
      name: "andrino-academy",
      script: "npm",
      args: "start",
      cwd: "/home/andrino/andrino-academy",
      instances: 2, // Use 2 instances for load balancing
      exec_mode: "cluster", // Cluster mode for better performance
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "/home/andrino/logs/andrino-error.log",
      out_file: "/home/andrino/logs/andrino-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      time: true,
    },
  ],
};
```

```bash
# Create logs directory
mkdir -p /home/andrino/logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
# Follow the command output instructions (usually requires sudo)

# Check application status
pm2 status
pm2 logs andrino-academy --lines 50
```

---

## 🌐 Phase 4: Nginx Reverse Proxy Configuration

### 4.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/andrino-academy
```

**Initial HTTP configuration (before SSL):**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # Logs
    access_log /var/log/nginx/andrino-access.log;
    error_log /var/log/nginx/andrino-error.log;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client max body size (for file uploads)
    client_max_body_size 50M;

    # Proxy settings
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

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Favicon
    location = /favicon.ico {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/andrino-academy /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

### 4.2 Configure Domain DNS

In your domain registrar (Namecheap, GoDaddy, etc.):

```
A Record:  @     → Your_VPS_IP_Address
A Record:  www   → Your_VPS_IP_Address
```

Wait for DNS propagation (5-30 minutes).

### 4.3 Install SSL Certificate (Let's Encrypt)

```bash
# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Certbot will automatically:
# 1. Obtain certificate
# 2. Update Nginx config with SSL
# 3. Set up auto-renewal

# Test auto-renewal
sudo certbot renew --dry-run
```

**After SSL installation**, your Nginx config will be updated automatically to include:

```nginx
# SSL Configuration (added by Certbot)
listen 443 ssl http2;
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
```

---

## 🔒 Phase 5: Security Hardening

### 5.1 Firewall Configuration (UFW)

```bash
# Enable UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status

# Output should show:
# To                         Action      From
# --                         ------      ----
# OpenSSH                    ALLOW       Anywhere
# Nginx Full                 ALLOW       Anywhere
```

### 5.2 Fail2Ban (Brute Force Protection)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Create local configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Find and modify [DEFAULT] section:
bantime  = 1h
findtime = 10m
maxretry = 5

# Enable SSH jail
[sshd]
enabled = true
port    = ssh
logpath = /var/log/auth.log

# Start and enable Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

### 5.3 Disable Root SSH Login

```bash
sudo nano /etc/ssh/sshd_config

# Find and modify these lines:
PermitRootLogin no
PasswordAuthentication no  # Force key-based authentication
PubkeyAuthentication yes

# Restart SSH
sudo systemctl restart sshd
```

### 5.4 Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt install -y unattended-upgrades

# Configure automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades
# Select "Yes" when prompted
```

### 5.5 Application-Level Security

Update your `next.config.ts` for production:

```typescript
const nextConfig: NextConfig = {
  // Remove development flags
  typescript: {
    ignoreBuildErrors: false, // Enforce type checking in production
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Other production optimizations
  poweredByHeader: false,
  compress: true,
};
```

---

## 📊 Phase 6: Monitoring & Performance

### 6.1 PM2 Monitoring

```bash
# Install PM2 monitoring dashboard
pm2 install pm2-logrotate

# Configure log rotation (keep logs under control)
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# Monitor in real-time
pm2 monit

# View detailed metrics
pm2 show andrino-academy
```

### 6.2 Setup Application Monitoring (Optional - PM2 Plus)

```bash
# Free tier available for monitoring
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY

# This provides:
# - Real-time monitoring dashboard
# - Exception tracking
# - CPU/Memory alerts
# - Custom metrics
```

### 6.3 Database Performance Monitoring

```bash
# Install pg_stat_statements extension
sudo -u postgres psql andrino_academy_prod

# Inside PostgreSQL:
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

# Enable in postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Add:
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 6.4 Nginx Performance Tuning

```bash
sudo nano /etc/nginx/nginx.conf

# Add/modify in http block:
http {
    # Worker processes (set to number of CPU cores)
    worker_processes auto;

    # Worker connections
    events {
        worker_connections 2048;
        use epoll;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Client body buffer
    client_body_buffer_size 128k;
    client_max_body_size 50M;

    # Timeouts
    keepalive_timeout 65;
    send_timeout 60;

    # Connection limits
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=10r/s;
}

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔄 Phase 7: Deployment Workflow & Updates

### 7.1 Git-Based Deployment Script

Create automated deployment script:

```bash
nano /home/andrino/deploy-andrino.sh
```

```bash
#!/bin/bash
set -e

echo "🚀 Starting Andrino Academy deployment..."

# Navigate to app directory
cd /home/andrino/andrino-academy

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Generate Prisma Client
echo "🗄️ Generating Prisma Client..."
npx prisma generate

# Run migrations (if any)
echo "🔄 Running database migrations..."
npx prisma db push

# Build application
echo "🏗️ Building Next.js application..."
npm run build

# Restart PM2 process
echo "♻️ Restarting application..."
pm2 restart andrino-academy

# Show status
echo "✅ Deployment completed!"
pm2 status
pm2 logs andrino-academy --lines 20
```

```bash
# Make executable
chmod +x /home/andrino/deploy-andrino.sh

# Run deployment
./deploy-andrino.sh
```

### 7.2 Zero-Downtime Deployment

Update PM2 ecosystem for graceful reloads:

```javascript
module.exports = {
  apps: [
    {
      name: "andrino-academy",
      // ... previous config ...

      // Zero-downtime reload settings
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Graceful reload
      shutdown_with_message: true,
    },
  ],
};
```

```bash
# Use reload instead of restart (zero downtime)
pm2 reload andrino-academy
```

---

## 🎯 Phase 8: Production Optimization

### 8.1 Database Connection Pooling

Update `src/lib/prisma.ts` for production:

```typescript
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pool settings for production
    ...(process.env.NODE_ENV === "production" && {
      connectionLimit: 10, // Adjust based on your VPS plan
    }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 8.2 Next.js Production Optimizations

Update `package.json` build script:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "start": "next start -p 3000",
    "start:prod": "NODE_ENV=production next start -p 3000"
  }
}
```

### 8.3 Image Optimization

If using Next.js Image component, configure domains:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    domains: ["your-domain.com"],
    formats: ["image/avif", "image/webp"],
  },
};
```

### 8.4 CDN Integration (Optional)

For better performance with Arabic users:

- **Cloudflare** (Free tier available)
  - Automatic caching
  - DDoS protection
  - SSL included
  - Middle East PoP locations

```bash
# Setup Cloudflare:
# 1. Add domain to Cloudflare
# 2. Update nameservers at domain registrar
# 3. Set SSL mode to "Full (strict)"
# 4. Enable "Always Use HTTPS"
# 5. Configure caching rules for static assets
```

---

## 📈 Phase 9: Scaling & Performance

### 9.1 Redis Caching (For Future Growth)

When you have 100+ concurrent users:

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Set:
maxmemory 256mb
maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server

# Install Redis client in your app
npm install ioredis
```

### 9.2 Database Scaling

As data grows:

```sql
-- Create indexes on frequently queried columns
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_session_user ON "LiveSession"("instructorId");
CREATE INDEX idx_attendance_session ON "SessionAttendance"("sessionId");
CREATE INDEX idx_attendance_student ON "SessionAttendance"("studentId");

-- Analyze database performance
ANALYZE;
```

### 9.3 Horizontal Scaling (When Ready)

When single VPS is not enough:

1. **Database**: Move to managed PostgreSQL (DigitalOcean, AWS RDS)
2. **Application**: Add load balancer + multiple VPS instances
3. **Files**: Move to object storage (S3, Backblaze B2)
4. **Sessions**: Move to Redis cluster

---

## ✅ Production Checklist

### Pre-Launch Verification

- [ ] **Database**
  - [ ] PostgreSQL running and accessible
  - [ ] Database credentials secure (not in git)
  - [ ] Daily backups configured
  - [ ] Connection pooling configured
- [ ] **Application**
  - [ ] Build completes without errors
  - [ ] All environment variables set correctly
  - [ ] NEXTAUTH_SECRET is strong and unique
  - [ ] PM2 running in cluster mode
  - [ ] Logs directory configured
- [ ] **Web Server**
  - [ ] Nginx running and configured
  - [ ] SSL certificate installed and auto-renewing
  - [ ] HTTP redirects to HTTPS
  - [ ] Security headers configured
- [ ] **Security**
  - [ ] Firewall (UFW) enabled
  - [ ] Fail2Ban configured
  - [ ] Root SSH disabled
  - [ ] Automatic security updates enabled
  - [ ] Application security headers active
- [ ] **Monitoring**
  - [ ] PM2 monitoring active
  - [ ] Log rotation configured
  - [ ] Database backups running
  - [ ] Error logging working
- [ ] **Performance**
  - [ ] Gzip compression enabled
  - [ ] Static asset caching configured
  - [ ] Database indexes created
  - [ ] Connection pooling optimized

### Post-Launch Testing

```bash
# Test application health
curl -I https://your-domain.com
# Should return: HTTP/2 200

# Test SSL rating
# Visit: https://www.ssllabs.com/ssltest/
# Should get A or A+ rating

# Load test (optional)
# Install Apache Bench
sudo apt install apache2-utils

# Test with 100 concurrent requests
ab -n 1000 -c 100 https://your-domain.com/
```

---

## 🚨 Troubleshooting Guide

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U andrino_admin -d andrino_academy_prod -h localhost

# Check logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs andrino-academy --lines 100

# Check Node.js version
node --version  # Should be v20.x.x

# Rebuild application
cd /home/andrino/andrino-academy
npm run build
pm2 restart andrino-academy
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/andrino-error.log

# Restart Nginx
sudo systemctl restart nginx
```

### High Memory Usage

```bash
# Check PM2 memory
pm2 monit

# Reduce PM2 instances if needed
# Edit ecosystem.config.js, change instances: 2 → 1
pm2 reload ecosystem.config.js
```

### Database Performance Issues

```bash
# Check slow queries
sudo -u postgres psql andrino_academy_prod

# Run:
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

# Analyze and add indexes as needed
```

---

## 💰 Cost Breakdown (Monthly)

| Service         | Cost            | Notes                   |
| --------------- | --------------- | ----------------------- |
| Hostinger VPS 2 | $7-12           | Base hosting            |
| Domain Name     | $1-2            | .com domain annual cost |
| SSL Certificate | $0              | Let's Encrypt (free)    |
| Backups         | $0              | Included in VPS         |
| **Total**       | **$8-15/month** | Scales with growth      |

**Future Scaling Costs:**

- VPS 4 (4GB RAM, 4 CPU): $15-25/month
- Managed PostgreSQL: $15-50/month
- CDN (Cloudflare Pro): $20/month

---

## 📞 Support & Maintenance

### Daily Tasks

- Monitor PM2 dashboard
- Check error logs: `pm2 logs andrino-academy --lines 50`

### Weekly Tasks

- Review database backup logs
- Check disk space: `df -h`
- Review security logs: `sudo fail2ban-client status`

### Monthly Tasks

- Review performance metrics
- Update dependencies (security patches)
- Database optimization (VACUUM, ANALYZE)
- Review and rotate logs

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update non-breaking changes
npm update

# For major updates, test in staging first
npm install package@latest

# Rebuild and deploy
./deploy-andrino.sh
```

---

## 🎓 Production-Ready Summary

Your Andrino Academy LMS will be production-ready with:

✅ **Reliability**: PM2 cluster mode with auto-restart  
✅ **Security**: SSL, firewall, Fail2Ban, security headers  
✅ **Performance**: Nginx reverse proxy, Gzip, caching  
✅ **Scalability**: PostgreSQL with connection pooling  
✅ **Monitoring**: PM2 metrics, logs, database backups  
✅ **Maintainability**: Automated deployment, log rotation

**Expected Capacity**: 100-500 concurrent users on VPS 2 plan

**Need Help?**

- Hostinger Support: 24/7 live chat
- PM2 Docs: https://pm2.keymetrics.io/docs/
- Prisma PostgreSQL: https://www.prisma.io/docs/concepts/database-connectors/postgresql

---

## 📝 Quick Command Reference

```bash
# Application Management
pm2 status                          # Check app status
pm2 restart andrino-academy         # Restart app
pm2 reload andrino-academy          # Zero-downtime reload
pm2 logs andrino-academy --lines 50 # View logs

# Database Management
sudo -u postgres psql andrino_academy_prod  # Access database
/home/andrino/backup-andrino-db.sh          # Manual backup

# Server Management
sudo systemctl status nginx         # Check Nginx
sudo systemctl status postgresql    # Check PostgreSQL
sudo ufw status                     # Check firewall

# Deployment
cd /home/andrino/andrino-academy
./deploy-andrino.sh                 # Full deployment

# Monitoring
pm2 monit                           # Real-time monitoring
htop                                # System resources
df -h                               # Disk usage
```

---

**🎉 Deployment Complete! Your LMS is ready for business use.**

Next Steps:

1. Test all user roles (Student, Instructor, Coordinator, Manager, CEO)
2. Verify session creation and attendance tracking
3. Set up your first courses and grades
4. Invite your first users!

Good luck with Andrino Academy! 🚀
