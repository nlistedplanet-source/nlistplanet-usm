# Vercel Auto-Deploy Configuration Guide

## Overview
Both frontend applications (Desktop & Mobile PWA) are deployed on Vercel with automatic deployment from the `main` branch.

---

## ✅ Current Configuration Status

### Desktop Frontend
- **Path:** `UnlistedHub-USM/frontend`
- **Domain:** https://nlistplanet.com (production)
- **Auto-deploy:** ✅ Enabled on `main` branch
- **Framework:** Create React App (React 18)
- **Config:** `UnlistedHub-USM/frontend/vercel.json`

### Mobile PWA Frontend
- **Path:** `nlistplanet-mobile/frontend`
- **Domain:** https://mobile.nlistplanet.com (production)
- **Auto-deploy:** ✅ Enabled on `main` branch
- **Framework:** Create React App (React 19)
- **Config:** `nlistplanet-mobile/frontend/vercel.json`

---

## 🚀 How Auto-Deploy Works

### Automatic Deployment Trigger
Any push to the `main` branch triggers automatic deployment:

```bash
git add .
git commit -m "feat: your changes"
git push origin main
# ⚡ Vercel automatically detects push and starts deployment
```

### Git Configuration
Both `vercel.json` files include:
```json
{
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

This enables auto-deployment specifically for the `main` branch.

---

## 📋 Vercel Dashboard Setup

### Step 1: Verify Auto-Deploy Settings
1. Go to: https://vercel.com/dashboard
2. Select project (e.g., `nlistplanet` or `mobile-nlistplanet`)
3. Click **Settings** tab
4. Navigate to **Git** section
5. Verify:
   - ✅ **Production Branch:** `main`
   - ✅ **Auto Deploy:** Enabled
   - ✅ **Deployment Protection:** Disabled (or configured as needed)

### Step 2: Check GitHub Integration
1. In **Settings** → **Git**
2. Verify **GitHub Repository** is connected
3. Should show: `your-org/UnlistedHub-BlackTheme` or similar
4. If disconnected:
   - Click **Connect Git Repository**
   - Select GitHub
   - Authorize Vercel
   - Choose repository

### Step 3: Environment Variables
Add these in **Settings** → **Environment Variables**:

**Desktop Frontend:**
```env
REACT_APP_API_URL=https://nlistplanet-usm-v8dc.onrender.com/api
CI=false
DISABLE_ESLINT_PLUGIN=true
GENERATE_SOURCEMAP=false
NODE_OPTIONS=--max-old-space-size=4096

# Firebase (for push notifications)
REACT_APP_FIREBASE_API_KEY=<your-key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<your-domain>
REACT_APP_FIREBASE_PROJECT_ID=<your-project>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
REACT_APP_FIREBASE_APP_ID=<your-app-id>
REACT_APP_FIREBASE_MEASUREMENT_ID=<your-measurement-id>
REACT_APP_FIREBASE_VAPID_KEY=<your-vapid-key>
```

**Mobile PWA Frontend:**
```env
REACT_APP_API_URL=https://nlistplanet-usm-v8dc.onrender.com/api
CI=false
DISABLE_ESLINT_PLUGIN=true
GENERATE_SOURCEMAP=false
NODE_OPTIONS=--max-old-space-size=4096

# Same Firebase config as desktop
```

---

## 🔧 Build Configuration

### Desktop Frontend Build Settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "create-react-app"
}
```

### Mobile PWA Build Settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "create-react-app"
}
```

### Root Monorepo Build (if deploying from root)
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/build",
  "installCommand": "cd frontend && npm install --legacy-peer-deps"
}
```

---

## 🎯 Deployment Workflows

### Automatic Production Deployment
```bash
# Make changes
git add .
git commit -m "feat: new feature"
git push origin main

# ⚡ Vercel automatically:
# 1. Detects push to main
# 2. Runs build command
# 3. Deploys to production
# 4. Updates domains
```

### Preview Deployments (Feature Branches)
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and push
git push origin feature/new-feature

# ⚡ Vercel automatically:
# 1. Creates preview deployment
# 2. Generates unique URL
# 3. Comments on PR with preview link
```

### Manual Deployment (Fallback)
```bash
# Option 1: Via Vercel CLI
npm i -g vercel
cd UnlistedHub-USM/frontend  # or nlistplanet-mobile/frontend
vercel --prod

# Option 2: Via Dashboard
# 1. Go to Deployments tab
# 2. Click "Redeploy"
# 3. Select "Use existing Build Cache" or "Rebuild"
```

---

## 🐛 Troubleshooting

### Build Failures

#### Issue: "Cannot find module" errors
**Solution:**
```bash
# Update package.json to use --legacy-peer-deps
"scripts": {
  "build": "react-scripts build"
}

