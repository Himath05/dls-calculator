# 🚀 FREE Deployment Guide - DLS Calculator

Deploy your DLS Calculator completely free using Railway + Netlify. Total cost: **$0.00**

---

## 🎯 Quick Overview

| Component | Service  | Free Tier     | URL Type                          |
| --------- | -------- | ------------- | --------------------------------- |
| Backend   | Railway  | 500 hrs/month | `https://your-app.up.railway.app` |
| Frontend  | Netlify  | Unlimited     | `https://your-app.netlify.app`    |
| Database  | Firebase | 1 GB free     | Firestore                         |

**Total Monthly Cost: $0.00** ✅

---

## 📋 Prerequisites Checklist

- [done ] GitHub account (sign up at github.com)
- [done ] Railway account (sign up at railway.app with GitHub)
- [done ] Netlify account (sign up at netlify.com)
- [ done] Firebase project with Firestore enabled
- [done] serviceAccountKey.json file from Firebase

---

## 🔥 Step 1: Prepare Your Code (5 minutes)

### 1.1 Initialize Git

```bash
cd /Users/himathdesilva/Developer/DLS

# If not already a git repo:
git init

# Stage all files
git add .

# Commit
git commit -m "Initial commit - DLS Calculator ready for deployment"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `dls-calculator`
3. Description: "DLS 5.0 Cricket Calculator with Match Reports"
4. **DO NOT** check "Initialize with README" (you already have one)
5. Click **Create repository**

### 1.3 Push to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/dls-calculator.git
git branch -M main
git push -u origin main
```

✅ **Your code is now on GitHub!**

---

## 🚂 Step 2: Deploy Backend on Railway (10 minutes)

### 2.1 Sign Up & Create Project

1. Go to https://railway.app
2. Click **Login with GitHub** (free)
3. Click **New Project**
4. Select **Deploy from GitHub repo**
5. Choose your `dls-calculator` repository
6. Railway will auto-detect it's a Node.js project

### 2.2 Configure Environment Variables

1. In Railway dashboard, click on your service
2. Go to **Variables** tab
3. Click **+ New Variable**
4. Add these variables:

| Variable                   | Value       |
| -------------------------- | ----------- |
| `PORT`                     | `5001`      |
| `FIREBASE_SERVICE_ACCOUNT` | (see below) |

**For FIREBASE_SERVICE_ACCOUNT:**

- Open your `backend/serviceAccountKey.json` file
- Copy the **entire content** (all the JSON)
- Paste it as the value
- It should look like: `{"type":"service_account","project_id":"...",...}`

5. Click **Deploy** or wait for auto-deploy

### 2.3 Get Your Backend URL

1. Go to **Settings** tab
2. Scroll to **Networking** section
3. Click **Generate Domain**
4. Copy the URL (e.g., `dls-calculator-production.up.railway.app`)
5. **Save this URL** - you'll need it for frontend!

### 2.4 Test Your Backend

Open in browser:

```
https://YOUR-RAILWAY-URL.railway.app/health
```

Should return:

```json
{ "status": "healthy", "timestamp": "...", "database": "connected" }
```

✅ **Backend is live!**

---

## 🌐 Step 3: Deploy Frontend on Netlify (10 minutes)

### 3.1 Sign Up & Import Project

1. Go to https://netlify.com
2. Click **Sign up** → Choose **GitHub**
3. Click **Add new site** → **Import an existing project**
4. Choose **GitHub**
5. Select your `dls-calculator` repository

### 3.2 Configure Build Settings

| Setting               | Value            |
| --------------------- | ---------------- |
| **Base directory**    | `frontend`       |
| **Build command**     | `npm run build`  |
| **Publish directory** | `frontend/build` |

### 3.3 Add Environment Variable

1. Click **Show advanced**
2. Click **New variable**
3. Add:

   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://YOUR-RAILWAY-URL.railway.app/api`

   ⚠️ Replace `YOUR-RAILWAY-URL` with the URL you copied from Railway!

   ⚠️ Make sure to add `/api` at the end!

4. Click **Deploy site**

### 3.4 Wait for Deployment

- Netlify will build your app (2-3 minutes)
- Watch the deployment logs
- When done, you'll see a green **Published** status

### 3.5 Get Your Frontend URL

- Your site will be at: `https://RANDOM-NAME.netlify.app`
- You can customize this:
  1. Go to **Site settings**
  2. Click **Change site name**
  3. Enter: `dls-calculator` (or any available name)
  4. Your new URL: `https://dls-calculator.netlify.app`

