# 🚀 Deployment Guide - Andrino Academy on Coolify/Hostinger VPS

This guide will walk you through deploying Andrino Academy to your Hostinger VPS using Coolify.

---

## 📋 Prerequisites

- ✅ Hostinger VPS with Docker installed
- ✅ Coolify installed and running on your VPS
- ✅ Domain name pointed to your VPS IP (optional but recommended)
- ✅ SSH access to your VPS

---

## 🔧 Step 1: Prepare Your Repository

### Push to GitHub (if not already)

```bash
git add .
git commit -m "Add Docker configuration for production deployment"
git push origin main
```

---

## 🐳 Step 2: Configure Coolify

### A. Create New Application in Coolify

1. **Login to Coolify** (usually at `http://your-vps-ip:8000`)

2. **Create New Project**
   - Click "Create New Project"
   - Name: `andrino-academy`
   - Click "Create"

3. **Add New Application**
   - Click "Add New Application"
   - Choose "Public Repository" or connect your GitHub account
   - Enter repository URL: `https://github.com/MAminn/andrino-academy`
   - Branch: `main`
   - Click "Continue"

### B. Configure Build Settings

In the application settings:

1. **Build Pack**: Select "Dockerfile"
2. **Dockerfile Location**: `/Dockerfile` (root of project)
3. **Port**: `3000`
4. **Health Check Path**: `/`

### C. Set Environment Variables

Click "Environment Variables" and add these:

```env
# Required - Generate a secure random string (min 32 characters)
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters-change-this

# Required - Your domain or VPS IP
NEXTAUTH_URL=https://your-domain.com
# OR if no domain yet:
NEXTAUTH_URL=http://your-vps-ip:3000

# Database (SQLite - already configured)
DATABASE_URL=file:/app/prisma/production.db

# Node Environment
NODE_ENV=production
```

**⚠️ IMPORTANT**: Generate a strong NEXTAUTH_SECRET:
```bash
# On your local machine or VPS, run:
openssl rand -base64 32
```

### D. Configure Persistent Storage (CRITICAL)

In Coolify, add these volume mounts to persist data:

1. **Database Volume**:
   - Source: `/var/lib/docker/volumes/andrino_db_data/_data`
   - Destination: `/app/prisma`
   - This persists your SQLite database

2. **Uploads Volume**:
   - Source: `/var/lib/docker/volumes/andrino_uploads_data/_data`
   - Destination: `/app/public/uploads`
   - This persists uploaded files (videos, PDFs, etc.)

---

## 🚀 Step 3: Deploy

1. Click **"Deploy"** button in Coolify
2. Wait for build to complete (first build takes 5-10 minutes)
3. Monitor logs for any errors

### Expected Build Steps:
```
1. Cloning repository...
2. Installing dependencies...
3. Generating Prisma client...
4. Building Next.js application...
5. Creating production image...
6. Starting container...
7. Health check passed ✓
```

---

## 🗃️ Step 4: Initialize Database

### Option A: Using Coolify Console

1. Go to your application in Coolify
2. Click "Console" or "Terminal"
3. Run these commands:

```bash
# Push database schema
npx prisma db push

# Seed with test data (optional for production)
npm run db:seed
```

### Option B: Using SSH + Docker Exec

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Find container ID
docker ps | grep andrino

# Execute commands in container
docker exec -it <container-id> npx prisma db push
docker exec -it <container-id> npm run db:seed
```

---

## 🌐 Step 5: Configure Domain (Optional)

### If Using a Domain:

1. **In Coolify**:
   - Go to application settings
   - Click "Domains"
   - Add your domain: `andrino-academy.com`
   - Enable SSL/TLS (Let's Encrypt)

2. **Update DNS Records**:
   ```
   Type: A
   Name: @
   Value: your-vps-ip
   TTL: 3600
   ```

3. **Update Environment Variable**:
   - Change `NEXTAUTH_URL` to `https://your-domain.com`
   - Redeploy

---

## ✅ Step 6: Verify Deployment

### Test these URLs:

1. **Home Page**: `http://your-vps-ip:3000` or `https://your-domain.com`
2. **Login**: `http://your-vps-ip:3000/auth/signin`
3. **API Health**: `http://your-vps-ip:3000/api/health` (if you have one)

### Default Test Credentials:
```
Manager: manager@andrino.com / password123
Instructor: instructor@andrino.com / password123
Student: student@andrino.com / password123
```

