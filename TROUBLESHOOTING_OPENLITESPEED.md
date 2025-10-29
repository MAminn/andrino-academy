# OpenLiteSpeed Troubleshooting Guide

## Current Issue: "Hello World" Page Instead of Andrino Academy

Your Node.js app is running correctly on port 3000, but OpenLiteSpeed is showing the default page. This means the virtual host configuration exists but isn't activated.

## DNS Configuration

### Check Current DNS
1. **From your VPS:**
   ```bash
   nslookup andrinoacademy.com
   dig andrinoacademy.com +short
   ```

2. **Check DNS from your local machine:**
   - Go to https://dnschecker.org
   - Enter: andrinoacademy.com
   - Should show IP: 88.223.94.192

### Configure DNS (If Not Set Up)

If DNS isn't configured, you need to add A records in your domain registrar:

**Required DNS Records:**
```
Type: A
Name: @
Value: 88.223.94.192
TTL: 3600

Type: A
Name: www
Value: 88.223.94.192
TTL: 3600
```

**Common Registrars:**
- **Namecheap**: Advanced DNS → Add New Record
- **GoDaddy**: DNS Management → Add Record
- **Cloudflare**: DNS → Add Record
- **Google Domains**: DNS → Resource Records

**Propagation Time:** 5-60 minutes (can take up to 48 hours globally)

## Diagnostic Commands (Run These First)

### 1. Check Virtual Host Configuration File
```bash
sudo cat /usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf
```

**Expected Output:**
```
docRoot                   $VH_ROOT/html
vhDomain                  andrinoacademy.com, www.andrinoacademy.com
vhAliases                 
enableGzip                1

errorlog $VH_ROOT/logs/error.log {
  useServer               1
  logLevel                DEBUG
  rollingSize             10M
}

accesslog $VH_ROOT/logs/access.log {
  useServer               0
  logFormat               
  logHeaders              5
  rollingSize             10M
  keepDays                30
  compressArchive         1
}

context / {
  type                    proxy
  handler                 nodejs_backend
  addDefaultCharset       off
}

rewrite {
  enable                  1
  autoLoadHtaccess        1
}
```

### 2. Check Main Server Configuration
```bash
sudo grep -A 10 "extprocessor nodejs_backend" /usr/local/lsws/conf/httpd_config.conf
```

**Expected Output:**
```
extprocessor nodejs_backend {
  type                    proxy
  address                 http://127.0.0.1:3000
  maxConns                500
  env                     NODE_ENV=production
  initTimeout             60
  retryTimeout            0
  respBuffer              0
}
```

### 3. Check Virtual Host Files Structure
```bash
ls -la /usr/local/lsws/andrinoacademy/
ls -la /usr/local/lsws/andrinoacademy/html/
```

**Expected:**
```
drwxr-xr-x andrino andrino andrinoacademy/
drwxr-xr-x andrino andrino html/
lrwxrwxrwx andrino andrino _next -> /home/andrino/apps/andrino-academy/.next/static
lrwxrwxrwx andrino andrino public -> /home/andrino/apps/andrino-academy/public
-rw-r--r-- andrino andrino .htaccess
```

### 4. Check OpenLiteSpeed Listeners
```bash
sudo cat /usr/local/lsws/conf/httpd_config.conf | grep -A 30 "listener Default"
```

### 5. Verify PM2 Status
```bash
sudo -u andrino pm2 list
sudo -u andrino pm2 logs andrino-academy --lines 50
curl http://localhost:3000
```

## Solution Steps

### Step 1: Verify Virtual Host in WebAdmin

1. **Login to WebAdmin:**
   ```
   https://88.223.94.192:7080
   Username: admin
   Password: (run command below to get it)
   ```
   ```bash
   sudo cat /home/andrino/.litespeed_password
   ```

