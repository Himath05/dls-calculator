# Netlify Deployment Guide - DLS Calculator

## 🎯 Deployment Strategy: Frontend + Netlify Functions

Since your backend and frontend are in **separate repositories**, this guide helps you deploy the frontend to Netlify with the backend functionality running on Netlify Functions.

---

## 📋 Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Firebase Project**: You need Firebase credentials
3. **Separate Frontend Repo**: Push your `frontend/` folder to its own Git repository

---

## 🚀 Step 1: Prepare Your Frontend Repository

If you haven't already, create a separate repository for the frontend:

```bash
# Navigate to the frontend folder
cd frontend/

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial frontend setup for Netlify"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/dls-frontend.git

# Push to GitHub
git push -u origin main
```

---

## 🔧 Step 2: Configure Firebase Environment Variables

You'll need to set up Firebase credentials as environment variables in Netlify.

### Get Your Firebase Credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### Convert to Single-Line JSON:

```bash
# On Mac/Linux, run this command to convert the JSON to a single line:
cat serviceAccountKey.json | jq -c .

# Or manually: Remove all newlines and extra spaces from the JSON
```

You should get something like:

```
{"type":"service_account","project_id":"your-project",...}
```

---

## 🌐 Step 3: Deploy to Netlify

### Option A: Deploy via Netlify UI (Easiest)

1. **Go to [app.netlify.com](https://app.netlify.com/)**
2. Click **"Add new site"** → **"Import an existing project"**
3. **Connect to Git provider** (GitHub/GitLab/Bitbucket)
4. **Select your frontend repository**
5. **Configure build settings:**
   - **Base directory**: `(leave empty)`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `build`
   - **Functions directory**: `netlify/functions`

6. **Add Environment Variables** (Before deploying):
   - Click **"Show advanced"** → **"New variable"**
   - Add: `FIREBASE_SERVICE_ACCOUNT` = `{your-single-line-json}`

7. **Click "Deploy site"**

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize Netlify in your frontend folder
cd frontend/
netlify init

# Follow the prompts:
# - Create & configure a new site
# - Choose your team
# - Site name: dls-calculator (or your preferred name)
# - Build command: npm install && npm run build
# - Publish directory: build
# - Functions directory: netlify/functions

# Set environment variables
netlify env:set FIREBASE_SERVICE_ACCOUNT '{"type":"service_account",...}'

# Deploy
netlify deploy --prod
```

---

## ⚙️ Step 4: Verify Environment Variables

After deployment, verify your environment variables:

1. Go to **Site settings** → **Environment variables**
2. Confirm `FIREBASE_SERVICE_ACCOUNT` is set correctly
3. The value should be a valid single-line JSON string

**Important**: Don't add quotes around the JSON in Netlify's UI. Just paste the raw JSON.

---

## 🧪 Step 5: Test Your Deployment

1. **Open your deployed site** (e.g., `https://your-site-name.netlify.app`)

2. **Test the health endpoint**:
   - Open browser console (F12)
   - Run: `fetch('/api/health').then(r => r.json()).then(console.log)`
   - Should return: `{ status: 'healthy', database: 'connected' }`

3. **Test the calculator**:
   - Fill in match details
   - Calculate DLS
   - Save a report
   - Check if it saves to Firebase

---

## 🐛 Troubleshooting

### Issue: "Firebase initialization error"

**Solution**: Check your environment variable

```bash
# Verify it's set correctly in Netlify
netlify env:list

# Re-set if needed
netlify env:set FIREBASE_SERVICE_ACCOUNT '{"type":"service_account",...}'
```

### Issue: "Function returned an error"

**Solution**: Check Netlify function logs

1. Go to **Site** → **Functions** → **api**
2. Click on recent invocations
3. Check error messages

### Issue: CORS errors

The Netlify function already has CORS enabled. If you still see CORS errors:

- Clear browser cache
- Check Network tab in DevTools for actual error

### Issue: Build fails

Common fixes:

```bash
# Ensure package.json includes all dependencies
npm install --save serverless-http firebase-admin

# Check that netlify/functions/utils/ folder exists with:
# - dlsCalculator.js
# - dlsResourceTable.js
```

---

## 📁 Required File Structure

Your frontend repo should have:

```
frontend/
├── netlify.toml                 ✅ Build configuration
├── package.json                 ✅ Dependencies
├── netlify/
│   └── functions/
│       ├── api.js              ✅ Main serverless function
│       └── utils/
│           ├── dlsCalculator.js     ✅ DLS logic
│           └── dlsResourceTable.js  ✅ Resource tables
├── public/
│   ├── index.html
│   └── _redirects             ✅ Optional (netlify.toml handles this)
└── src/
    ├── App.js                 ✅ React app
    └── ...
```

---

## 🔄 Continuous Deployment

Once set up, Netlify will automatically:

- **Deploy on every git push** to your main branch
- **Run builds** with your configuration
- **Deploy serverless functions** automatically
- **Apply environment variables** from settings

To trigger a manual deploy:

```bash
netlify deploy --prod
```

---

## 🎨 Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow the DNS configuration steps
4. Netlify provides free HTTPS certificates

---

## 📊 Monitoring

- **Function logs**: Site → Functions → api
- **Deploy logs**: Site → Deploys → (select deployment)
- **Analytics**: Site → Analytics (requires paid plan)

---

## 💡 Tips

1. **Use environment branches**: Create preview deployments for testing
2. **Enable deploy previews**: Auto-deploy pull requests
3. **Set up notifications**: Get alerts on deploy failures
4. **Monitor function usage**: Check Functions tab for invocation counts
5. **Cold starts**: First function call may be slow (2-3 seconds)

---

## 🚨 Important Notes

- **Netlify Functions have execution limits**:
  - Free tier: 125,000 requests/month
  - 10-second timeout per function
  - 1024 MB memory

- **Firebase Firestore costs**:
  - Monitor your Firebase usage
  - Set up billing alerts
  - Free tier: 50K reads/day, 20K writes/day

---

## 📞 Need Help?

- **Netlify Status**: [netlifystatus.com](https://netlifystatus.com)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Community**: [answers.netlify.com](https://answers.netlify.com)

---

**Last Updated**: January 2026
