# Andrino Academy - Production Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          INTERNET / PUBLIC ACCESS                        │
│                        (Students, Instructors, Admins)                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTPS (Port 443)
                                 │ HTTP (Port 80 → redirects to 443)
                                 │
                    ┌────────────▼────────────┐
                    │   CLOUDFLARE (Optional) │
                    │   ─────────────────────  │
                    │   • DNS Management       │
                    │   • DDoS Protection      │
                    │   • CDN Caching          │
                    │   • SSL/TLS             │
                    └────────────┬────────────┘
                                 │
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                      HOSTINGER VPS (Ubuntu 22.04 LTS)                   │
│  IP: XXX.XXX.XXX.XXX                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                     SECURITY LAYER                                │ │
│  │  ─────────────────────────────────────────────────────────────── │ │
│  │  • UFW Firewall (Ports: 22, 80, 443)                            │ │
│  │  • Fail2Ban (Brute Force Protection)                            │ │
│  │  • SSH Key Authentication Only                                   │ │
│  │  • Automatic Security Updates                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                   NGINX WEB SERVER (Port 443/80)                 │ │
│  │  ─────────────────────────────────────────────────────────────── │ │
│  │  Configuration: /etc/nginx/sites-available/andrino-academy       │ │
│  │                                                                   │ │
│  │  RESPONSIBILITIES:                                                │ │
│  │  • SSL/TLS Termination (Let's Encrypt)                          │ │
│  │  • Reverse Proxy to Node.js                                      │ │
│  │  • Rate Limiting (API: 30 req/min, Login: 5 req/min)            │ │
│  │  • Gzip Compression                                              │ │
│  │  • Static File Caching (365 days)                               │ │
│  │  • Security Headers (HSTS, CSP, X-Frame-Options)                │ │
│  │  • Load Balancing (upstream to PM2 instances)                   │ │
│  │                                                                   │ │
│  │  LOGS:                                                            │ │
│  │  • Access: /var/log/nginx/andrino-access.log                    │ │
│  │  • Error:  /var/log/nginx/andrino-error.log                     │ │
│  └─────────────────────────┬─────────────────────────────────────────┘ │
│                            │                                             │
│                            │ Proxy Pass (localhost:3000)                 │
│                            │                                             │
│  ┌─────────────────────────▼─────────────────────────────────────────┐ │
│  │                    PM2 PROCESS MANAGER                            │ │
│  │  ─────────────────────────────────────────────────────────────── │ │
│  │  Configuration: /home/andrino/andrino-academy/ecosystem.config.js│ │
│  │                                                                   │ │
│  │  CLUSTER MODE:                                                    │ │
│  │  ┌──────────────────────────┐  ┌──────────────────────────┐     │ │
│  │  │  Node Instance #1        │  │  Node Instance #2        │     │ │
│  │  │  Port: 3000              │  │  Port: 3000              │     │ │
│  │  │  PID: XXXX               │  │  PID: XXXX               │     │ │
│  │  │  Memory: ~500MB          │  │  Memory: ~500MB          │     │ │
│  │  └──────────────────────────┘  └──────────────────────────┘     │ │
│  │                                                                   │ │
│  │  FEATURES:                                                        │ │
│  │  • Auto-restart on crash                                         │ │
│  │  • Load balancing between instances                              │ │
│  │  • Zero-downtime reload (pm2 reload)                            │ │
│  │  • Memory limit: 1GB per instance                               │ │
│  │  • Log rotation (max 10MB, keep 7 days)                         │ │
│  │                                                                   │ │
│  │  LOGS:                                                            │ │
│  │  • Output: /home/andrino/logs/andrino-out.log                   │ │
│  │  • Error:  /home/andrino/logs/andrino-error.log                 │ │
│  └─────────────────────────┬─────────────────────────────────────────┘ │
│                            │                                             │
│                            │                                             │
│  ┌─────────────────────────▼─────────────────────────────────────────┐ │
│  │              NEXT.JS 15 APPLICATION (Node.js 20.x)               │ │
│  │  ─────────────────────────────────────────────────────────────── │ │
│  │  Location: /home/andrino/andrino-academy                         │ │
│  │                                                                   │ │
│  │  COMPONENTS:                                                      │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │ │
│  │  │  Frontend (SSR) │  │   API Routes    │  │  NextAuth.js    │ │ │
│  │  │  ───────────────│  │  ──────────────  │  │  ──────────────  │ │ │
│  │  │  • React 19     │  │  • REST APIs    │  │  • Sessions     │ │ │
│  │  │  • TypeScript   │  │  • Role-based   │  │  • JWT Tokens   │ │ │
│  │  │  • Tailwind CSS │  │  • Prisma calls │  │  • 5 Roles      │ │ │
│  │  │  • Arabic RTL   │  │  • Validation   │  │  • bcrypt       │ │ │
│  │  │  • 5 Dashboards │  │  • Error handle │  │  • 30d expiry   │ │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘ │ │
│  │                                                                   │ │
│  │  ENVIRONMENT:                                                     │ │
│  │  • NODE_ENV=production                                           │ │
│  │  • NEXTAUTH_URL=https://your-domain.com                         │ │
│  │  • NEXTAUTH_SECRET=[64-char secret]                             │ │
│  │  • DATABASE_URL=postgresql://...                                │ │
│  └─────────────────────────┬─────────────────────────────────────────┘ │
│                            │                                             │
│                            │ Prisma Client                               │
│                            │ Connection Pool (10 connections)            │
│                            │                                             │
│  ┌─────────────────────────▼─────────────────────────────────────────┐ │
│  │                   POSTGRESQL 15 DATABASE                          │ │
│  │  ─────────────────────────────────────────────────────────────── │ │
│  │  Location: localhost:5432                                         │ │
│  │  Database: andrino_academy_prod                                   │ │
│  │  User: andrino_admin                                              │ │
│  │                                                                   │ │
│  │  TABLES (39 models):                                              │ │
│  │  • User, Account, Session (Auth)                                 │ │
│  │  • Grade, Track, LiveSession (Academic)                          │ │
│  │  • SessionAttendance (Coordination)                               │ │
│  │  • Course, Module, Lesson (Content)                              │ │
│  │  • Enrollment, Assignment, Exam (Learning)                        │ │
│  │  • Certificate, Payment, Invoice (Admin)                          │ │
│  │  • And 25 more...                                                 │ │
│  │                                                                   │ │
│  │  FEATURES:                                                        │ │
│  │  • Connection pooling (max 10)                                   │ │
│  │  • ACID compliance                                                │ │
│  │  • Indexes on frequently queried columns                         │ │
│  │  • Daily automated backups (2 AM)                                │ │
│  │  • Point-in-time recovery capability                             │ │
│  │                                                                   │ │
│  │  BACKUPS:                                                         │ │
│  │  • Location: /home/andrino/backups/database/                     │ │
│  │  • Format: andrino_YYYYMMDD_HHMMSS.sql.gz                       │ │
│  │  • Retention: 7 days                                             │ │
│  │  • Schedule: Daily at 2:00 AM (cron)                            │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL INTEGRATIONS                             │
├──────────────────────────────────────────────────────────────────────────┤
│  • Zoom (External Meeting Links)                                         │
│  • Google Meet (External Meeting Links)                                  │
│  • Microsoft Teams (External Meeting Links)                              │
│  • Email Service (Future - SMTP)                                         │
│  • Supabase (Optional - File Storage)                                    │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                         MONITORING & MAINTENANCE                          │
├──────────────────────────────────────────────────────────────────────────┤
│  • PM2 Monitoring (pm2 monit)                                            │
│  • Nginx Access/Error Logs                                               │
│  • PostgreSQL Query Logs                                                 │
│  • Application Error Tracking                                            │
│  • Disk Usage Monitoring (df -h)                                         │
│  • Memory Usage Monitoring (free -h)                                     │
│  • Daily Database Backups (automated)                                    │
│  • SSL Certificate Auto-renewal (Let's Encrypt)                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Example: Student Joins Live Session

```
1. Student clicks "Join Session" button
   ↓
2. Browser sends HTTPS request to https://andrino-academy.com/api/sessions/join
   ↓
3. Cloudflare (if enabled) routes to VPS IP
   ↓
4. UFW Firewall allows HTTPS (port 443)
   ↓
5. Nginx receives request
   ├─ Checks rate limit (not exceeded)
   ├─ Verifies SSL certificate
   ├─ Adds security headers
   └─ Proxies to localhost:3000
   ↓
6. PM2 routes to available Node instance (#1 or #2)
   ↓
7. Next.js API route handler (/api/sessions/join)
   ├─ NextAuth checks session validity
   ├─ Verifies user role (Student)
   └─ Calls Prisma to fetch session data
   ↓
8. Prisma Client
   ├─ Gets connection from pool
   ├─ Executes SQL query on PostgreSQL
   └─ Returns session data with externalLink
   ↓
9. API validates externalLink exists and is valid
   ↓
10. API returns response with external meeting URL
    ↓
11. Next.js frontend redirects to external platform
    ├─ Zoom: https://zoom.us/j/XXXXXXXXX
    ├─ Meet: https://meet.google.com/XXX-XXXX-XXX
    └─ Teams: https://teams.microsoft.com/l/meetup-join/...
    ↓
12. Student joins external live session
    ↓
13. Attendance recorded in database (SessionAttendance table)
```

---

## Resource Allocation (VPS 2 - 2GB RAM, 2 CPU)

```
┌────────────────────────────────────────┐
│         RAM Allocation (2GB)           │
├────────────────────────────────────────┤
│  System & OS         : 300MB  (15%)   │
│  PostgreSQL          : 400MB  (20%)   │
│  Node Instance #1    : 500MB  (25%)   │
│  Node Instance #2    : 500MB  (25%)   │
│  Nginx               : 50MB   (2.5%)  │
│  Other Services      : 150MB  (7.5%)  │
│  Free Buffer         : 100MB  (5%)    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│        CPU Allocation (2 Cores)        │
├────────────────────────────────────────┤
│  Node Instance #1    : Core 1 (50%)   │
│  Node Instance #2    : Core 2 (50%)   │
│  PostgreSQL          : Shared         │
│  Nginx               : Minimal        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      Disk Allocation (40GB SSD)        │
├────────────────────────────────────────┤
│  OS & System         : 5GB    (12.5%) │
│  Application Code    : 500MB  (1.25%) │
│  Node Modules        : 1GB    (2.5%)  │
│  PostgreSQL Database : 2GB    (5%)    │
│  Logs & Backups      : 3GB    (7.5%)  │
│  Free Space          : 28.5GB (71.25%)│
└────────────────────────────────────────┘
```

---

## Network Traffic Flow

```
Internet Traffic
       │
       ▼
   Cloudflare (Optional CDN)
   ├─ Cache HIT (static assets) → Direct response
   └─ Cache MISS → Forward to VPS
       │
       ▼
   VPS Firewall (UFW)
   ├─ Port 80 (HTTP) → Nginx
   ├─ Port 443 (HTTPS) → Nginx
   └─ Port 22 (SSH) → SSH Daemon
       │
       ▼
   Nginx (Port 443)
   ├─ Static files (/_next/static) → Cache & serve
   ├─ API calls (/api/*) → Proxy to PM2 (rate limited: 30 req/min)
   ├─ Auth calls (/api/auth/*) → Proxy to PM2 (rate limited: 5 req/min)
   └─ Pages (/*) → Proxy to PM2 (rate limited: 100 req/min)
       │
       ▼
   PM2 Load Balancer
   ├─ Round-robin to Instance #1 (localhost:3000)
   └─ Round-robin to Instance #2 (localhost:3000)
       │
       ▼
   Next.js Application
   ├─ SSR Pages → Render & return HTML
   ├─ API Routes → Process & query database
   └─ NextAuth → Validate session
       │
       ▼
   Prisma Client (Connection Pool)
       │
       ▼
   PostgreSQL Database
   └─ Execute query & return data
```

---

## Scaling Path (Future Growth)

```
CURRENT STATE (Launch):
VPS 2 → 2GB RAM, 2 CPU → 100-200 users → $7-12/month

GROWTH STAGE 1 (6 months):
VPS 4 → 4GB RAM, 4 CPU → 500-1000 users → $15-25/month
├─ Increase PM2 instances to 4
├─ Increase PostgreSQL connection pool to 20
└─ Add Cloudflare CDN

GROWTH STAGE 2 (12 months):
VPS 6 + Managed Database → 1000-2000 users → $30-50/month
├─ Separate database server (DigitalOcean Managed PostgreSQL)
├─ Redis caching layer
└─ Multiple VPS with load balancer

ENTERPRISE (24+ months):
Multi-region deployment → 5000+ users → $100-300/month
├─ Multiple VPS in different regions
├─ Database replication (primary + read replicas)
├─ Full CDN integration
├─ Advanced monitoring (DataDog, New Relic)
└─ Auto-scaling infrastructure
```

---

## Security Layers

```
Layer 1: Network (Cloudflare + UFW)
├─ DDoS protection
├─ Firewall rules (allow only 22, 80, 443)
└─ Fail2Ban (brute force protection)

Layer 2: Transport (SSL/TLS)
├─ Let's Encrypt certificate (TLS 1.2+)
├─ HSTS (Force HTTPS)
└─ Strong cipher suites

Layer 3: Application (Nginx + Next.js)
├─ Rate limiting (login: 5/min, API: 30/min)
├─ Security headers (CSP, X-Frame-Options, etc.)
├─ Input validation
└─ CSRF protection

Layer 4: Authentication (NextAuth.js)
├─ Bcrypt password hashing
├─ JWT session tokens
├─ 30-day session expiry
└─ 5-level role-based access control

Layer 5: Database (PostgreSQL)
├─ Prepared statements (SQL injection prevention)
├─ Row-level security (future)
├─ Encrypted backups
└─ Localhost-only connections

Layer 6: System (Ubuntu)
├─ Automatic security updates
├─ Non-root user deployment
├─ SSH key authentication only
└─ Root login disabled
```

---

This architecture provides:
✅ High availability (PM2 cluster mode)
✅ Scalability (horizontal scaling ready)
✅ Security (multi-layer protection)
✅ Performance (caching, compression, CDN-ready)
✅ Maintainability (automated backups, monitoring)
✅ Cost-effectiveness ($7-12/month starting cost)
