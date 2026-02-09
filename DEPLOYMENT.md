# Packlite Deployment & Operations Guide

This guide covers deploying Packlite to various environments, with detailed instructions for VPS deployment and overview of alternative options.

## Table of Contents

- [Prerequisites](#prerequisites)
- [VPS Deployment (Detailed)](#vps-deployment-detailed)
- [Vercel Deployment (Quick)](#vercel-deployment-quick)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Security Considerations](#security-considerations)
- [Monitoring & Logging](#monitoring--logging)
- [Maintenance & Updates](#maintenance--updates)
- [Backup Strategies](#backup-strategies)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### General Requirements

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: v5.0 or higher
- **SSL Certificate**: Required for production (Let's Encrypt recommended)
- **Domain Name**: For production deployment

### For VPS Deployment

- Ubuntu 22.04 LTS or Debian 11+ (recommended)
- Minimum 2GB RAM, 2 CPU cores, 20GB storage
- Root or sudo access
- Static IP address

---

## VPS Deployment (Detailed)

This section provides step-by-step instructions for deploying Packlite on a VPS (Ubuntu/Debian).

### Step 1: Initial Server Setup

#### 1.1 Update System

```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.2 Create Application User

```bash
# Create a dedicated user for the application
sudo adduser --system --group --shell /bin/bash packlite

# Add to sudo group if needed for maintenance
sudo usermod -aG sudo packlite
```

#### 1.3 Configure Firewall

```bash
# Install UFW if not present
sudo apt install ufw -y

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

### Step 2: Install Node.js

```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 3: Install MongoDB

#### Option A: Install MongoDB Locally

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod

# Secure MongoDB
sudo mongo
```

In MongoDB shell:

```javascript
use admin
db.createUser({
  user: "packlite_admin",
  pwd: "STRONG_PASSWORD_HERE",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})
exit
```

Enable authentication in `/etc/mongod.conf`:

```yaml
security:
  authorization: enabled
```

Restart MongoDB:

```bash
sudo systemctl restart mongod
```

#### Option B: Use MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Set up database user and whitelist your VPS IP
4. Get connection string for later use

### Step 4: Install Application

```bash
# Switch to packlite user
sudo su - packlite

# Clone repository
cd ~
git clone <your-repository-url> packlite
cd packlite

# Install dependencies
npm ci --production

# Build application
npm run build
```

### Step 5: Configure Environment Variables

```bash
# Create production environment file
nano .env.production

# Add the following (adjust values):
```

```env
# MongoDB Configuration
DATABASE_URL=mongodb://packlite_admin:YOUR_PASSWORD@localhost:27017/packlite?authSource=admin

# NextAuth.js
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Public URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# AWS S3 (if using image uploads)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=packlite-gear-images
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

Set proper permissions:

```bash
chmod 600 .env.production
```

### Step 6: Initialize Database

```bash
# Run database initialization
NODE_ENV=production npm run db:init

# Optional: Seed with demo data for testing
NODE_ENV=production npm run db:seed
```

### Step 7: Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add the following configuration:

```javascript
module.exports = {
  apps: [
    {
      name: 'packlite',
      script: 'npm',
      args: 'start',
      cwd: '/home/packlite/packlite',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: '.env.production',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
    },
  ],
}
```

Start the application:

```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Follow the command it outputs (likely needs sudo)

# Monitor application
pm2 status
pm2 logs packlite
pm2 monit
```

### Step 8: Install and Configure Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/packlite
```

Add the following configuration:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=50r/s;

# Upstream
upstream packlite_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Max upload size (for gear images)
    client_max_body_size 10M;

    # Proxy to Next.js
    location / {
        limit_req zone=general_limit burst=20 nodelay;

        proxy_pass http://packlite_backend;
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

    # Rate limit API routes
    location /api/ {
        limit_req zone=api_limit burst=5 nodelay;

        proxy_pass http://packlite_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location /_next/static/ {
        proxy_pass http://packlite_backend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Logs
    access_log /var/log/nginx/packlite-access.log;
    error_log /var/log/nginx/packlite-error.log;
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/packlite /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 9: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS

# Test auto-renewal
sudo certbot renew --dry-run

# Certbot will automatically renew certificates
```

### Step 10: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check application logs
pm2 logs packlite --lines 100

# Test the application
curl -I https://yourdomain.com
```

Visit your domain in a browser to confirm the application is running.

### Step 11: Set Up Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/packlite
```

Add:

```
/home/packlite/packlite/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 packlite packlite
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## Vercel Deployment (Quick)

Vercel is the recommended platform for quick, hassle-free deployment.

### Prerequisites

- Vercel account ([sign up](https://vercel.com/signup))
- GitHub/GitLab/Bitbucket repository
- MongoDB Atlas database (Vercel doesn't include database)

### Steps

1. **Prepare MongoDB Atlas**
   - Create a MongoDB Atlas account and cluster
   - Whitelist all IPs (0.0.0.0/0) for Vercel functions
   - Get your connection string

2. **Deploy to Vercel**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login
   vercel login

   # Deploy
   vercel
   ```

   Or use the Vercel Dashboard:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Configure project settings

3. **Configure Environment Variables**

   In Vercel Dashboard → Project Settings → Environment Variables, add:
   - `DATABASE_URL`: Your MongoDB Atlas connection string
   - `NEXTAUTH_URL`: Your Vercel deployment URL
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL
   - AWS credentials (if using S3)

4. **Initialize Database**

   After first deployment, initialize the database locally:

   ```bash
   # Set environment variables locally
   export DATABASE_URL="your-mongodb-atlas-url"

   # Initialize database
   npm run db:init
   ```

5. **Deploy**

   ```bash
   # Production deployment
   vercel --prod
   ```

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` environment variables

---

## Docker Deployment

Deploy the entire stack using Docker Compose.

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Steps

1. **Update docker-compose.yml for Production**

   ```yaml
   version: '3.8'

   services:
     mongodb:
       image: mongo:7.0
       container_name: packlite-mongodb
       restart: always
       environment:
         MONGO_INITDB_ROOT_USERNAME: packlite_admin
         MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
         MONGO_INITDB_DATABASE: packlite
       volumes:
         - mongodb_data:/data/db
       networks:
         - packlite-network

     app:
       build:
         context: .
         dockerfile: Dockerfile
       container_name: packlite-app
       restart: always
       ports:
         - '3000:3000'
       environment:
         - DATABASE_URL=mongodb://packlite_admin:${MONGO_PASSWORD}@mongodb:27017/packlite?authSource=admin
         - NEXTAUTH_URL=${NEXTAUTH_URL}
         - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
         - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
       depends_on:
         - mongodb
       networks:
         - packlite-network

   volumes:
     mongodb_data:

   networks:
     packlite-network:
       driver: bridge
   ```

2. **Create Dockerfile**

   ```dockerfile
   FROM node:18-alpine AS base

   # Dependencies
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --production

   # Builder
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   # Runner
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

3. **Configure next.config.js**

   Add `output: 'standalone'` to next.config.js:

   ```javascript
   module.exports = {
     output: 'standalone',
     // ... other config
   }
   ```

4. **Create .env file**

   ```env
   MONGO_PASSWORD=strong_password_here
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=generate_with_openssl
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

5. **Deploy**

   ```bash
   # Build and start
   docker-compose up -d --build

   # Initialize database
   docker-compose exec app npm run db:init

   # View logs
   docker-compose logs -f

   # Stop
   docker-compose down
   ```

6. **Set up Nginx reverse proxy** (same as VPS deployment, proxy to localhost:3000)

---

## Environment Configuration

### Required Environment Variables

| Variable              | Description               | Example                                                         |
| --------------------- | ------------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`        | MongoDB connection string | `mongodb://user:pass@localhost:27017/packlite?authSource=admin` |
| `NEXTAUTH_URL`        | Application URL           | `https://yourdomain.com`                                        |
| `NEXTAUTH_SECRET`     | Secret for JWT signing    | Generate with `openssl rand -base64 32`                         |
| `NEXT_PUBLIC_APP_URL` | Public-facing URL         | `https://yourdomain.com`                                        |

### Optional Environment Variables

| Variable                | Description           | Example                |
| ----------------------- | --------------------- | ---------------------- |
| `AWS_ACCESS_KEY_ID`     | AWS access key for S3 | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 | `wJalrXUtnFEMI...`     |
| `AWS_REGION`            | AWS region            | `us-east-1`            |
| `AWS_S3_BUCKET`         | S3 bucket name        | `packlite-images`      |
| `PORT`                  | Application port      | `3000`                 |
| `NODE_ENV`              | Environment           | `production`           |

### Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Database Setup

### MongoDB Atlas (Cloud)

1. **Create Cluster**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free tier cluster
   - Choose closest region to your deployment

2. **Configure Access**
   - Database Access: Create user with read/write permissions
   - Network Access: Add IP whitelist (0.0.0.0/0 for Vercel, or specific IPs for VPS)

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string and replace `<password>` with your user password

4. **Initialize Database**
   ```bash
   export DATABASE_URL="your-connection-string"
   npm run db:init
   ```

### Local MongoDB

See VPS Deployment Step 3 for local MongoDB installation.

### Database Maintenance

```bash
# Backup database
mongodump --uri="mongodb://user:pass@localhost:27017/packlite" --out=/backup/$(date +%Y%m%d)

# Restore database
mongorestore --uri="mongodb://user:pass@localhost:27017/packlite" /backup/20260209

# Reset database (WARNING: Deletes all data)
npm run db:reset

# Re-initialize
npm run db:init
```

---

## Security Considerations

### Essential Security Measures

1. **HTTPS Only**
   - Always use SSL/TLS certificates in production
   - Force HTTPS redirects in Nginx/load balancer

2. **Environment Variables**
   - Never commit `.env` files to version control
   - Use secure secret generation (`openssl rand -base64 32`)
   - Rotate secrets regularly

3. **MongoDB Security**
   - Enable authentication
   - Use strong passwords (20+ characters, mixed case, numbers, symbols)
   - Restrict network access (firewall rules)
   - Regular backups

4. **Firewall Configuration**

   ```bash
   # Only allow necessary ports
   sudo ufw allow 22/tcp   # SSH
   sudo ufw allow 80/tcp   # HTTP
   sudo ufw allow 443/tcp  # HTTPS
   sudo ufw deny 27017/tcp # Block external MongoDB access
   ```

5. **Rate Limiting**
   - Implemented in Nginx configuration
   - API routes: 10 requests/second
   - General routes: 50 requests/second

6. **Updates**

   ```bash
   # Regular system updates
   sudo apt update && sudo apt upgrade -y

   # Update Node.js dependencies
   npm audit
   npm audit fix
   ```

7. **SSH Hardening**

   ```bash
   # Disable root login
   sudo nano /etc/ssh/sshd_config
   # Set: PermitRootLogin no
   # Set: PasswordAuthentication no (use SSH keys)

   sudo systemctl restart ssh
   ```

### Security Headers

Already configured in Nginx:

- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs packlite

# View specific log lines
pm2 logs packlite --lines 100

# Clear logs
pm2 flush

# Process information
pm2 show packlite
```

### System Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Monitor resources
htop          # CPU and RAM
iotop         # Disk I/O
nethogs       # Network usage
```

### Application Logs

Logs are stored in `/home/packlite/packlite/logs/`:

- `out.log` - Application output
- `err.log` - Application errors

```bash
# View logs
tail -f ~/packlite/logs/out.log
tail -f ~/packlite/logs/err.log

# Search logs
grep "error" ~/packlite/logs/err.log
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/packlite-access.log

# Error logs
sudo tail -f /var/log/nginx/packlite-error.log
```

### Monitoring Services (Optional)

**For Production:**

- **Sentry**: Error tracking and monitoring ([sentry.io](https://sentry.io))
- **New Relic**: Application performance monitoring
- **Datadog**: Infrastructure and application monitoring
- **Uptime Robot**: Uptime monitoring and alerts

---

## Maintenance & Updates

### Updating the Application

```bash
# Connect to server
ssh packlite@your-server-ip

# Navigate to application directory
cd ~/packlite

# Pull latest changes
git fetch origin
git pull origin main

# Install dependencies
npm ci --production

# Rebuild application
npm run build

# Restart with PM2
pm2 restart packlite

# Monitor for issues
pm2 logs packlite --lines 50
```

### Automated Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci --production

# Build application
npm run build

# Restart PM2
pm2 restart packlite

# Show status
pm2 status

echo "✅ Deployment complete!"
```

Make executable:

```bash
chmod +x deploy.sh
./deploy.sh
```

### Database Migrations

```bash
# Run migration scripts (if any)
NODE_ENV=production npm run db:migrate

# Or use migration tools
# npm run migrate up
```

### Zero-Downtime Deployments with PM2

```bash
# Reload without downtime
pm2 reload packlite

# Graceful restart
pm2 gracefulReload packlite
```

---

## Backup Strategies

### MongoDB Backups

#### Automated Daily Backups

Create backup script `/home/packlite/scripts/backup-mongo.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/packlite/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="packlite"
DB_USER="packlite_admin"
DB_PASS="your_password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
mongodump --uri="mongodb://$DB_USER:$DB_PASS@localhost:27017/$DB_NAME?authSource=admin" \
  --out="$BACKUP_DIR/$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/$DATE.tar.gz"
```

Make executable:

```bash
chmod +x /home/packlite/scripts/backup-mongo.sh
```

Setup cron job:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/packlite/scripts/backup-mongo.sh >> /home/packlite/logs/backup.log 2>&1
```

#### Manual Backup

```bash
# Create backup
mongodump --uri="mongodb://user:pass@localhost:27017/packlite" --out=/backup/manual_backup

# Compress
tar -czf backup_$(date +%Y%m%d).tar.gz /backup/manual_backup
```

#### Restore from Backup

```bash
# Extract backup
tar -xzf backup_20260209.tar.gz

# Restore
mongorestore --uri="mongodb://user:pass@localhost:27017/packlite" ./backup_20260209
```

### Application Backups

```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  /home/packlite/packlite
```

### Remote Backups

Use rsync to copy backups to remote server:

```bash
# Sync backups to remote server
rsync -avz /home/packlite/backups/ user@backup-server:/backups/packlite/
```

---

## Troubleshooting

### Application Won't Start

**Issue**: PM2 shows app as "errored" or "stopped"

```bash
# Check logs
pm2 logs packlite --lines 100

# Common causes:
# 1. Port already in use
sudo lsof -i :3000
# Kill process if needed
sudo kill -9 <PID>

# 2. Environment variables missing
# Check .env.production file exists and is readable
cat .env.production

# 3. Database connection failed
# Test MongoDB connection
mongosh "mongodb://user:pass@localhost:27017/packlite?authSource=admin"

# Restart application
pm2 restart packlite
```

### Database Connection Issues

**Issue**: "MongoNetworkError" or "Connection refused"

```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongosh "mongodb://localhost:27017"

# Verify authentication
mongosh "mongodb://packlite_admin:password@localhost:27017/admin"
```

### Nginx 502 Bad Gateway

**Issue**: Nginx returns 502 error

```bash
# Check if application is running
pm2 status

# Check application logs
pm2 logs packlite

# Verify port 3000 is listening
sudo netstat -tlnp | grep 3000

# Check Nginx error logs
sudo tail -f /var/log/nginx/packlite-error.log

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

**Issue**: Certificate errors or HTTPS not working

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal

# Test renewal process
sudo certbot renew --dry-run

# Check Nginx SSL configuration
sudo nginx -t
```

### High Memory Usage

**Issue**: Application consuming too much memory

```bash
# Check memory usage
free -h
pm2 show packlite

# Restart application to clear memory
pm2 restart packlite

# Adjust PM2 memory limit in ecosystem.config.js:
# max_memory_restart: '500M'  # Lower limit

# Enable log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
```

### Performance Issues

**Issue**: Slow response times

```bash
# Check system resources
htop

# Monitor application
pm2 monit

# Check database performance
mongosh
db.currentOp()
db.serverStatus()

# Check slow queries
db.setProfilingLevel(2)
db.system.profile.find().sort({ts: -1}).limit(5)

# Check Nginx logs for slow requests
sudo tail -f /var/log/nginx/packlite-access.log
```

### Build Failures

**Issue**: `npm run build` fails

```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm cache clean --force

# Reinstall dependencies
npm install

# Check for TypeScript errors
npm run type-check

# Try building with verbose output
npm run build --verbose
```

### Common Error Messages

| Error                             | Cause                        | Solution                       |
| --------------------------------- | ---------------------------- | ------------------------------ |
| `EADDRINUSE: port already in use` | Port 3000 already taken      | Kill process or change port    |
| `MongoNetworkError`               | MongoDB not running          | Start MongoDB service          |
| `ValidationError`                 | Invalid environment variable | Check .env file                |
| `ECONNREFUSED`                    | Service not accessible       | Check firewall, service status |
| `certificate has expired`         | SSL certificate expired      | Run `certbot renew`            |

---

## Quick Reference Commands

### PM2

```bash
pm2 start ecosystem.config.js  # Start application
pm2 stop packlite              # Stop application
pm2 restart packlite           # Restart application
pm2 reload packlite            # Zero-downtime reload
pm2 logs packlite              # View logs
pm2 monit                      # Monitor resources
pm2 status                     # List all processes
```

### Nginx

```bash
sudo nginx -t                  # Test configuration
sudo systemctl restart nginx   # Restart Nginx
sudo systemctl reload nginx    # Reload configuration
sudo tail -f /var/log/nginx/packlite-access.log  # Access logs
sudo tail -f /var/log/nginx/packlite-error.log   # Error logs
```

### MongoDB

```bash
sudo systemctl status mongod   # Check status
sudo systemctl restart mongod  # Restart MongoDB
mongosh                        # Connect to MongoDB shell
mongodump                      # Backup database
mongorestore                   # Restore database
```

### Certbot

```bash
sudo certbot certificates      # List certificates
sudo certbot renew             # Renew certificates
sudo certbot renew --dry-run   # Test renewal
```

---

## Support & Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

### Useful Tools

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Managed MongoDB
- [Vercel](https://vercel.com) - Quick deployment platform
- [DigitalOcean](https://www.digitalocean.com) - VPS hosting
- [AWS Lightsail](https://aws.amazon.com/lightsail/) - Simple VPS
- [Uptime Robot](https://uptimerobot.com) - Uptime monitoring

---

## Conclusion

This guide covers the essential aspects of deploying and operating Packlite in production. Choose the deployment method that best fits your needs:

- **VPS**: Full control, cost-effective for high traffic
- **Vercel**: Quick deployment, great developer experience
- **Docker**: Consistent environments, easy local testing

Always prioritize security, monitoring, and regular backups in production deployments.