2. **Check Virtual Hosts:**
   - Go to: **Configuration → Virtual Hosts**
   - Look for: **andrinoacademy**
   
   **If NOT listed:**
   - Click **Add** button
   - Fill in:
     - **Virtual Host Name:** `andrinoacademy`
     - **Virtual Host Root:** `/usr/local/lsws/andrinoacademy`
     - **Config File:** `/usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf`
     - **Follow Symbolic Link:** `Yes`
     - **Enable Scripts/ExtApps:** `Yes`
     - **Restrained:** `No`
   - Click **Save**

3. **Verify External App:**
   - Go to: **Configuration → Server → External App**
   - Look for: **nodejs_backend**
   - Should show:
     - Type: `Proxy`
     - Address: `http://127.0.0.1:3000`
     - Max Connections: `500`
   
   **If NOT listed:**
   - Click **Add**
   - Type: `Web Server`
   - Name: `nodejs_backend`
   - Address: `http://127.0.0.1:3000`
   - Max Connections: `500`
   - Environment: `NODE_ENV=production`
   - Click **Save**

### Step 2: Configure Listener Mapping

1. **Go to Listeners:**
   - **Configuration → Listeners**

2. **HTTP Listener (Port 80):**
   - Click on **Default** (or the HTTP listener)
   - Go to **Virtual Host Mappings** tab
   - Click **Add**
   
   **Fill in:**
   - **Virtual Host:** `andrinoacademy`
   - **Domains:** `andrinoacademy.com, www.andrinoacademy.com`
   
   - Click **Save**

3. **Set as Default (Optional but Recommended):**
   - In the same listener settings
   - **Default Virtual Host:** Select `andrinoacademy`

### Step 3: Restart OpenLiteSpeed

```bash
# Graceful restart (preferred)
sudo /usr/local/lsws/bin/lswsctrl restart

# OR full restart if graceful doesn't work
sudo systemctl restart lsws
```

### Step 4: Test

```bash
# Test from VPS
curl -H "Host: andrinoacademy.com" http://localhost

# Test from VPS with domain (if DNS configured)
curl http://andrinoacademy.com

# Check access logs
sudo tail -f /usr/local/lsws/andrinoacademy/logs/access.log

# Check error logs
sudo tail -f /usr/local/lsws/andrinoacademy/logs/error.log
sudo tail -f /usr/local/lsws/logs/error.log
```

## Common Issues and Fixes

### Issue 1: Permission Denied on Config File

**Symptoms:** Can't read vhconf.conf

**Fix:**
```bash
sudo chmod 644 /usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf
sudo chown lsadm:lsadm /usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf
```

### Issue 2: Virtual Host Logs Directory Missing

**Fix:**
```bash
sudo mkdir -p /usr/local/lsws/andrinoacademy/logs
sudo chown andrino:andrino /usr/local/lsws/andrinoacademy/logs
sudo chmod 755 /usr/local/lsws/andrinoacademy/logs
```

### Issue 3: Symbolic Links Not Working

**Fix:**
```bash
# Remove old links
rm -f /usr/local/lsws/andrinoacademy/html/_next
rm -f /usr/local/lsws/andrinoacademy/html/public

# Recreate links
ln -sf /home/andrino/apps/andrino-academy/.next/static /usr/local/lsws/andrinoacademy/html/_next
ln -sf /home/andrino/apps/andrino-academy/public /usr/local/lsws/andrinoacademy/html/public

# Verify
ls -la /usr/local/lsws/andrinoacademy/html/
```

### Issue 4: Node.js App Not Accessible

**Fix:**
```bash
# Check PM2 status
sudo -u andrino pm2 list
sudo -u andrino pm2 logs andrino-academy --lines 50

# If not running, restart
cd /home/andrino/apps/andrino-academy
sudo -u andrino pm2 restart andrino-academy

# Test Node.js directly
curl http://localhost:3000
```

### Issue 5: OpenLiteSpeed Not Starting

**Fix:**
```bash
# Check OpenLiteSpeed status
sudo systemctl status lsws

# Check for configuration errors
sudo /usr/local/lsws/bin/lswsctrl configtest

# View OpenLiteSpeed logs
sudo tail -100 /usr/local/lsws/logs/error.log

# Start OpenLiteSpeed
sudo systemctl start lsws
```

