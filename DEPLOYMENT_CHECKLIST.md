# 🚀 Production Deployment - Quick Checklist

## Pre-Deployment (Local Machine)

### 1. Code Preparation

- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] All 5 role dashboards working
- [ ] Session creation/attendance functional
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] Git repository up to date

### 2. Schema Migration

- [ ] Update `prisma/schema.prisma`: `provider = "postgresql"`
- [ ] Replace all `@default(cuid())` with `@default(uuid())`
- [ ] Test schema: `npx prisma validate`
- [ ] Commit schema changes to git

### 3. Configuration Files

- [ ] `.env.production.example` reviewed
- [ ] `ecosystem.config.js` created
- [ ] `nginx.conf.example` reviewed
- [ ] Deployment scripts ready (`scripts/deploy.sh`, `scripts/backup-database.sh`)

---

## VPS Setup (Hostinger)

### 4. Server Provisioning

- [ ] VPS plan selected (VPS 2 or higher recommended)
- [ ] Ubuntu 22.04 LTS installed
- [ ] Root password secured
- [ ] Non-root user created (`andrino`)
- [ ] SSH key authentication configured
- [ ] Timezone set (e.g., `timedatectl set-timezone Asia/Riyadh`)

### 5. Software Installation

```bash
# Run these commands on VPS
- [ ] Node.js 20.x installed
- [ ] PM2 installed globally
- [ ] Nginx installed
- [ ] PostgreSQL 15 installed
- [ ] Git installed
- [ ] Certbot installed (for SSL)
```

**Quick install script:**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update && sudo apt install -y nodejs nginx postgresql postgresql-contrib git build-essential certbot python3-certbot-nginx
sudo npm install -g pm2
```

### 6. PostgreSQL Setup

- [ ] PostgreSQL service running: `sudo systemctl status postgresql`
- [ ] Database created: `andrino_academy_prod`
- [ ] Database user created: `andrino_admin`
- [ ] Password set (strong, 20+ characters)
- [ ] Privileges granted
- [ ] Connection tested: `psql -U andrino_admin -d andrino_academy_prod`

---

## Application Deployment

### 7. Code Deployment

```bash
# On VPS
- [ ] Repository cloned: `git clone https://github.com/MAminn/andrino-academy.git`
- [ ] Navigate to directory: `cd andrino-academy`
- [ ] Dependencies installed: `npm ci --production=false`
```

### 8. Environment Configuration

- [ ] `.env` file created (from `.env.production.example`)
- [ ] `DATABASE_URL` configured with PostgreSQL connection string
- [ ] `NEXTAUTH_URL` set to production domain (https://your-domain.com)
- [ ] `NEXTAUTH_SECRET` generated: `openssl rand -base64 64`
- [ ] `NODE_ENV="production"` set
- [ ] File permissions secured: `chmod 600 .env`

### 9. Database Migration

```bash
- [ ] Prisma client generated: `npx prisma generate`
- [ ] Schema pushed to database: `npx prisma db push`
- [ ] Database seeded: `npm run db:seed`
- [ ] Data verified in PostgreSQL
```

### 10. Application Build

```bash
- [ ] Next.js built: `npm run build`
- [ ] Build successful (check for errors)
- [ ] `.next` directory created
```

---

## Process Management (PM2)

### 11. PM2 Configuration

- [ ] `ecosystem.config.js` copied/configured
- [ ] Logs directory created: `mkdir -p /home/andrino/logs`
- [ ] PM2 started: `pm2 start ecosystem.config.js`
- [ ] PM2 saved: `pm2 save`
- [ ] PM2 startup configured: `pm2 startup systemd`
- [ ] Application status verified: `pm2 status`
- [ ] Logs checked: `pm2 logs andrino-academy --lines 50`

---

## Web Server (Nginx)

### 12. Domain Configuration

- [ ] Domain purchased/available
- [ ] DNS A record points to VPS IP (`@` → VPS_IP)
- [ ] DNS A record for www points to VPS IP (`www` → VPS_IP)
- [ ] DNS propagation complete (check: `nslookup your-domain.com`)

### 13. Nginx Setup

- [ ] Configuration file created: `/etc/nginx/sites-available/andrino-academy`
- [ ] Domain name updated in config
- [ ] Symlink created: `sudo ln -s /etc/nginx/sites-available/andrino-academy /etc/nginx/sites-enabled/`
- [ ] Config tested: `sudo nginx -t`
- [ ] Nginx reloaded: `sudo systemctl reload nginx`
- [ ] HTTP access verified: `http://your-domain.com`

