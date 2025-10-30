# HTTPS Configuration Guide - Andrino Academy

## Overview

This guide covers converting your Andrino Academy application from HTTP to HTTPS to eliminate "Not Secure" browser warnings.

## Prerequisites

✅ SSL/TLS certificate installed (Let's Encrypt or other)
✅ OpenLiteSpeed configured
✅ Domain DNS pointing to your server

## Quick Fix: Update to HTTPS

### Option 1: Automated Script (Recommended)

Run this on your VPS:

```bash
cd /home/andrino/apps/andrino-academy
wget https://raw.githubusercontent.com/MAminn/andrino-academy/main/update-to-https.sh
chmod +x update-to-https.sh
sudo bash update-to-https.sh
```

### Option 2: Manual Configuration

#### Step 1: Update Environment Variables

Edit `.env` file on your VPS:

```bash
cd /home/andrino/apps/andrino-academy
nano .env
```

Update these values:

```env
# Change from HTTP to HTTPS
NEXTAUTH_URL="https://andrinoacademy.com"

# Ensure these are set
NODE_ENV="production"
DATABASE_URL="postgresql://andrino_admin:Andrino2024!@localhost:5432/andrino_academy_prod?schema=public"
```

#### Step 2: Configure OpenLiteSpeed HTTPS Listener

1. **Login to WebAdmin:**

   ```
   https://YOUR_SERVER_IP:7080
   ```

2. **Configure HTTPS Listener (Port 443):**

   - Go to: **Configuration → Listeners**
   - Click on **HTTPS** listener (or add new if doesn't exist)

   **General Tab:**

   - Listener Name: `HTTPS` or `SSL`
   - IP Address: `ANY` or `*`
   - Port: `443`
   - Secure: `Yes`
   - Binding: `*:443`

   **SSL Tab:**

   - **Private Key File:** `/etc/letsencrypt/live/andrinoacademy.com/privkey.pem`
   - **Certificate File:** `/etc/letsencrypt/live/andrinoacademy.com/fullchain.pem`
   - **Chained Certificate:** `Yes`
   - **CA Certificate Path:** (leave empty for Let's Encrypt)
   - **CA Certificate File:** (leave empty for Let's Encrypt)

   **Virtual Host Mappings Tab:**

   - Click **Add**
   - **Virtual Host:** `andrinoacademy`
   - **Domains:** `andrinoacademy.com, www.andrinoacademy.com`
   - Click **Save**

3. **Graceful Restart:**
   - Click **Actions → Graceful Restart**

#### Step 3: Configure HTTP to HTTPS Redirect

In OpenLiteSpeed WebAdmin:

1. **Go to Virtual Host Configuration:**

   - Configuration → Virtual Hosts → andrinoacademy → Rewrite

2. **Enable Rewrite:**

   - Enable Rewrite: `Yes`
   - Auto Load from .htaccess: `Yes`

3. **Add Rewrite Rules:**

   Click **Edit** on Rewrite Rules and add:

   ```
   RewriteCond %{HTTPS} !=on
   RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
   ```

   Or update your `.htaccess` file at `/usr/local/lsws/andrinoacademy/html/.htaccess`:

   ```bash
   sudo nano /usr/local/lsws/andrinoacademy/html/.htaccess
   ```

   Add at the top:

   ```apache
   # Force HTTPS
   RewriteEngine On
   RewriteCond %{HTTPS} !=on
   RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]

   # Proxy to Node.js
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
   ```

#### Step 4: Restart Services

```bash
# Restart PM2 with updated environment
cd /home/andrino/apps/andrino-academy
sudo -u andrino pm2 restart andrino-academy --update-env
sudo -u andrino pm2 save

# Restart OpenLiteSpeed
sudo /usr/local/lsws/bin/lswsctrl restart
```

## Verification

### Test HTTPS Configuration

```bash
# Test HTTPS connection
curl -I https://andrinoacademy.com

# Should return:
# HTTP/2 200
# Content-Type: text/html

# Test HTTP redirect
curl -I http://andrinoacademy.com

# Should return:
# HTTP/1.1 301 Moved Permanently
# Location: https://andrinoacademy.com/
```

### Check SSL Certificate

```bash
# Check certificate expiry
sudo certbot certificates

# Check SSL handshake
openssl s_client -connect andrinoacademy.com:443 -servername andrinoacademy.com
```

### Browser Testing

1. **Open:** `https://andrinoacademy.com`
2. **Check:** Green padlock in address bar
3. **Verify:** No "Not Secure" warnings
4. **Test:** All pages load without mixed content warnings

## SSL Certificate Management

### Install/Renew SSL Certificate

```bash
# Stop OpenLiteSpeed temporarily
sudo systemctl stop lsws

# Get or renew certificate
sudo certbot certonly --standalone \
  -d andrinoacademy.com \
  -d www.andrinoacademy.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# Start OpenLiteSpeed
sudo systemctl start lsws
```

### Auto-Renewal Setup

```bash
# Edit root crontab
sudo crontab -e

# Add this line for automatic renewal at 2 AM daily
0 2 * * * certbot renew --quiet --deploy-hook "/usr/local/lsws/bin/lswsctrl restart"
```

## Troubleshooting

### Issue 1: "Not Secure" Warning Still Appears

**Causes:**

- Mixed content (HTTP resources on HTTPS page)
- Invalid SSL certificate
- Certificate not trusted

**Solutions:**

```bash
# Check for mixed content in logs
sudo -u andrino pm2 logs andrino-academy | grep -i "mixed"

# Verify all internal URLs use HTTPS
grep -r "http://" /home/andrino/apps/andrino-academy/src --exclude-dir=node_modules

# Check SSL certificate validity
curl -vI https://andrinoacademy.com 2>&1 | grep -i "SSL\|certificate"
```

### Issue 2: Certificate Not Found

**Error:** `SSL_CTX_use_PrivateKey_file: can't open file`

**Solution:**

```bash
# Check if certificates exist
sudo ls -la /etc/letsencrypt/live/andrinoacademy.com/

# Fix permissions
sudo chown -R lsadm:lsadm /etc/letsencrypt/live/andrinoacademy.com/
sudo chmod 644 /etc/letsencrypt/live/andrinoacademy.com/*.pem
```

### Issue 3: Mixed Content Warnings

**Symptoms:** Some resources load over HTTP

**Solution:**

Update Next.js configuration to enforce HTTPS:

```bash
nano /home/andrino/apps/andrino-academy/next.config.js
```

Add:

```javascript
module.exports = {
  // ... existing config

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};
```

### Issue 4: Redirect Loop

**Symptoms:** Page keeps redirecting

**Solution:**

Check OpenLiteSpeed configuration:

```bash
# View virtual host config
sudo cat /usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf

# Ensure context is set to proxy, not redirect
# Should have:
# context / {
#   type                    proxy
#   handler                 nodejs_backend
# }
```

### Issue 5: NEXTAUTH_URL Not Updating

**Solution:**

```bash
# Restart PM2 with environment update
cd /home/andrino/apps/andrino-academy
sudo -u andrino pm2 restart andrino-academy --update-env

# Verify environment
sudo -u andrino pm2 env andrino-academy | grep NEXTAUTH_URL

# Should show: NEXTAUTH_URL=https://andrinoacademy.com
```

## Security Headers Configuration

Add these headers in OpenLiteSpeed for enhanced security:

**WebAdmin → Virtual Hosts → andrinoacademy → Context → Header Operations**

Add these headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Performance Optimization

### Enable HTTP/2

In OpenLiteSpeed WebAdmin:

- Configuration → Server → General → HTTP/2: `Enabled`

### Enable GZIP Compression

In Virtual Host configuration:

- Configuration → Virtual Hosts → andrinoacademy → General → Enable GZIP: `Yes`

### Cache Control

Add to `.htaccess`:

```apache
# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

## Checklist

After configuration, verify:

- [ ] `https://andrinoacademy.com` loads correctly
- [ ] Green padlock visible in browser
- [ ] `http://andrinoacademy.com` redirects to HTTPS
- [ ] No "Not Secure" warnings
- [ ] No mixed content warnings in browser console
- [ ] SSL certificate valid and trusted
- [ ] All login/authentication works over HTTPS
- [ ] API requests use HTTPS
- [ ] WebSocket connections (if any) use WSS
- [ ] Auto-renewal cron job configured

## Additional Resources

- **SSL Test:** https://www.ssllabs.com/ssltest/analyze.html?d=andrinoacademy.com
- **Security Headers:** https://securityheaders.com/?q=andrinoacademy.com
- **Mixed Content:** Open browser DevTools → Console → Look for mixed content warnings

## Support Commands

```bash
# Check OpenLiteSpeed SSL configuration
sudo /usr/local/lsws/bin/lswsctrl configtest

# View SSL error logs
sudo tail -100 /usr/local/lsws/logs/error.log | grep -i ssl

# Test HTTPS locally
curl -k https://localhost | head -20

# Check PM2 environment
sudo -u andrino pm2 env andrino-academy

# View PM2 logs
sudo -u andrino pm2 logs andrino-academy --lines 50
```

---

**Need Help?** Check the troubleshooting section or contact support.
