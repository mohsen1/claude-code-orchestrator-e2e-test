# SplitSync Deployment Guide

This guide covers deploying SplitSync using Docker and the CI/CD pipeline.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Configuration](#environment-configuration)
- [Database Management](#database-management)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+ (for local development)
- Git

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server with Socket.io
npm run dev

# Visit http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Docker Deployment

### Option 1: Docker Compose (Recommended for VPS)

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Option 2: Docker Build & Run

```bash
# Build the image
docker build -t splitsync:latest .

# Run the container
docker run -d \
  --name splitsync \
  -p 3000:3000 \
  -v splitsync-data:/app/data \
  -e NEXTAUTH_SECRET=your-secret-key \
  -e NEXTAUTH_URL=http://your-domain.com \
  splitsync:latest

# Check logs
docker logs -f splitsync
```

### Docker Volume Persistence

The SQLite database is stored in `/app/data` inside the container. Use Docker volumes to persist data:

```bash
# Create a named volume
docker volume create splitsync-data

# Backup the database
docker run --rm \
  -v splitsync-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/splitsync-db-backup.tar.gz /data

# Restore from backup
docker run --rm \
  -v splitsync-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/splitsync-db-backup.tar.gz -C /
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:

1. **Quality Checks** - Runs ESLint, TypeScript type checking, and tests
2. **Build Verification** - Ensures the Next.js app builds successfully
3. **Docker Build Test** - Validates the Dockerfile works correctly
4. **Security Scan** - Runs `npm audit` for vulnerabilities

### Workflow Triggers

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Manual Deployment

To deploy automatically to production:

1. Uncomment the `deploy` job in `.github/workflows/ci.yml`
2. Configure your deployment secrets in GitHub:
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID` (if using Google OAuth)
   - `GOOGLE_CLIENT_SECRET`
   - Deployment tokens (Railway/VPS/etc.)

## Environment Configuration

### Required Variables

```bash
# Database
DATABASE_URL=/app/data/splitsync.db

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

### Optional Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Feature Flags
NEXT_PUBLIC_ENABLE_SOCKET=true
```

## Database Management

### Drizzle ORM Commands

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema changes (development only)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

### Database Backups

For production deployments, set up automated backups:

```bash
# Cron job example (daily backup at 2 AM)
0 2 * * * docker run --rm -v splitsync-data:/data -v /backups:/backup alpine tar czf /backup/splitsync-$(date +\%Y\%m\%d).tar.gz /data
```

## Monitoring & Health Checks

### Health Check Endpoint

```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-21T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "memory": {
    "used": 128.45,
    "total": 256.00,
    "unit": "MB"
  },
  "socket": {
    "connected": true
  }
}
```

### Docker Health Check

The Dockerfile includes a built-in health check that runs every 30 seconds:

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# Inspect health check logs
docker inspect splitsync --format='{{json .State.Health}}' | jq
```

### Application Logs

```bash
# Docker Compose
docker-compose logs -f app

# Docker
docker logs -f splitsync

# Last 100 lines
docker logs --tail 100 splitsync
```

## Troubleshooting

### Issue: Container Won't Start

**Symptoms:** Container exits immediately

**Solution:**
```bash
# Check logs
docker logs splitsync

# Common causes:
# 1. Missing NEXTAUTH_SECRET
# 2. Invalid DATABASE_URL path
# 3. Port 3000 already in use
```

### Issue: Database Locked

**Symptoms:** "database is locked" errors

**Solution:**
```bash
# Ensure only one container instance is running
docker ps -a | grep splitsync

# Check database permissions
docker exec splitsync ls -la /app/data

# Restart container gracefully
docker-compose restart
```

### Issue: Socket.io Connection Fails

**Symptoms:** Real-time features not working

**Solution:**
```bash
# Check NEXT_PUBLIC_APP_URL matches your domain
docker exec splitsync env | grep APP_URL

# Verify WebSocket support in reverse proxy (nginx example):
# location / {
#   proxy_pass http://localhost:3000;
#   proxy_http_version 1.1;
#   proxy_set_header Upgrade $http_upgrade;
#   proxy_set_header Connection "upgrade";
# }
```

### Issue: Build Fails in CI

**Symptoms:** GitHub Actions build fails

**Solution:**
```bash
# Test locally first
npm run lint
npm run type-check
npm run build

# Check for memory issues
docker build --memory=4g -t test-build .
```

## Production Checklist

Before deploying to production:

- [ ] Set strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Configure proper `NEXTAUTH_URL` (HTTPS in production)
- [ ] Set up database backups
- [ ] Configure reverse proxy (nginx/Caddy) with HTTPS
- [ ] Enable rate limiting
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Review CORS settings for Socket.io
- [ ] Test OAuth flow with real credentials
- [ ] Configure email service (for invitations)
- [ ] Set up error tracking

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use HTTPS** in production with valid SSL certificates
3. **Rotate secrets** regularly (especially `NEXTAUTH_SECRET`)
4. **Limit container permissions** (run as non-root user - already configured)
5. **Keep dependencies updated** (`npm audit fix`)
6. **Use firewall rules** to restrict access to port 3000
7. **Enable CORS** only for trusted domains
8. **Rate limit** API endpoints to prevent abuse

## Performance Optimization

1. **Enable Next.js Image Optimization** - Already configured in `next.config.js`
2. **Use Standalone Output** - Reduces Docker image size by ~80%
3. **Database Indexing** - Add indexes to frequently queried columns
4. **CDN for Static Assets** - Serve `public/` via CDN
5. **Compress Responses** - Enable gzip/brotli in reverse proxy

## Support

For issues and questions:
- Check the logs: `docker-compose logs -f`
- Review troubleshooting section above
- Open an issue on GitHub with logs and error messages
