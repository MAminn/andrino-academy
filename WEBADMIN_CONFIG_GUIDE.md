# OpenLiteSpeed WebAdmin Configuration Guide

## Complete Setup for Andrino Academy Production Deployment

After running `deploy-ols-production.sh`, follow these exact steps in WebAdmin.

---

## 🔐 Access WebAdmin

URL: `https://88.223.94.192:7080`

Get admin password:

```bash
sudo cat /home/ubuntu/.litespeed_password
```

---

## 📋 Configuration Checklist

- [ ] Virtual Host Created
- [ ] External App Verified
- [ ] HTTP Listener Configured
- [ ] HTTPS Listener Configured
- [ ] SSL Certificate Installed
- [ ] Virtual Host Mappings Added
- [ ] Graceful Restart Completed
- [ ] Website Tested

---

## Step 1: Verify External App (Node.js Backend)

**Navigation:** Configuration > Server > External App

You should see `nodejs_backend` in the list. If not:

1. Click **Add** → Select **Web Server (Proxy)**
2. Fill in:
   ```
   Name: nodejs_backend
   Address: http://127.0.0.1:3000
   Max Connections: 500
   Connection Keepalive Timeout: 60
   Initial Request Timeout (secs): 60
   Retry Timeout (secs): 0
   Response Buffering: No
   ```
3. Click **Save**

---

## Step 2: Add Virtual Host

**Navigation:** Configuration > Virtual Hosts

### 2.1 Click **Add** Button

Fill in the form:

```
Virtual Host Name: andrinoacademy
Virtual Host Root: /usr/local/lsws/andrinoacademy
Config File: /usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf
Follow Symbolic Link: Yes
Enable Scripts/ExtApps: Yes
Restrained: No
Set UID Mode: Server
```

Click **Save**

### 2.2 Verify Configuration Loaded

Click on **andrinoacademy** virtual host name to open it.

You should see tabs: **General, Member, Log, Security, External App, Script Handler, Rewrite, Context, WebSocket Proxy, SSL**

If you see a warning: _"Config file does not exist"_ - this means the script didn't run correctly. Re-run the deployment script.

---

## Step 3: Configure HTTP Listener (Port 80)

**Navigation:** Configuration > Listeners

### 3.1 Check for Existing Listeners

Look for **Default** or any listener on port 80.

### 3.2 Add/Edit HTTP Listener

Click **Add** (or **View** if one exists, then **Edit**)

**General Settings:**

```
Listener Name: HTTP
IP Address: ANY IPv4
Port: 80
Binding: All available IPs
Secure: No
```

Click **Save**

### 3.3 Add Virtual Host Mapping

While viewing the **HTTP** listener, scroll down to **Virtual Host Mappings**

Click **Add**:

```
Virtual Host: andrinoacademy
Domains: andrinoacademy.com, www.andrinoacademy.com
```

Click **Save**

---

## Step 4: Configure HTTPS Listener (Port 443)

**Navigation:** Configuration > Listeners

### 4.1 Add HTTPS Listener

Click **Add**

**General Settings:**

```
Listener Name: HTTPS
IP Address: ANY IPv4
Port: 443
Secure: Yes
```

Click **Save**

### 4.2 Configure SSL Certificate

Click on **HTTPS** listener → **SSL** tab

Click **Edit** button

**SSL Private Key & Certificate:**

```
Private Key File: /etc/letsencrypt/live/andrinoacademy.com/privkey.pem
Certificate File: /etc/letsencrypt/live/andrinoacademy.com/fullchain.pem
Chained Certificate: Yes
```

**SSL Protocol:**

```
Protocol Version: TLSv1.2, TLSv1.3
```

Click **Save**

### 4.3 Add Virtual Host Mapping

Scroll down to **Virtual Host Mappings**

Click **Add**:

```
Virtual Host: andrinoacademy
Domains: andrinoacademy.com, www.andrinoacademy.com
```

Click **Save**

---

## Step 5: Optional SSL at Virtual Host Level (SNI)

**Navigation:** Configuration > Virtual Hosts > andrinoacademy > SSL

This overrides listener SSL for this specific domain (useful if hosting multiple sites)

Click **Edit**

```
Private Key File: /etc/letsencrypt/live/andrinoacademy.com/privkey.pem
Certificate File: /etc/letsencrypt/live/andrinoacademy.com/fullchain.pem
Chained Certificate: Yes
```

Click **Save**

---

## Step 6: Performance Optimization

### 6.1 Enable Caching (Optional)

**Navigation:** Configuration > Server > Modules

Find **cache** module and enable it.

**Navigation:** Configuration > Virtual Hosts > andrinoacademy > Cache

```
Enable Public Cache: Yes
Cache Storage Path: /tmp/lshttpdcache
Cache Expire Time (seconds): 3600
Cache Max Object Size (bytes): 10000000
```

### 6.2 Enable Compression

