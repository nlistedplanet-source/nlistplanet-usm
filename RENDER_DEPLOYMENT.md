# Render Deployment Guide - Backend

## MongoDB URI Fixed
✅ Password encoded: `Div@10390` → `Div%4010390`
✅ Frontend URL updated: `https://nlistplanet-usm-app.vercel.app`

## Environment Variables for Render

Copy these exact values to Render Dashboard → Settings → Environment:

```
MONGODB_URI=<use corrected URI from backend/.env with URL-encoded password>

JWT_SECRET=<your JWT secret from backend/.env>

JWT_EXPIRE=7d

NODE_ENV=production

PORT=5000

PLATFORM_FEE_PERCENTAGE=2

BOOST_PRICE=100

BOOST_DURATION_HOURS=24

MAX_COUNTER_ROUNDS=4

AFFILIATE_COMMISSION_PERCENTAGE=5

ADMIN_EMAIL=<your admin email>

ADMIN_PASSWORD=<your admin password>

EMAIL_USER=<your email for notifications>

EMAIL_PASSWORD=<your email app password>

TWILIO_ACCOUNT_SID=<your Twilio SID>

TWILIO_AUTH_TOKEN=<your Twilio token>

TWILIO_PHONE_NUMBER=<your Twilio number>

FRONTEND_URL=https://nlistplanet-usm-app.vercel.app
```

**Important:** Copy actual values from `backend/.env` file to Render dashboard. Never commit secrets to Git.

## Deployment Steps

1. **Root Directory:** `UnlistedHub-USM/backend`
2. **Build Command:** `npm install` (or leave blank)
3. **Start Command:** `node server.js`
4. **Node Version:** 18 or 20

## Post-Deploy Testing

After deployment succeeds, test these endpoints:

```powershell
# Health check
curl https://<your-render-domain>.onrender.com/api/health

# Auth health
curl https://<your-render-domain>.onrender.com/api/auth/health

# Registration test
curl -X POST https://<your-render-domain>.onrender.com/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"Pass123","fullName":"Test User","phone":"9876543210"}'

# Login test
curl -X POST https://<your-render-domain>.onrender.com/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"test@example.com","password":"Pass123"}'
```

## MongoDB Atlas Network Access

Ensure IP whitelist allows connections:
- Go to MongoDB Atlas → Network Access
- Add: `0.0.0.0/0` (allow all) for testing
- Later restrict to Render IPs for security

## Frontend Configuration

After backend deploys, update frontend Vercel env:

```
REACT_APP_API_URL=https://<your-render-domain>.onrender.com/api
```

Then redeploy frontend.
