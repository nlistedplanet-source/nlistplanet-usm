# 🚀 Vercel Deployment - Quick Fix Guide

## ⚡ Fast Fix (5 Minutes)

Your mobile app deployments are failing in 6-8 seconds. Follow these exact steps:

---

## Step 1: Update Vercel Project Settings

### 1.1 Go to Project Settings
```
https://vercel.com/dashboard → Select "nlistplanet-mobile" project → Settings
```

### 1.2 Set Root Directory
- Navigate to: **Settings → General**
- Find: **Root Directory**
- Set to: `UnlistedHub-USM/mobile-app`
- Click **Save**

---

## Step 2: Configure Build Settings

### 2.1 Go to Build Settings
- Navigate to: **Settings → Build & Development Settings**

### 2.2 Update Settings
```
Framework Preset: Create React App (or Other)
Build Command: npm run build
Output Directory: build
Install Command: npm install --legacy-peer-deps
```
- Click **Save**

---

## Step 3: Add Environment Variables

### 3.1 Go to Environment Variables
- Navigate to: **Settings → Environment Variables**

### 3.2 Add These Variables (One by One)

**Variable 1:**
- Key: `CI`
- Value: `false`
- Environment: ✅ Production, ✅ Preview, ✅ Development

**Variable 2:**
- Key: `REACT_APP_API_URL`
- Value: `https://nlistplanet-usm-v8dc.onrender.com/api`
- Environment: ✅ Production, ✅ Preview, ✅ Development

**Variable 3:**
- Key: `GENERATE_SOURCEMAP`
- Value: `false`
- Environment: ✅ Production, ✅ Preview, ✅ Development

**Variable 4:**
- Key: `NODE_ENV`
- Value: `production`
- Environment: ✅ Production only

**Variable 5:**
- Key: `REACT_APP_FRONTEND_URL`
- Value: `https://mobile.nlistplanet.com`
- Environment: ✅ Production, ✅ Preview, ✅ Development

---

## Step 4: Redeploy

### 4.1 Go to Deployments
- Navigate to: **Deployments** tab

### 4.2 Trigger Redeploy
- Find latest failed deployment
- Click **...** (three dots menu)
- Click **Redeploy**
- Watch the build logs

---

## ✅ Success Indicators

Your deployment should now:
1. **Start building** (not fail in 6-8 seconds)
2. **Complete** in 1-3 minutes
3. **Show:** "Deployment Ready"
4. **URL:** https://mobile.nlistplanet.com

---

## 🐛 Still Failing?

### Check Build Logs
1. Go to failed deployment
2. Click on it to view logs
3. Look for error message
4. Common issues:

**Error: "Module not found"**
```bash
# Solution: Clear build cache
Settings → General → Clear Build Cache → Save
Then redeploy
```

**Error: "Command failed"**
```bash
# Solution: Verify build command
Settings → Build Settings → Build Command: npm run build
```

**Error: "Environment variable"**
```bash
# Solution: Double-check all 5 variables are added
Settings → Environment Variables → Verify all are present
```

---

## 📋 Verification Checklist

Before redeploying, ensure:

- [ ] Root Directory = `UnlistedHub-USM/mobile-app`
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `build`
- [ ] Install Command = `npm install --legacy-peer-deps`
- [ ] All 5 environment variables added
- [ ] `CI=false` is set for all environments
- [ ] Build cache cleared (if redeploying after failure)

---

## 🎯 Alternative: Push to Git

If Vercel dashboard method doesn't work:

```bash
# Make sure all settings above are done first
cd UnlistedHub-USM/mobile-app

# Commit the updated config files
git add vercel.json package.json .vercelignore .env.production
git commit -m "fix: update Vercel configuration for deployment"

# Push to trigger auto-deployment
git push origin development
```

Vercel will automatically detect and deploy.

---

## 📞 Support

If still failing after following all steps:
1. Check Vercel deployment logs (Deployments → Click failed deployment)
2. Copy the error message
3. Share in team chat or create issue

---

**Last Updated:** December 1, 2025  
**Status:** Ready to deploy ✅
