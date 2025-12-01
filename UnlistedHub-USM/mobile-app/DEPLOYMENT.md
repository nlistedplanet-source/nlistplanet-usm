# NlistPlanet Mobile App - Deployment Guide

## 🚀 Deployment on Vercel

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- Domain configured (mobile.nlistplanet.com)

### Step 1: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### Step 2: Environment Variables
Configure these in Vercel Dashboard (Settings → Environment Variables):

```
REACT_APP_API_URL=https://nlistplanet-usm-v8dc.onrender.com/api
```

### Step 3: Build Settings
**Framework Preset:** Create React App
**Build Command:** `npm run build`
**Output Directory:** `build`
**Install Command:** `npm install`

### Step 4: Domain Configuration
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add custom domain: `mobile.nlistplanet.com`
3. Update DNS records:
   - Type: A
   - Name: mobile
   - Value: (Vercel IP provided)
   OR
   - Type: CNAME
   - Name: mobile
   - Value: cname.vercel-dns.com

### Step 5: Deploy
```bash
# From mobile-app directory
cd UnlistedHub-USM/mobile-app

# Deploy to production
vercel --prod
```

Or push to GitHub main branch for automatic deployment.

## 📱 PWA Testing

### Test Installation
1. Open mobile.nlistplanet.com on mobile device
2. After 30 seconds, install prompt should appear
3. Or manually: Browser menu → "Add to Home Screen"

### Test Offline
1. Install PWA
2. Turn off network
3. Open app (should load cached content)

### Test Push Notifications
1. Grant notification permissions
2. Test from backend admin panel
3. Verify notifications appear

## 🔍 Post-Deployment Checks

### Performance
- Lighthouse score > 90
- First Contentful Paint < 2s
- Time to Interactive < 3s

### PWA
- Service Worker registered
- Manifest.json accessible
- Icons loading correctly
- Install prompt functioning

### Security
- HTTPS enabled
- Security headers present
- Content Security Policy active

### Functionality
- All routes working
- API calls successful
- Authentication flow working
- File uploads working (KYC)

## 🛠️ Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Service Worker Not Registering
- Check HTTPS is enabled
- Verify service-worker.js in build folder
- Clear browser cache
- Check browser console for errors

### API Calls Failing
- Verify REACT_APP_API_URL is set
- Check CORS headers on backend
- Verify API is accessible from Vercel IPs

### Install Prompt Not Showing
- Wait 30 seconds after page load
- Check browser supports PWA (Chrome, Edge, Safari)
- Verify manifest.json is accessible
- Clear localStorage: `pwa-install-dismissed`

## 📊 Monitoring

### Analytics (Optional)
Add Google Analytics or Vercel Analytics:
```bash
npm install @vercel/analytics
```

In `src/index.js`:
```javascript
import { Analytics } from '@vercel/analytics/react';

root.render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
```

### Error Tracking (Optional)
Add Sentry:
```bash
npm install @sentry/react
```

## 🔄 CI/CD Pipeline
Automatic deployment on:
- Push to `main` branch
- Pull request preview deployments
- Manual trigger via Vercel Dashboard

## 📝 Environment Variables Reference
| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API base URL | https://api.nlistplanet.com |

## 🌐 Domain Setup Complete
Once deployed:
- Desktop: nlistplanet.com
- Mobile: mobile.nlistplanet.com
- Backend: nlistplanet-usm-v8dc.onrender.com

## 🎉 Go Live Checklist
- [ ] Environment variables configured
- [ ] Domain DNS records updated
- [ ] SSL certificate active
- [ ] Service worker caching properly
- [ ] All API endpoints tested
- [ ] Authentication flow verified
- [ ] KYC upload tested
- [ ] Push notifications working
- [ ] Lighthouse audit passed
- [ ] Real device testing complete
- [ ] Error monitoring active
- [ ] Analytics tracking live

---

For issues or questions, check Vercel documentation: https://vercel.com/docs
