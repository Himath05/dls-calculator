# 🚀 Netlify All-in-One Deployment Guide

Your backend is now integrated with your frontend as Netlify Functions! Everything will be hosted on Netlify for **FREE** forever.

---

## 📋 What Changed

✅ **Backend moved to Netlify Functions** (`frontend/netlify/functions/api.js`)
✅ **DLS Calculator copied** to `frontend/netlify/functions/utils/`
✅ **Backend dependencies added** to frontend `package.json`
✅ **netlify.toml created** with proper routing
✅ **API URL updated** to use Netlify Functions

---

## 🔧 Setup Steps

### 1️⃣ **Add Environment Variables to Netlify**

Go to your Netlify dashboard:

1. Open your site: https://app.netlify.com/sites/dls-calculator-5
2. Go to **Site settings** → **Environment variables**
3. Add this variable:

**Variable name:** `FIREBASE_SERVICE_ACCOUNT`

**Variable value:** Copy your entire `backend/serviceAccountKey.json` file content and paste it as a **single line JSON string**:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "..."
}
```

**Important:** Remove all line breaks and make it a single line!

---

### 2️⃣ **Push to GitHub**

```bash
cd /Users/himathdesilva/Developer/DLS/frontend

# Add all changes
git add .

# Commit
git commit -m "Move backend to Netlify Functions - all-in-one deployment"

# Push
git push origin main
```

---

### 3️⃣ **Netlify Will Auto-Deploy**

Netlify will automatically detect the changes and deploy everything:

- ✅ React frontend
- ✅ Backend API as Netlify Functions
- ✅ Proper routing configured

**Check deployment:** https://app.netlify.com/sites/dls-calculator-5/deploys

Wait 2-3 minutes for the build to complete.

---

## 🧪 Testing After Deployment

### Test the API:

```bash
# Health check
curl https://dls-calculator-5.netlify.app/api/health

# Should return:
# {"status":"healthy","timestamp":"...","database":"connected"}
```

### Test the App:

1. Visit: https://dls-calculator-5.netlify.app
2. Fill in a match report
3. Click "Calculate DLS & Generate Report"
4. Should work perfectly! ✅

---

## 🔄 Local Development

For local development, you need to run Netlify CLI:

```bash
# Install Netlify CLI globally (one-time)
npm install -g netlify-cli

# Run local development server
cd /Users/himathdesilva/Developer/DLS/frontend
netlify dev
```

This will:

- Start React on `http://localhost:8888`
- Start Netlify Functions on `http://localhost:8888/.netlify/functions/api`
- Automatically proxy API requests

---

## 📁 New File Structure

```
frontend/
├── netlify/
│   └── functions/
│       ├── api.js                    # Main serverless function (Express app)
│       └── utils/
│           ├── dlsCalculator.js      # DLS calculation engine
│           └── dlsResourceTable.js   # DLS resource table
├── netlify.toml                      # Netlify configuration
├── package.json                      # Now includes backend dependencies
└── .env                              # Updated API URL

backend/                              # Can be deleted after testing!
└── (old backend files - no longer needed)
```

---

## 💰 Cost Breakdown

**Before (Railway):**

- Free tier expired ❌
- Would need to pay $5/month

**After (Netlify Functions):**

- ✅ **FREE forever!**
- 125,000 function invocations/month (more than enough)
- Generous bandwidth limits
- No cold starts on free tier

---

## 🎯 API Endpoints (New URLs)

All API calls now go through Netlify:

| Endpoint          | URL                                                           |
| ----------------- | ------------------------------------------------------------- |
| Health Check      | `https://dls-calculator-5.netlify.app/api/health`             |
| Calculate & Save  | `https://dls-calculator-5.netlify.app/api/calculate-and-save` |
| Get All Reports   | `https://dls-calculator-5.netlify.app/api/reports`            |
| Get Single Report | `https://dls-calculator-5.netlify.app/api/reports/:id`        |
| Delete Report     | `https://dls-calculator-5.netlify.app/api/reports/:id`        |
| Storage Info      | `https://dls-calculator-5.netlify.app/api/storage`            |

---

## ✅ Checklist

- [ ] Copy Firebase service account JSON to Netlify environment variables
- [ ] Push code to GitHub
- [ ] Wait for Netlify deployment to complete
- [ ] Test the health endpoint
- [ ] Test creating a new report
- [ ] Verify PDF generation works
- [ ] Delete old backend folder (optional, after confirming everything works)

---

## 🐛 Troubleshooting

### "Firebase initialization error"

- Check that `FIREBASE_SERVICE_ACCOUNT` is set in Netlify environment variables
- Make sure it's valid JSON (single line, no line breaks)

### "Function invocation failed"

- Check the Netlify Function logs in the dashboard
- Go to **Functions** tab in your site dashboard

### "CORS errors"

- CORS is now open (`app.use(cors())`) - shouldn't be an issue
- If needed, update the CORS config in `netlify/functions/api.js`

### Local development issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Use Netlify CLI for local dev
netlify dev
```

---

## 🎉 You're Done!

Once deployed:

- ✅ Frontend and backend are together on Netlify
- ✅ No separate servers to manage
- ✅ FREE forever (within generous limits)
- ✅ Automatic HTTPS
- ✅ Fast global CDN

Your app is now production-ready and completely free! 🚀