✅ **Frontend is live!**

---

## 🔗 Step 4: Update CORS (5 minutes)

Your backend needs to allow requests from your frontend.

### 4.1 Update Backend Code

Edit `backend/server.js` around line 12-16:

```javascript
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://dls-calculator.netlify.app", // ← Add your Netlify URL
  ],
  credentials: true,
};
```

### 4.2 Push Changes

```bash
cd /Users/himathdesilva/Developer/DLS

git add backend/server.js
git commit -m "Update CORS for production"
git push
```

Railway will automatically detect the change and redeploy!

✅ **CORS configured!**

---

## ✅ Step 5: Test Your Live App

1. Open your Netlify URL: `https://dls-calculator.netlify.app`
2. Fill in a match calculation
3. Click **Calculate & Save**
4. Check the **View Saved Reports** section
5. Try deleting a report
6. Try printing a report as PDF

If everything works: **🎉 Congratulations! Your app is live!**

---

## 🎨 Step 6: Customize Your Site (Optional)

### Custom Domain (Free with Netlify)

1. Buy a domain from Namecheap, Google Domains, etc. (or use a free subdomain)
2. In Netlify: **Domain settings** → **Add custom domain**
3. Follow DNS configuration instructions
4. Your site will be at your custom domain!

### Change Site Name

In Netlify:

1. **Site settings** → **Change site name**
2. Enter your desired name: `my-dls-calculator`
3. New URL: `https://my-dls-calculator.netlify.app`

---

## 📊 Monitor Your App

### Railway Dashboard

- View logs: **Deployments** → Click on deployment
- Check metrics: CPU, Memory, Network usage
- Free tier: 500 hours/month (20+ days of 24/7 uptime)

### Netlify Dashboard

- View build logs
- Check deployment status
- Analytics (free tier available)

---

## 🆘 Troubleshooting

### Backend Issues

**Problem**: Backend not responding

- Check Railway logs: Deployments → Latest deployment → View logs
- Verify environment variables are set correctly
- Check if PORT is set to 5001

**Problem**: Database not connected

- Verify FIREBASE_SERVICE_ACCOUNT is correctly formatted JSON
- Check Firebase project is active
- Ensure Firestore is enabled in Firebase console

### Frontend Issues

**Problem**: Can't connect to backend

- Verify REACT_APP_API_URL is correct
- Must include `/api` at the end
- Check CORS is updated with your Netlify URL
- Trigger redeploy: Netlify → Deploys → Trigger deploy

**Problem**: Build fails

- Check build logs in Netlify
- Verify all dependencies are in package.json
- Try building locally: `cd frontend && npm run build`

### CORS Errors

**Problem**: "CORS policy blocked"

- Add your Netlify URL to backend's CORS config
- Must include `https://` in the URL
- Redeploy backend after changing CORS

---

## 💰 Cost Breakdown

| Service   | Free Tier        | Usage              | Cost      |
| --------- | ---------------- | ------------------ | --------- |
| Railway   | 500 hrs/month    | Backend 24/7       | $0.00     |
| Netlify   | 100 GB bandwidth | Frontend hosting   | $0.00     |
| Firebase  | 1 GB storage     | Firestore database | $0.00     |
| GitHub    | Unlimited repos  | Code hosting       | $0.00     |
| **TOTAL** |                  |                    | **$0.00** |

---

## 🎯 Summary

✅ **What you deployed:**

- ✅ Backend API on Railway (https://your-app.railway.app)
- ✅ React Frontend on Netlify (https://your-app.netlify.app)
- ✅ Firebase Firestore database
- ✅ Automatic HTTPS on both
- ✅ Auto-deployment on git push

✅ **What it cost:**

- **$0.00** - Completely free!

✅ **What you can do:**

- Share your app URL with anyone
- Calculate DLS targets online
- Save unlimited reports (up to 850 MB)
- Print professional PDF reports
- Scale to handle more users

---

## 📱 Share Your App

Your app is now live at:

- **Frontend**: https://your-app.netlify.app
- **Backend API**: https://your-app.railway.app

Share it with:

- Cricket teams and clubs
- Match officials
- Tournament organizers
- Friends and colleagues

---

## 🔄 Future Updates

To update your live app:

```bash
# Make your changes
# Then:
git add .
git commit -m "Your update message"
git push
```

Both Railway and Netlify will automatically detect and deploy your changes!

---

**🎉 Enjoy your free, professional DLS Calculator!**

Questions? Check the README.md or Railway/Netlify documentation.