### 14. SSL Certificate (Let's Encrypt)

```bash
- [ ] Certbot executed: `sudo certbot --nginx -d your-domain.com -d www.your-domain.com`
- [ ] Email provided for renewals
- [ ] HTTPS redirect enabled
- [ ] Certificate installed successfully
- [ ] HTTPS access verified: `https://your-domain.com`
- [ ] Auto-renewal tested: `sudo certbot renew --dry-run`
- [ ] SSL rating checked: https://www.ssllabs.com/ssltest/
```

---

## Security Hardening

### 15. Firewall (UFW)

```bash
- [ ] UFW enabled: `sudo ufw enable`
- [ ] SSH allowed: `sudo ufw allow OpenSSH`
- [ ] HTTP/HTTPS allowed: `sudo ufw allow 'Nginx Full'`
- [ ] Status verified: `sudo ufw status`
```

### 16. Fail2Ban

```bash
- [ ] Fail2Ban installed: `sudo apt install fail2ban`
- [ ] Configuration updated: `/etc/fail2ban/jail.local`
- [ ] SSH jail enabled
- [ ] Service started: `sudo systemctl start fail2ban`
- [ ] Status checked: `sudo fail2ban-client status`
```

### 17. SSH Hardening

- [ ] Root login disabled: `PermitRootLogin no` in `/etc/ssh/sshd_config`
- [ ] Password authentication disabled (key-based only)
- [ ] SSH restarted: `sudo systemctl restart sshd`

### 18. Application Security

- [ ] `.env` file not in git (verify: `git status`)
- [ ] Security headers configured in Nginx
- [ ] Rate limiting enabled in Nginx
- [ ] Database password complex and secure
- [ ] No debug mode enabled

---

## Monitoring & Backups

### 19. Database Backups

```bash
- [ ] Backup script created: `/home/andrino/andrino-academy/scripts/backup-database.sh`
- [ ] Script executable: `chmod +x scripts/backup-database.sh`
- [ ] Backup directory created: `mkdir -p /home/andrino/backups/database`
- [ ] Manual backup tested: `./scripts/backup-database.sh`
- [ ] Cron job configured: `crontab -e`
     Add: `0 2 * * * /home/andrino/andrino-academy/scripts/backup-database.sh`
- [ ] Backup verified in `/home/andrino/backups/database/`
```

### 20. Application Monitoring

- [ ] PM2 monitoring active: `pm2 monit`
- [ ] Log rotation configured: `pm2 install pm2-logrotate`
- [ ] Error logs accessible: `pm2 logs andrino-academy`
- [ ] Nginx logs accessible: `/var/log/nginx/andrino-*.log`

### 21. System Monitoring

- [ ] Disk usage checked: `df -h`
- [ ] Memory usage checked: `free -h`
- [ ] CPU usage checked: `htop` or `top`
- [ ] Automatic updates configured: `sudo dpkg-reconfigure unattended-upgrades`

---

## Testing & Validation

### 22. Functional Testing

- [ ] Homepage loads: `https://your-domain.com`
- [ ] Login page accessible
- [ ] Test login - CEO: `ceo@andrino-academy.com` / `Andrino2024!`
- [ ] Test login - Manager: `manager@andrino-academy.com` / `Manager2024!`
- [ ] Test login - Instructor: `ahmed.instructor@andrino-academy.com` / `Instructor123!`
- [ ] Test login - Student: `ali.student@andrino-academy.com` / `Student123!`
- [ ] Dashboard loads for each role
- [ ] Session creation works (Instructor)
- [ ] Attendance marking works
- [ ] Student can view sessions
- [ ] All modals open and scroll properly

### 23. Performance Testing

```bash
- [ ] Page load time acceptable (<3s)
- [ ] No console errors in browser
- [ ] API responses fast (<500ms)
- [ ] Images optimized and loading
- [ ] SSL certificate valid
- [ ] HTTPS redirect working
```

### 24. Security Testing

- [ ] HTTP redirects to HTTPS
- [ ] Security headers present (check browser DevTools → Network)
- [ ] Rate limiting working (test rapid requests)
- [ ] SQL injection prevention (Prisma ORM handles this)
- [ ] XSS prevention (Next.js handles this)
- [ ] CSRF protection (NextAuth handles this)

