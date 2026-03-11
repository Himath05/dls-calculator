# DLS Calculator - Frontend Deployment

A professional DLS (Duckworth-Lewis-Stern) 5.0 Calculator with match report generation, deployed on Netlify with serverless functions.

---

## 🚀 Quick Deploy

**Ready to deploy? Follow these guides in order:**

1. 📋 **[NETLIFY-CHECKLIST.md](NETLIFY-CHECKLIST.md)** - Step-by-step deployment checklist
2. 📖 **[NETLIFY-DEPLOYMENT-GUIDE.md](NETLIFY-DEPLOYMENT-GUIDE.md)** - Detailed deployment instructions
3. ⚡ **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - Quick commands reference
4. 🏗️ **[ARCHITECTURE-NETLIFY.md](ARCHITECTURE-NETLIFY.md)** - Architecture overview
5. 📝 **[DEPLOYMENT-SUMMARY.md](DEPLOYMENT-SUMMARY.md)** - What was set up

---

## 📦 What's Included

### Frontend

- React 19 application
- Modern UI with Tailwind CSS
- DLS calculator with live validation
- Report listing and viewing
- PDF generation (client-side)

### Backend (Netlify Functions)

- `/api/health` - Health check
- `/api/calculate-and-save` - Calculate DLS & save report
- `/api/reports` - List all reports
- `/api/reports/:id` - Get/delete specific report

### Database

- Firebase Firestore for data storage
- 850 MB storage limit
- Automatic timestamps

---

## 🎯 Deployment Options

### Option 1: Netlify with Functions (Recommended)

✅ Deploy frontend + backend together  
✅ No separate server needed  
✅ Free tier available  
✅ Automatic HTTPS  
✅ Global CDN

**Start here**: [NETLIFY-CHECKLIST.md](NETLIFY-CHECKLIST.md)

### Option 2: Separate Backend

Deploy frontend to Netlify, backend separately to Render/Railway/Heroku

**See**: [NETLIFY-DEPLOYMENT-GUIDE.md](NETLIFY-DEPLOYMENT-GUIDE.md) → "Separate Backend Deployment"

---

## ⚙️ Prerequisites

