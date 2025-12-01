# NlistPlanet Mobile App

A production-ready mobile Progressive Web App (PWA) for trading unlisted shares.

## 🚀 Quick Start

```bash
npm install
npm start
```

## 📱 Features
- Complete authentication system with OTP verification
- Real-time marketplace with filters and search
- Create and manage listings (SELL/BUY)
- Bid/offer system with 2% platform fee
- Portfolio tracking and activity feed
- KYC document upload
- Referral system with rewards
- Push notifications support
- Offline-capable PWA

## 🏗️ Tech Stack
- React 19.2.0
- Tailwind CSS 3.4.18
- React Router 7.9.6
- Axios for API calls
- PWA with service worker

## 📖 Documentation
- See **DEPLOYMENT.md** for deployment guide
- API Base: `https://nlistplanet-usm-v8dc.onrender.com/api`

## 🎯 Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Route pages
├── context/       # React context (Auth)
├── utils/         # API client & helpers
└── App.js         # Main app with routing
```

## 🔧 Build
```bash
npm run build    # Production build
serve -s build   # Test locally
```

**Version:** 1.0.0