---

## Documentation & Handoff

### 25. Documentation

- [ ] `.env.production.example` documented
- [ ] Deployment guide available
- [ ] Database backup procedure documented
- [ ] Update/deployment procedure documented
- [ ] Troubleshooting guide available
- [ ] Admin credentials securely shared with client

### 26. Client Training

- [ ] Admin panel walkthrough
- [ ] User management explained
- [ ] Session creation demonstrated
- [ ] Attendance marking demonstrated
- [ ] Report generation (when implemented)
- [ ] Backup/restore procedure explained

---

## Post-Deployment

### 27. Monitoring Setup (Week 1)

- [ ] Check application daily: `pm2 status`
- [ ] Review error logs: `pm2 logs andrino-academy --err`
- [ ] Monitor disk space: `df -h`
- [ ] Verify backups running
- [ ] Check SSL expiry: `sudo certbot certificates`

### 28. Performance Optimization (After Initial Use)

- [ ] Database indexes created (see POSTGRESQL_MIGRATION_GUIDE.md)
- [ ] Analyze slow queries
- [ ] Optimize PM2 instances based on CPU usage
- [ ] Configure CDN (Cloudflare) if needed
- [ ] Enable caching where appropriate

### 29. Scaling Plan (Future)

- [ ] Monitor user growth
- [ ] Plan for database scaling (connection pooling, read replicas)
- [ ] Plan for horizontal scaling (load balancer, multiple VPS)
- [ ] Consider managed services (AWS RDS, DigitalOcean Databases)

---

## Emergency Contacts & Resources

**Hostinger Support:**

- 24/7 Live Chat
- Email: support@hostinger.com

**Documentation:**

- Full Guide: `HOSTINGER_DEPLOYMENT_GUIDE.md`
- Database Migration: `POSTGRESQL_MIGRATION_GUIDE.md`
- Production Test Plan: `PRODUCTION_TEST_PLAN.md`

**Useful Commands:**

```bash
# Application
pm2 restart andrino-academy    # Restart app
pm2 logs andrino-academy        # View logs
pm2 monit                       # Monitor resources

# Database
sudo -u postgres psql andrino_academy_prod    # Access database
/home/andrino/andrino-academy/scripts/backup-database.sh    # Backup

# Server
sudo systemctl status nginx     # Check Nginx
sudo systemctl status postgresql # Check PostgreSQL
sudo ufw status                 # Check firewall
htop                            # System resources

# Deployment
cd /home/andrino/andrino-academy
./scripts/deploy.sh             # Deploy updates
```

---

## ✅ Final Checklist

- [ ] Application accessible at https://your-domain.com
- [ ] All 5 roles can login
- [ ] Sessions can be created and managed
- [ ] Attendance tracking works
- [ ] SSL certificate valid (A+ rating)
- [ ] Backups running daily
- [ ] Monitoring configured
- [ ] Documentation complete
- [ ] Client trained
- [ ] Support plan in place

**Status: PRODUCTION READY! 🚀**

---

## Estimated Timeline

| Phase             | Duration        | Tasks                                      |
| ----------------- | --------------- | ------------------------------------------ |
| **VPS Setup**     | 2-3 hours       | Server provisioning, software installation |
| **Database**      | 1-2 hours       | PostgreSQL setup, migration, testing       |
| **Deployment**    | 2-3 hours       | Code deployment, build, PM2 setup          |
| **Nginx & SSL**   | 1-2 hours       | Domain config, SSL certificate             |
| **Security**      | 1-2 hours       | Firewall, Fail2Ban, hardening              |
| **Testing**       | 2-3 hours       | Functional, performance, security testing  |
| **Documentation** | 1 hour          | Final docs and handoff                     |
| **Total**         | **10-16 hours** | Full production deployment                 |

**Recommendation:** Deploy in stages over 2-3 days for thorough testing.

---

## Cost Summary

| Item            | Monthly Cost       | Annual Cost      |
| --------------- | ------------------ | ---------------- |
| Hostinger VPS 2 | $7-12              | $84-144          |
| Domain (.com)   | -                  | $12-15           |
| SSL Certificate | $0 (Let's Encrypt) | $0               |
| **Total**       | **$7-12/month**    | **$96-159/year** |

**ROI:** Affordable production hosting for real business LMS operations.

Good luck with your deployment! 🎉