- [ ] Netlify account ([signup](https://netlify.com))
- [ ] Firebase project with Firestore enabled
- [ ] Service account key JSON downloaded
- [ ] Frontend code in separate Git repository
- [ ] Node.js 18+ installed locally (for testing)

---

## 🔧 Configuration Files

| File                       | Purpose                          |
| -------------------------- | -------------------------------- |
| `netlify.toml`             | Build & deployment configuration |
| `.env.example`             | Environment variables template   |
| `package.json`             | Dependencies & scripts           |
| `netlify/functions/api.js` | Main serverless function         |

---

## 🧪 Local Development

### With Netlify Functions

```bash
# Install dependencies
npm install

# Install Netlify CLI
npm install -g netlify-cli

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Run development server (with functions)
netlify dev

# Open: http://localhost:8888
```

### With Separate Backend

```bash
# Terminal 1: Start backend
cd ../backend
npm install
npm start

# Terminal 2: Start frontend
cd frontend
npm install
npm start

# Open: http://localhost:3000
```

---

## 📊 Environment Variables

### Required for Production (Netlify)

```bash
FIREBASE_SERVICE_ACCOUNT="{"type":"service_account",...}"
```

### Optional for Development

```bash
REACT_APP_API_URL=http://localhost:8888/api  # For Netlify Dev
# or
REACT_APP_API_URL=http://localhost:5001/api  # For separate backend
```

**Prepare Firebase credentials**:

```bash
./prepare-firebase-credentials.sh
```

---

## 🏗️ Build Commands

```bash
# Install dependencies
npm install

# Development server
npm start

# Production build
npm run build

# Test build locally
npm install -g serve
serve -s build

# Deploy (via Netlify CLI)
netlify deploy --prod
```

---

## 📁 Project Structure

```
frontend/
├── netlify.toml                    # Netlify configuration
├── package.json                    # Dependencies
├── public/                         # Static files
│   ├── index.html
│   └── _redirects                  # URL routing
├── src/                            # React source code
│   ├── App.js                      # Main application
│   ├── App.css                     # Styles
│   └── index.js                    # Entry point
└── netlify/                        # Netlify Functions
    └── functions/
        ├── api.js                  # Main serverless function
        └── utils/
            ├── dlsCalculator.js    # DLS calculation logic
            └── dlsResourceTable.js # Resource percentage tables
```

---

## 🧪 Testing

### Health Check

```javascript
fetch("/api/health")
  .then((r) => r.json())
  .then(console.log);
```

Expected: `{ status: 'healthy', database: 'connected' }`

### Full Test

1. Open calculator
2. Fill in match details
3. Enter innings data
4. Calculate DLS target
5. Save report
6. View in reports list
7. Generate PDF

---

## 🐛 Troubleshooting

| Issue                | Solution                                               |
| -------------------- | ------------------------------------------------------ |
| Build fails          | Check `package.json` dependencies are installed        |
| Function error       | Verify `FIREBASE_SERVICE_ACCOUNT` environment variable |
| CORS error           | Clear browser cache, check function logs               |
| Firebase error       | Verify credentials in Netlify dashboard                |
| "Cannot find module" | Ensure `netlify/functions/utils/` files exist          |

**Detailed troubleshooting**: [NETLIFY-DEPLOYMENT-GUIDE.md](NETLIFY-DEPLOYMENT-GUIDE.md#-troubleshooting)

---

## 📚 Documentation

- **[NETLIFY-CHECKLIST.md](NETLIFY-CHECKLIST.md)** - Quick deployment checklist
- **[NETLIFY-DEPLOYMENT-GUIDE.md](NETLIFY-DEPLOYMENT-GUIDE.md)** - Complete guide
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - Command reference
- **[ARCHITECTURE-NETLIFY.md](ARCHITECTURE-NETLIFY.md)** - System architecture
- **[DEPLOYMENT-SUMMARY.md](DEPLOYMENT-SUMMARY.md)** - Setup summary

---

## 🔒 Security

- ✅ Firebase credentials stored as environment variables
- ✅ Never exposed to client-side code
- ✅ Service account key not committed to Git
- ✅ HTTPS enforced by Netlify
- ⚠️ **Important**: Add `serviceAccountKey*.json` to `.gitignore`

---

## 💰 Costs

### Free Tier Limits

- **Netlify**: 125K function calls/month, 100 GB bandwidth
- **Firebase**: 50K reads/day, 20K writes/day, 1 GB storage

**Estimated cost for moderate use**: $0/month

---

## 🎨 Features

- ✅ DLS 5.0 calculation algorithm
- ✅ Par score tables (Overs.Overs and Balls.Balls)
- ✅ Match report generation
- ✅ PDF export with branding
- ✅ Firebase Firestore integration
- ✅ Responsive design
- ✅ Storage limit enforcement (850 MB)
- ✅ Real-time validation

---

## 🔄 CI/CD

Netlify automatically deploys when you push to your Git repository:

```bash
git push origin main  →  Auto-deploys to production
```

**Deploy previews** are created for pull requests automatically.

---

## 📞 Support

- **Netlify Issues**: Check function logs in Netlify Dashboard
- **Firebase Issues**: Check [Firebase Console](https://console.firebase.google.com)
- **Community**: [Netlify Community](https://answers.netlify.com)

---

## 📄 License

MIT

---

## 👤 Author

Himath De Silva

---

## 🎉 Ready to Deploy?

**Start here**: [NETLIFY-CHECKLIST.md](NETLIFY-CHECKLIST.md)

**Need help?**: Check [NETLIFY-DEPLOYMENT-GUIDE.md](NETLIFY-DEPLOYMENT-GUIDE.md)

---

**Last Updated**: January 20, 2026
