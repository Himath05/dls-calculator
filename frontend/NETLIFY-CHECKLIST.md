# 🚀 Quick Netlify Setup Checklist

Use this checklist to deploy your DLS Calculator to Netlify from scratch.

---

## ✅ Pre-Deployment Checklist

### 1. Repository Setup

- [ ] Frontend code is in its own Git repository
- [ ] Repository is pushed to GitHub/GitLab/Bitbucket
- [ ] All files are committed

### 2. Firebase Setup

- [ ] Firebase project is created
- [ ] Firestore database is enabled
- [ ] Service account key is downloaded (JSON file)
- [ ] Service account key is converted to single-line JSON:
  ```bash
  cat serviceAccountKey.json | jq -c .
  ```

### 3. Code Verification

- [ ] `netlify.toml` exists in frontend root
- [ ] `netlify/functions/api.js` exists
- [ ] `netlify/functions/utils/dlsCalculator.js` exists
- [ ] `netlify/functions/utils/dlsResourceTable.js` exists
- [ ] `package.json` includes all dependencies:
  - `serverless-http`
  - `firebase-admin`
  - `express`
  - `cors`

---

## 🌐 Netlify Deployment Steps

### Option 1: Via Netlify UI (Recommended for first time)

1. **Connect Repository**
   - [ ] Go to [app.netlify.com](https://app.netlify.com/)
   - [ ] Click "Add new site" → "Import an existing project"
   - [ ] Select Git provider and authorize
   - [ ] Choose your frontend repository

2. **Configure Build**
   - [ ] **Build command**: `npm install && npm run build`
   - [ ] **Publish directory**: `build`
   - [ ] **Functions directory**: `netlify/functions`
   - [ ] Click "Show advanced"

3. **Add Environment Variables**
   - [ ] Click "New variable"
   - [ ] **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - [ ] **Value**: Paste your single-line JSON (no quotes)
   - [ ] Save

4. **Deploy**
   - [ ] Click "Deploy site"
   - [ ] Wait 2-5 minutes for build to complete

### Option 2: Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Navigate to frontend folder
cd frontend/

# Initialize site
netlify init

# Set environment variable
netlify env:set FIREBASE_SERVICE_ACCOUNT '{"type":"service_account",...}'

# Deploy
netlify deploy --prod
```

- [ ] CLI installed
- [ ] Logged in to Netlify
- [ ] Site initialized
- [ ] Environment variable set
- [ ] Deployed successfully

---

## 🧪 Post-Deployment Testing

### 1. Test Health Endpoint

- [ ] Open your site: `https://your-site.netlify.app`
- [ ] Open browser console (F12)
- [ ] Run: `fetch('/api/health').then(r => r.json()).then(console.log)`
- [ ] Should return: `{ status: 'healthy', database: 'connected' }`

### 2. Test Calculator

- [ ] Fill in match metadata (teams, venue, etc.)
- [ ] Enter team 1 innings data
- [ ] Enter team 2 innings data
- [ ] Click "Calculate DLS"
- [ ] Result appears correctly

### 3. Test Report Saving

- [ ] After calculating, click "Save Report"
- [ ] Should see success message
- [ ] Go to "View Reports" tab
- [ ] Saved report should appear in list
- [ ] Click on report to view details

### 4. Test PDF Generation

- [ ] Open a saved report
- [ ] Click "Generate PDF"
- [ ] PDF should download with correct data

---

## 🐛 Troubleshooting

### If deployment fails:

- [ ] Check Netlify deploy logs: Site → Deploys → (failed deploy)
- [ ] Verify all files are committed to Git
- [ ] Check `package.json` has correct dependencies
- [ ] Try deploying again

### If functions fail:

- [ ] Check function logs: Site → Functions → api
- [ ] Verify `FIREBASE_SERVICE_ACCOUNT` is set correctly
- [ ] Check Firebase credentials are valid
- [ ] Redeploy the site

### If app shows errors:

- [ ] Open browser DevTools console
- [ ] Check Network tab for API errors
- [ ] Verify `/api/health` returns healthy status
- [ ] Clear browser cache and retry

---

## 🎯 Success Criteria

Your deployment is successful when:

- [ ] ✅ Site loads without errors
- [ ] ✅ Health check returns "connected" status
- [ ] ✅ Calculator performs DLS calculations
- [ ] ✅ Reports can be saved to Firebase
- [ ] ✅ Saved reports appear in list
- [ ] ✅ Reports can be viewed
- [ ] ✅ PDF generation works
- [ ] ✅ No console errors

---

## 📝 Important Links

After deployment, save these:

- **Site URL**: `https://your-site.netlify.app`
- **Admin URL**: `https://app.netlify.com/sites/your-site`
- **Firebase Console**: `https://console.firebase.google.com`
- **GitHub Repo**: `https://github.com/yourusername/dls-frontend`

---

## 🔄 Next Steps

- [ ] Set up custom domain (optional)
- [ ] Enable deploy previews for PRs
- [ ] Set up deploy notifications
- [ ] Configure Firebase security rules
- [ ] Set up Firebase billing alerts
- [ ] Add GitHub Actions for CI/CD (optional)

---

## 📞 Support

If you encounter issues:

1. Check the detailed guide: `NETLIFY-DEPLOYMENT-GUIDE.md`
2. Review Netlify function logs
3. Check Firebase console for errors
4. Visit [Netlify Community](https://answers.netlify.com)

---

**Ready to deploy? Start with the Pre-Deployment Checklist! 🚀**
