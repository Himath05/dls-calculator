# 🚀 Netlify Deployment - Quick Reference Card

## 📋 Before You Start

```bash
✓ Frontend in separate Git repo
✓ serviceAccountKey.json downloaded from Firebase
✓ Netlify account created
```

---

## 🎯 Deploy in 5 Steps

### 1️⃣ Prepare Firebase Credentials

```bash
cd frontend/
./prepare-firebase-credentials.sh
```

### 2️⃣ Connect to Netlify

- Go to [app.netlify.com](https://app.netlify.com/)
- Click "Add new site"
- Select your Git repository

### 3️⃣ Configure Build

```
Build command: npm install && npm run build
Publish directory: build
Functions directory: netlify/functions
```

### 4️⃣ Add Environment Variable

```
Key: FIREBASE_SERVICE_ACCOUNT
Value: [paste from serviceAccountKey-single-line.txt]
```

### 5️⃣ Deploy & Test

- Click "Deploy site"
- Wait 2-5 minutes
- Test: `/api/health` endpoint

---

## 🧪 Quick Test Commands

### Test Health Endpoint

```javascript
fetch("/api/health")
  .then((r) => r.json())
  .then(console.log);
// Expected: { status: 'healthy', database: 'connected' }
```

### Test Calculate Endpoint

```javascript
fetch("/api/calculate-and-save", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    /* your data */
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

---

## 📁 Required File Structure

```
frontend/
├── netlify.toml              ✅ (updated)
├── package.json              ✅
├── netlify/
│   └── functions/
│       ├── api.js           ✅
│       └── utils/
│           ├── dlsCalculator.js     ✅
│           └── dlsResourceTable.js  ✅
└── src/
    └── App.js               ✅ (API_BASE_URL configured)
```

---

## ⚙️ Netlify CLI Commands

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
cd frontend/ && netlify init

# Set environment
netlify env:set FIREBASE_SERVICE_ACCOUNT "$(cat serviceAccountKey-single-line.txt)"

# Deploy
netlify deploy --prod

# Test locally
netlify dev

# View logs
netlify functions:log api
```

---

## 🐛 Troubleshooting

| Problem        | Solution                          |
| -------------- | --------------------------------- |
| Build fails    | Check `package.json` dependencies |
| Function error | Check Netlify function logs       |
| Firebase error | Verify environment variable       |
| CORS error     | Clear cache, redeploy             |

---

## 📊 Monitoring

```bash
# Check site status
netlify status

# View deploy logs
netlify logs

# List environment variables
netlify env:list

# View function logs
netlify functions:log api
```

---

## 🔗 Important URLs

```
Production: https://[your-site].netlify.app
Dashboard: https://app.netlify.com/sites/[your-site]
Functions: https://app.netlify.com/sites/[your-site]/functions
Deploy logs: https://app.netlify.com/sites/[your-site]/deploys
```

---

## ⚡ Quick Fixes

### Redeploy

```bash
netlify deploy --prod
```

### Clear cache & redeploy

```bash
netlify build --clear-cache
netlify deploy --prod
```

### Update environment variable

```bash
netlify env:set FIREBASE_SERVICE_ACCOUNT "new-value"
netlify deploy --prod
```

---

## 📞 Get Help

- 📖 Detailed guide: `NETLIFY-DEPLOYMENT-GUIDE.md`
- ✅ Checklist: `NETLIFY-CHECKLIST.md`
- 📋 Summary: `DEPLOYMENT-SUMMARY.md`

---

## ✅ Success Indicators

```
✓ Site loads without errors
✓ /api/health returns 200 OK
✓ Calculator performs DLS calculations
✓ Reports save to Firebase
✓ PDF generation works
```

---

**Ready? Start with: `NETLIFY-CHECKLIST.md` 🎯**
