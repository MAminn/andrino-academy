# 🚀 Fast-Track Deployment - Andrino Academy

## Skip the Slow Parts, Get Running in 15 Minutes

Since `apt upgrade` is taking forever, let's skip it and get your app running first. Security updates can come later.

---

## Step 1: Essential Packages Only (2 minutes)

```bash
# Skip full upgrade, install only essentials
apt update

# Install Node.js 20.x (fastest method)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install essential packages only
apt install -y git nginx postgresql postgresql-contrib build-essential

# Verify installations
node --version
npm --version
```

---

## Step 2: Database Setup (3 minutes)

```bash
# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE andrino_academy_prod;
CREATE USER andrino_admin WITH ENCRYPTED PASSWORD 'Andrino2024!';
GRANT ALL PRIVILEGES ON DATABASE andrino_academy_prod TO andrino_admin;
\c andrino_academy_prod
GRANT ALL ON SCHEMA public TO andrino_admin;
ALTER DATABASE andrino_academy_prod OWNER TO andrino_admin;
\q
EOF

# Test connection
psql -U andrino_admin -d andrino_academy_prod -h localhost -c "SELECT version();"
```

---

## Step 3: Clone and Configure App (3 minutes)

```bash
# Create user and switch
useradd -m -s /bin/bash andrino
usermod -aG sudo andrino
su - andrino

# Clone repository
git clone https://github.com/MAminn/andrino-academy.git
cd andrino-academy

# Create production environment
cat > .env << EOF
DATABASE_URL="postgresql://andrino_admin:Andrino2024!@localhost:5432/andrino_academy_prod?schema=public"
NEXTAUTH_URL="http://88.223.94.192:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 64)"
NODE_ENV="production"
EOF
```

---

## Step 4: Update Schema for PostgreSQL (2 minutes)

```bash
# Backup original schema
cp prisma/schema.prisma prisma/schema.prisma.backup

# Update for PostgreSQL
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
sed -i 's/url      = "file:.*"/url      = env("DATABASE_URL")/' prisma/schema.prisma
sed -i 's/@default(cuid())/@default(uuid())/g' prisma/schema.prisma

# Verify changes
grep -A 5 "datasource db" prisma/schema.prisma
```

---

## Step 5: Build and Deploy (5 minutes)

```bash
# Install dependencies
npm ci

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
npx prisma db seed

# Build application (with Windows fix)
export USERPROFILE="/home/andrino/andrino-academy/.temp"
export APPDATA="/home/andrino/andrino-academy/.temp/AppData"
export LOCALAPPDATA="/home/andrino/andrino-academy/.temp/LocalAppData"
mkdir -p .temp/AppData .temp/LocalAppData

npm run build

# Install PM2 and start app
sudo npm install -g pm2
pm2 start npm --name "andrino-academy" -- start
pm2 save
pm2 startup systemd
```

---

## Step 6: Quick Nginx Setup (2 minutes)

```bash
# Create simple Nginx config
sudo tee /etc/nginx/sites-available/andrino-academy << EOF
server {
    listen 80;
    server_name 88.223.94.192;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/andrino-academy /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and start Nginx
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 🎯 Test Your Deployment

```bash
# Check all services
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql

# Test application
curl -I http://88.223.94.192
```

**Visit**: http://88.223.94.192

**Login with**:
- Email: `ceo@andrino-academy.com`
- Password: `Andrino2024!`

---

## Security Hardening (Do Later)

```bash
# Basic firewall (quick)
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# Full system update (run during maintenance)
nohup apt upgrade -y > /tmp/upgrade.log 2>&1 &
```

---

**Total Time**: ~15 minutes to get running!
**Security updates**: Can be done later during maintenance window