# 🚀 Developer's Quick Start Guide

> **For Solo Developers:** Yeh guide tumhare liye hai - simple, practical commands aur workflows

## 📋 Daily Development Workflow

### 1️⃣ Starting Development

```powershell
# Backend Start (Terminal 1)
cd UnlistedHub-USM/backend
node scripts/validateEnv.js    # ⚠️ Always check environment first
npm run dev                     # Start backend with auto-reload

# Desktop Frontend (Terminal 2) 
cd UnlistedHub-USM/frontend
npm start                       # Opens at http://localhost:3000

# Mobile PWA (Terminal 3) - if needed
cd nlistplanet-mobile/frontend
$env:PORT='3001'; npm start     # Opens at http://localhost:3001
```

### 2️⃣ Testing Kar Lo (Before Git Push)

```powershell
# Backend Tests
cd UnlistedHub-USM/backend
node scripts/quickTest.js       # Quick API sanity check

# Frontend Build Test
cd UnlistedHub-USM/frontend
npm run build                   # Make sure build works

# Mobile Build Test
cd nlistplanet-mobile/frontend
npm run build
```

### 3️⃣ Common Debug Commands

```powershell
# Check if ports are occupied
netstat -ano | findstr :5000   # Backend port
netstat -ano | findstr :3000   # Desktop frontend
netstat -ano | findstr :3001   # Mobile frontend

# Kill all Node processes (if needed)
Stop-Process -Name "node" -Force

# Check MongoDB connection
cd UnlistedHub-USM/backend
node scripts/checkDatabase.js

# Test push notification to user
node test-push-notification.js <username>

# Check FCM tokens
node scripts/checkUserTokenDebug.js <username>
```

## 🔧 Essential Development Scripts

### Backend Scripts (UnlistedHub-USM/backend/)

```bash
# User Management
node scripts/createAdmin.js                    # Create admin user
node scripts/makeUserAdmin.js                  # Promote user to admin
node scripts/checkAllUsers.js                  # List all users

# Company Management
node scripts/seedCompanies.js                  # Populate companies
node scripts/checkCompanyStatus.js             # Verify companies
node scripts/generateCompanyHighlights.js      # Generate AI highlights

# News Management
node scripts/fetchNews.js                      # Fetch latest news manually
node test-openai.js                           # Test OpenAI integration

# Testing & Debugging
node scripts/validateEnv.js                    # Validate .env configuration
node scripts/quickTest.js                      # Quick API tests
node scripts/checkDatabase.js                  # Check DB schemas
```

## 🐛 Troubleshooting Guide

### Problem: Backend won't start

```powershell
# 1. Check environment
cd UnlistedHub-USM/backend
node scripts/validateEnv.js

# 2. Check if port is busy
netstat -ano | findstr :5000
# If busy, kill it:
Stop-Process -Id <PID> -Force

# 3. Check MongoDB
# Visit MongoDB Atlas dashboard or check connection string
```

### Problem: Frontend shows API errors

```powershell
# 1. Backend running check
curl http://localhost:5000/api/health

# 2. Check CORS - Frontend .env should have:
# REACT_APP_API_URL=http://localhost:5000/api

# 3. Clear browser localStorage
# Open DevTools Console:
localStorage.clear()
# Then refresh
```

### Problem: Price discrepancies

```javascript
// ✅ CORRECT - Always use helpers
import { getNetPriceForUser, formatCurrency } from '../utils/helpers';
const netPrice = getNetPriceForUser(bid, listing.type, isOwner);
const display = formatCurrency(netPrice);

// ❌ WRONG - Never show raw price
const display = formatCurrency(listing.price); // NO!
```

### Problem: Company fields undefined

```javascript
// ✅ CORRECT - Always use fallbacks
const name = company.CompanyName || company.name;
const logo = company.Logo || company.logo;
const scrip = company.ScripName || company.scriptName;

// ❌ WRONG - Direct access can break
const name = company.name; // Might be undefined!
```

## 📝 Before Every Commit Checklist

```markdown
□ Backend validation passed: `node scripts/validateEnv.js`
□ API tests passed: `node scripts/quickTest.js`
□ Desktop builds successfully: `npm run build`
□ Mobile builds successfully: `npm run build`
□ Tested fee calculations work correctly
□ No console errors in browser DevTools
□ Checked for company field fallbacks
□ Used `toast` not `alert` for notifications
```

## 🚢 Deployment Checklist

### Backend (Render.com)

```markdown
□ All env vars set in Render dashboard
□ JWT_SECRET is 32+ characters
□ MONGODB_URI is correct
□ CORS_ORIGINS includes production URLs
□ Auto-deploy enabled on `main` branch
□ Check /api/health after deploy
```

### Frontend (Vercel)

```markdown
Desktop:
□ REACT_APP_API_URL points to production backend
□ Build command: npm run build
□ Output directory: build
□ Root directory: UnlistedHub-USM/frontend

Mobile:
□ REACT_APP_API_URL points to production backend  
□ Build command: npm run build
□ Output directory: build
□ Root directory: nlistplanet-mobile/frontend
```

## 🔐 Security Reminders

```javascript
// 1. Never commit .env files
// 2. Keep JWT_SECRET ≥ 32 chars
// 3. Always use protect middleware for protected routes
// 4. Validate user input with express-validator
// 5. Use Argon2id for password hashing (already implemented)
```

## 💡 Pro Tips

1. **Keep terminals organized:**
   - Terminal 1: Backend
   - Terminal 2: Desktop Frontend
   - Terminal 3: Mobile Frontend (when needed)

2. **Quick restart shortcut:**
   ```powershell
   # In backend terminal
   Ctrl+C  # Stop
   npm run dev  # Restart
   ```

3. **Check logs regularly:**
   - Backend: Console output in terminal
   - Frontend: Browser DevTools Console (F12)
   - Network tab: Check API requests/responses

4. **Before pushing to Git:**
   ```powershell
   # Run quick validation
   cd UnlistedHub-USM/backend
   node scripts/validateEnv.js && node scripts/quickTest.js
   ```

5. **Database quick checks:**
   ```powershell
   node scripts/checkAllUsers.js      # Users count
   node scripts/countCompanies.js     # Companies count
   node scripts/checkDatabase.js      # Schema verification
   ```

## 🆘 Emergency Commands

```powershell
# Kill all Node processes
Stop-Process -Name "node" -Force

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules
rm package-lock.json
npm install

# Reset local changes (⚠️ DANGER - loses unsaved work)
git reset --hard HEAD
git clean -fd
```

## 📚 When Things Break

1. **Check `.github/copilot-instructions.md`** - Has all patterns & solutions
2. **Run `node scripts/validateEnv.js`** - Catches config issues
3. **Run `node scripts/quickTest.js`** - Tests basic API
4. **Check browser Console** - Shows frontend errors
5. **Check terminal output** - Shows backend errors

---

**Remember:** Tum akele ho, lekin tools tumhare saath hain! These scripts will catch most issues before they become problems. 🚀