**⚠️ CHANGE THESE PASSWORDS IN PRODUCTION!**

---

## 🔒 Step 7: Production Security Checklist

### Immediately After Deployment:

- [ ] Change all default passwords in database
- [ ] Verify `NEXTAUTH_SECRET` is unique and secure (32+ chars)
- [ ] Enable HTTPS/SSL via Coolify
- [ ] Backup database regularly
- [ ] Set up monitoring alerts
- [ ] Review file upload size limits
- [ ] Configure firewall rules on VPS

---

## 📦 Backup Strategy

### Automatic Backups (Recommended)

Create a backup script on your VPS:

```bash
# Create backup directory
mkdir -p /backups/andrino-academy

# Add to crontab (daily at 2 AM)
crontab -e
```

Add this line:
```bash
0 2 * * * docker exec <container-id> sqlite3 /app/prisma/production.db ".backup '/backups/andrino-academy/backup-$(date +\%Y\%m\%d).db'"
```

### Manual Backup:

```bash
# Backup database
docker cp <container-id>:/app/prisma/production.db ./backup-$(date +%Y%m%d).db

# Backup uploads
docker cp <container-id>:/app/public/uploads ./uploads-backup-$(date +%Y%m%d)
```

---

## 🔄 Updating the Application

### When You Push New Code:

1. Push changes to GitHub:
   ```bash
   git push origin main
   ```

2. In Coolify:
   - Click "Redeploy" button
   - OR enable auto-deployment on git push

3. If database schema changed:
   ```bash
   docker exec -it <container-id> npx prisma db push
   ```

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs <container-id>

# Common issues:
# 1. Missing NEXTAUTH_SECRET → Add in Coolify env vars
# 2. Database locked → Restart container
# 3. Port already in use → Change port in Coolify
```

### Database Errors

```bash
# Reset database (⚠️ destroys all data)
docker exec -it <container-id> npx prisma db push --force-reset
docker exec -it <container-id> npm run db:seed
```

### File Upload Issues

```bash
# Check permissions
docker exec -it <container-id> ls -la /app/public/uploads

# Fix permissions
docker exec -it <container-id> chown -R nextjs:nodejs /app/public/uploads
```

### Memory Issues

Edit in Coolify settings:
- Increase memory limit to 1GB minimum
- Set memory reservation to 512MB

---

## 📊 Monitoring

### Check Application Health:

```bash
# Container status
docker ps

# Resource usage
docker stats <container-id>

# Application logs
docker logs -f <container-id>
```

### Coolify Dashboard:
- Monitor CPU, memory, network usage
- Set up alerts for container crashes
- Enable automatic restarts

---

## 🎯 Production Optimization Tips

1. **Enable Caching**:
   - Coolify automatically caches Docker layers
   - Next.js output is already optimized

2. **Use CDN** (Optional):
   - Cloudflare for static assets
   - Configure in Coolify → Domain settings

3. **Database Optimization**:
   - SQLite is fast for small-medium apps
   - For 1000+ concurrent users, consider PostgreSQL

4. **File Storage**:
   - Current: Local storage in Docker volume
   - For scaling: Use S3-compatible storage (DigitalOcean Spaces, AWS S3)

---

## 🆘 Emergency Recovery

### If Everything Breaks:

1. **Stop container**:
   ```bash
   docker stop <container-id>
   ```

2. **Restore from backup**:
   ```bash
   # Copy backup into container
   docker cp backup-20250115.db <container-id>:/app/prisma/production.db
   ```

3. **Restart**:
   ```bash
   docker start <container-id>
   ```

---

## 📞 Support Resources

- **Coolify Docs**: https://coolify.io/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Docker Docs**: https://docs.docker.com/
- **Hostinger VPS Support**: https://www.hostinger.com/tutorials/vps

---

## ✨ Quick Reference Commands

```bash
# View running containers
docker ps

# Container logs
docker logs -f <container-id>

# Execute command in container
docker exec -it <container-id> <command>

# Restart container
docker restart <container-id>

# View container resource usage
docker stats <container-id>

# Backup database
docker cp <container-id>:/app/prisma/production.db ./backup.db

# SSH into container
docker exec -it <container-id> sh
```

---

**🎉 Your Andrino Academy is now live in production!**

Default URL: `http://your-vps-ip:3000`

For support or issues, check the logs first, then refer to the troubleshooting section above.
