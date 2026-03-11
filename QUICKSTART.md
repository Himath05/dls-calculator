# 🚀 Quick Start Guide - DLS 5.0 Calculator

## Step-by-Step Setup (5 Minutes)

### Prerequisites Check

- [ ] Node.js installed (check: `node --version`)
- [ ] npm installed (check: `npm --version`)
- [ ] Firebase project created
- [ ] Firebase service account key downloaded

---

## 🔥 Firebase Setup (Required)

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project" or select existing project
3. Name it (e.g., "DLS-Calculator")
4. Continue through setup

### 2. Enable Firestore

1. In Firebase Console, click "Firestore Database"
2. Click "Create database"
3. Select "Start in production mode" (or test mode for development)
4. Choose your region
5. Click "Enable"

### 3. Get Service Account Key

1. Go to Project Settings (gear icon) > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. **IMPORTANT**: Save it as `serviceAccountKey.json` in the `backend/` folder

---

## 💻 Installation Steps

### Backend Setup

```bash
# Navigate to backend folder
cd /Users/himathdesilva/Developer/DLS/backend

# Install dependencies
npm install

# Verify serviceAccountKey.json is in this folder
ls serviceAccountKey.json

# If not there, place your downloaded Firebase key file here and rename it

# Start the backend server
npm start

# You should see:
# ╔════════════════════════════════════════╗
# ║   DLS 5.0 Calculator API Server        ║
# ║   Running on http://localhost:5000     ║
# ╚════════════════════════════════════════╝
```

**Keep this terminal running!**

### Frontend Setup

```bash
# Open a NEW terminal window

# Navigate to frontend folder
cd /Users/himathdesilva/Developer/DLS/frontend

# Install dependencies (if not already done)
npm install

# Start the frontend development server
npm start

# Your browser should automatically open to http://localhost:3000
```

**Keep this terminal running too!**

---

## ✅ Verification

### Backend is Running ✓

- Terminal shows "Running on http://localhost:5000"
- Visit http://localhost:5000/health in browser
- You should see: `{"status":"healthy","timestamp":"...","database":"connected"}`

### Frontend is Running ✓

- Browser opens to http://localhost:3000
- You see "DLS 5.0 Calculator" page
- No errors in browser console (F12)

---

## 🎯 First Test

### Test the Calculator:

1. **Fill in Match Details:**

   - Team 1 Name: India
   - Team 2 Name: Australia
   - Venue: Lord's
   - Tournament: Test Match
   - Date: Today's date
   - DLS Manager: Your name

2. **Match Type:**

   - Select "ODI (50)"

3. **Team 1 Innings:**

   - Final Score: 287
   - (Leave stoppages empty for now)

4. **Team 2 Innings:**

   - (Leave stoppages empty)
   - Penalty Runs: 0

5. **Click "Calculate DLS & Generate Report"**

6. **Expected Result:**
   - Report page appears
   - Shows Team 2 Target: 288
   - Displays par score tables
   - "Print / Save as PDF" button visible

### Test PDF Generation:

1. Click "Print / Save as PDF"
2. In print dialog, select "Save as PDF"
3. Enable "Background graphics"
4. Save the PDF
5. Open the PDF - should look professional and colorful

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error: "Cannot find module 'firebase-admin'"**

```bash
cd backend
npm install
```

**Error: "Database not initialized" in /health**

- Check `serviceAccountKey.json` exists in backend folder
- Verify the JSON file is valid (open it, should have "type": "service_account")
- Restart the backend: `npm start`

**Port 5000 already in use**

```bash
# Edit backend/.env and change PORT to 5001
# Then restart backend
```

### Frontend Won't Start

**Error: "Cannot find module 'tailwindcss'"**

```bash
cd frontend
npm install
```

**API calls failing / CORS errors**

- Make sure backend is running on port 5000
- Check frontend/.env has `REACT_APP_API_URL=http://localhost:5000/api`
- Restart frontend

**Blank page / white screen**

- Open browser console (F12)
- Check for errors
- Most common: backend not running

### Report Generation Fails

**"Network error" message**

- Backend is not running - start it with `npm start` in backend folder
- Wrong API URL - check frontend/.env

**"Database not initialized"**

- Firebase not configured properly
- Check serviceAccountKey.json exists and is valid
- Verify Firestore is enabled in Firebase Console

---

## 🎨 Using the Application

### Calculator View

- Enter match details
- Add stoppages for rain interruptions (optional)
- Click calculate to generate report

### Report List View

- View all saved reports
- Click any report card to view details

### Report Detail View

- See full professional report
- Print or save as PDF
- Navigate back to calculator or list

---

## 📊 Understanding the Output

### Target Calculation

- If no interruptions: Team 2 Target = Team 1 Score + 1
- With interruptions: DLS formula applies

### Par Scores

- **Over-by-Over**: What score Team 2 needs at each over to be level
- **Ball-by-Ball**: More granular, shows par score after each ball
- Tables show different scenarios for wickets lost (0-9)

---

## 🔐 Production Deployment

### Environment Variables

**Backend (.env):**

```bash
PORT=5000
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

**Frontend (.env):**

```bash
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Build for Production

```bash
# Frontend
cd frontend
npm run build
# Deploy the 'build' folder to hosting service

# Backend
# Deploy to Heroku, Railway, Google Cloud Run, etc.
```

---

## 📞 Need Help?

1. Check the main README.md for detailed documentation
2. Verify all prerequisites are installed
3. Ensure Firebase is properly configured
4. Check browser console for errors (F12)
5. Check backend terminal for error messages

---

## 🎉 Success!

If you can:

- ✅ See the calculator page
- ✅ Generate a report
- ✅ View the report
- ✅ Save as PDF

**You're all set!** Enjoy using the DLS 5.0 Calculator!

---

**Last Updated:** November 2025
**Version:** 1.0.0