**Navigation:** Configuration > Server > Tuning

```
GZIP Compression: Yes
Enable Compression: Yes
Compression Level: 6
```

---

## Step 7: Graceful Restart

At the top-right of WebAdmin:

**Actions** → **Graceful Restart**

Or click the rotating arrow icon.

Wait 5-10 seconds for restart to complete.

---

## Step 8: Verification & Testing

### Test Commands (Run in SSH)

```bash
# Test Node.js directly
curl -I http://localhost:3000

# Test OpenLiteSpeed HTTP
curl -I http://88.223.94.192

# Test with domain
curl -I https://andrinoacademy.com

# Check if it returns your app (not "Hello World")
curl https://andrinoacademy.com | grep -i "andrino"

# Check SSL
curl -vI https://andrinoacademy.com 2>&1 | grep -i "ssl"
```

### Check Logs

```bash
# OpenLiteSpeed main error log
sudo tail -f /usr/local/lsws/logs/error.log

# Virtual host error log
sudo tail -f /usr/local/lsws/andrinoacademy/logs/error.log

# Virtual host access log
sudo tail -f /usr/local/lsws/andrinoacademy/logs/access.log

# PM2 logs
sudo -u ubuntu pm2 logs andrino-academy
```

---

## 🚨 Troubleshooting

### Issue: Still seeing "Hello World" page

**Solution:**

1. Check PM2 is running: `sudo -u ubuntu pm2 status`
2. Test Node.js: `curl http://localhost:3000`
3. Check external app name matches in vhconf.conf
4. Verify context is set to proxy type with handler `nodejs_backend`
5. Check WebAdmin: Virtual Hosts > andrinoacademy > Context
6. Graceful restart

### Issue: 503 Service Unavailable

**Solution:**

1. Node.js app not running: `sudo -u ubuntu pm2 restart andrino-academy`
2. Check port 3000: `sudo lsof -i :3000`
3. Check error logs: `sudo tail -f /usr/local/lsws/logs/error.log`

### Issue: SSL Certificate Error

**Solution:**

1. Verify certificate files exist:
   ```bash
   sudo ls -la /etc/letsencrypt/live/andrinoacademy.com/
   ```
2. Check permissions:
   ```bash
   sudo chmod 644 /etc/letsencrypt/live/andrinoacademy.com/*.pem
   ```
3. Restart OpenLiteSpeed: `sudo /usr/local/lsws/bin/lswsctrl restart`

### Issue: Virtual Host Config Not Loading

**Solution:**

1. Check file exists:
   ```bash
   cat /usr/local/lsws/conf/vhosts/andrinoacademy/vhconf.conf
   ```
2. Check permissions:
   ```bash
   sudo chown -R lsadm:lsadm /usr/local/lsws/conf/vhosts/andrinoacademy/
   ```
3. Check syntax - look for typos or missing brackets

### Issue: Static Files (CSS/JS) Not Loading

**Solution:**

1. Check Next.js build exists: `ls -la /home/ubuntu/apps/andrino-academy/.next/`
2. Verify symbolic link: `ls -la /usr/local/lsws/andrinoacademy/html/_next`
3. Check context for `/_next/static/` in WebAdmin
4. Clear browser cache and test in incognito

---

## 🔄 Auto-Renewal for SSL

Setup cron for automatic SSL renewal:

```bash
# Edit crontab
sudo crontab -e

# Add this line (renew at 2am daily, restart OLS if renewed)
0 2 * * * certbot renew --quiet --deploy-hook "/usr/local/lsws/bin/lswsctrl restart"
```

---

## 📊 Monitoring Setup

### Setup PM2 Monitoring

```bash
# View real-time monitoring
sudo -u ubuntu pm2 monit

# Save current PM2 config
sudo -u ubuntu pm2 save

# Setup PM2 to start on reboot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### Monitor OpenLiteSpeed

Access real-time stats in WebAdmin:
**Actions** → **Real-Time Stats**

---

## ✅ Post-Deployment Checklist

- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid (check at ssllabs.com)
- [ ] All pages load correctly
- [ ] Static assets (CSS/JS/images) load
- [ ] API routes work
- [ ] Database connections successful
- [ ] PM2 auto-starts on reboot
- [ ] OpenLiteSpeed auto-starts on reboot
- [ ] Logs are rotating properly
- [ ] Firewall configured correctly
- [ ] DNS points to correct IP

---

## 🎯 Final Production Checks

1. **Test from different locations**: Use online tools like GTmetrix, Pingdom
2. **Test mobile responsiveness**: Check on actual devices
3. **Load testing**: Use Apache Bench or similar: `ab -n 1000 -c 100 https://andrinoacademy.com/`
4. **Security scan**: Use SSL Labs, Security Headers checker
5. **Performance**: Google PageSpeed Insights

---

**Your Andrino Academy is now production-ready!** 🚀