## Alternative: Manual Configuration File Edit

If WebAdmin doesn't work, you can edit the main config directly:

```bash
# Backup current config
sudo cp /usr/local/lsws/conf/httpd_config.conf /usr/local/lsws/conf/httpd_config.conf.backup

# Edit the config
sudo nano /usr/local/lsws/conf/httpd_config.conf
```

**Add this BEFORE the closing `}` of the first listener block:**

```xml
listener Default {
  address                 *:80
  secure                  0
  
  # Add these lines
  vhostMap                andrinoacademy andrinoacademy.com, www.andrinoacademy.com
  
  # Rest of config...
}
```

**Save and restart:**
```bash
sudo /usr/local/lsws/bin/lswsctrl restart
```

## Verify Everything Works

### Checklist:
- [ ] PM2 shows andrino-academy as `online`
- [ ] `curl http://localhost:3000` returns HTML (not Hello World)
- [ ] Virtual Host `andrinoacademy` listed in WebAdmin
- [ ] External App `nodejs_backend` exists in WebAdmin
- [ ] Listener has mapping: `andrinoacademy.com → andrinoacademy`
- [ ] `curl -H "Host: andrinoacademy.com" http://localhost` returns Andrino Academy HTML
- [ ] DNS configured (if accessing via domain name)
- [ ] `curl http://andrinoacademy.com` returns Andrino Academy (after DNS propagation)

## DNS Verification

### Test DNS Resolution
```bash
# From VPS
nslookup andrinoacademy.com
dig andrinoacademy.com +short

# Should return: 88.223.94.192
```

### If DNS Not Propagated Yet
You can test using `/etc/hosts` file:

```bash
# On your local machine (temporary testing)
# Edit hosts file:
# Windows: C:\Windows\System32\drivers\etc\hosts
# Linux/Mac: /etc/hosts

# Add this line:
88.223.94.192 andrinoacademy.com www.andrinoacademy.com

# Save and test in browser:
# http://andrinoacademy.com
```

## Next Steps After Site Works

1. **Install SSL Certificate:**
   ```bash
   sudo apt install certbot -y
   sudo systemctl stop lsws
   sudo certbot certonly --standalone -d andrinoacademy.com -d www.andrinoacademy.com
   sudo systemctl start lsws
   ```

2. **Configure HTTPS Listener in WebAdmin:**
   - Configuration → Listeners → HTTPS (443)
   - SSL → Private Key File: `/etc/letsencrypt/live/andrinoacademy.com/privkey.pem`
   - SSL → Certificate File: `/etc/letsencrypt/live/andrinoacademy.com/fullchain.pem`
   - Add same Virtual Host Mapping as HTTP listener
   - Save and Graceful Restart

3. **Set up SSL auto-renewal:**
   ```bash
   sudo crontab -e
   # Add:
   0 2 * * * certbot renew --quiet --deploy-hook "/usr/local/lsws/bin/lswsctrl restart"
   ```

## Support Commands

If you need to share diagnostic info:

```bash
# Collect all relevant info
echo "=== PM2 Status ===" && \
sudo -u andrino pm2 list && \
echo -e "\n=== Node.js Test ===" && \
curl -s http://localhost:3000 | head -20 && \
echo -e "\n=== DNS Resolution ===" && \
nslookup andrinoacademy.com && \
echo -e "\n=== Virtual Host Config ===" && \
sudo cat /usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf && \
echo -e "\n=== OpenLiteSpeed Status ===" && \
sudo systemctl status lsws && \
echo -e "\n=== OpenLiteSpeed Error Log (last 20 lines) ===" && \
sudo tail -20 /usr/local/lsws/logs/error.log
```

---

**Most Likely Cause:** Virtual host exists in files but not activated in WebAdmin listener mappings. Follow Step 1 and Step 2 above to add the virtual host and configure listener mappings.