# Update vercel.json
"installCommand": "npm install --legacy-peer-deps"
```

#### Issue: "JavaScript heap out of memory"
**Solution:** Already configured in `vercel.json`:
```json
"env": {
  "NODE_OPTIONS": "--max-old-space-size=4096"
}
```

#### Issue: ESLint warnings blocking build
**Solution:** Already configured:
```json
"env": {
  "CI": "false",
  "DISABLE_ESLINT_PLUGIN": "true"
}
```

### Auto-Deploy Not Triggering

#### 1. Private Repository Issue (Common)
**Symptom:** Auto-deploy stopped working after making repo private

**Solution:**
```
1. Vercel Dashboard → Project Settings → Git
2. Click "Disconnect" 
3. Click "Connect Git Repository"
4. Select GitHub → Authorize Vercel
5. In GitHub popup:
   - Select "Only select repositories"
   - Choose your private repo
   - Click "Install & Authorize"
6. Test: git push origin main
```

**Detailed Fix:** See `VERCEL_PRIVATE_REPO_FIX.md`

#### 2. Check Git Integration
```bash
# Verify Vercel webhook exists
# GitHub Repo → Settings → Webhooks
# Should see: https://api.vercel.com/v1/integrations/deploy/...
```

#### 3. Check Deployment Settings
- Vercel Dashboard → Settings → Git
- Ensure **Production Branch** = `main` (not `master`)
- Ensure **Auto Deploy** is enabled

#### 4. Re-connect GitHub
If webhook is missing:
1. Vercel Dashboard → Settings → Git
2. Click **Disconnect** (if connected)
3. Click **Connect Git Repository**
4. Select GitHub and authorize
5. Choose repository

#### 5. Verify GitHub App Permissions
```
GitHub.com → Settings → Applications → Installed GitHub Apps
→ Vercel → Configure
→ Repository access → Add your private repo
→ Save
```

### Domain Configuration

#### Custom Domain Setup
1. Vercel Dashboard → Domains
2. Add domain: `nlistplanet.com`
3. Configure DNS (depends on provider):
   - **A Record:** Point to Vercel IP
   - **CNAME:** Point to `cname.vercel-dns.com`
4. Wait for DNS propagation (5-30 minutes)

#### Mobile Subdomain
1. Add domain: `mobile.nlistplanet.com`
2. Configure as CNAME to mobile project
3. Or use redirect rule in main project

---

## 📊 Monitoring Deployments

### View Deployment Status
1. Vercel Dashboard → Deployments
2. See real-time build logs
3. Check deployment duration
4. View errors/warnings

### Deployment Notifications
Configure in **Settings** → **Notifications**:
- ✅ Email on deployment start
- ✅ Email on deployment failure
- ✅ Slack/Discord webhooks (optional)

### Health Checks
```bash
# Desktop Frontend
curl -I https://nlistplanet.com

# Mobile Frontend
curl -I https://mobile.nlistplanet.com

# Both should return: 200 OK
```

---

## 🔐 Security Headers

Both frontends have security headers configured in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

---

## ⚡ Performance Optimizations

### Static Asset Caching
```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Service Worker Caching
```json
{
  "source": "/service-worker.js",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=0, must-revalidate"
    }
  ]
}
```

---

## 📱 Mobile Redirect (Desktop → Mobile)

Desktop frontend redirects mobile devices to mobile PWA:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "header",
          "key": "user-agent",
          "value": "(?i).*(android.*mobile|iphone|ipod|blackberry|iemobile|opera mini|webos).*"
        }
      ],
      "destination": "https://mobile.nlistplanet.com/:path*",
      "permanent": false
    }
  ]
}
```

---

## 🎯 Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use Vercel Dashboard for secrets
- Different values for preview vs production

### 2. Build Optimization
- Use `GENERATE_SOURCEMAP=false` in production
- Enable `CI=false` to ignore warnings
- Allocate enough memory: `NODE_OPTIONS=--max-old-space-size=4096`

### 3. Deployment Strategy
- Always test in preview before merging to main
- Use feature branches for new features
- Monitor build logs for warnings

### 4. Rollback Strategy
```bash
# If deployment breaks production:
# 1. Vercel Dashboard → Deployments
# 2. Find last working deployment
# 3. Click "Promote to Production"
# 4. Fix issue in code
# 5. Push fix to main
```

---

## 📚 Additional Resources

- Vercel Documentation: https://vercel.com/docs
- Deployment API: https://vercel.com/docs/rest-api/endpoints/deployments
- Git Integration: https://vercel.com/docs/deployments/git
- Custom Domains: https://vercel.com/docs/custom-domains

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Auto-deploy enabled on `main` branch
- [ ] GitHub integration connected
- [ ] Environment variables configured
- [ ] Custom domains added and verified
- [ ] SSL certificates active (auto via Vercel)
- [ ] Security headers configured
- [ ] Build completes successfully
- [ ] Service workers caching correctly
- [ ] Mobile redirect working (desktop → mobile)
- [ ] Push notifications working
- [ ] API connectivity confirmed

---

**Last Updated:** December 22, 2025  
**Status:** ✅ Auto-deploy fully configured for both frontends
