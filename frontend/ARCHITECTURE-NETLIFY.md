# Architecture Overview - DLS Calculator on Netlify

## 🏗️ Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                            │
│                    (https://your-app.netlify.app)               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       NETLIFY CDN                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         React Frontend (Static Files)                      │ │
│  │  - HTML, CSS, JavaScript                                   │ │
│  │  - Build output from /build folder                         │ │
│  │  - Served globally from CDN                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         API Routes (/api/*)                                │ │
│  │  Redirected to → /.netlify/functions/api                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Internal Routing
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   NETLIFY FUNCTIONS                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  api.js (Serverless Function)                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Express.js Server                                   │  │ │
│  │  │  ├── POST /api/calculate-and-save                    │  │ │
│  │  │  ├── GET  /api/reports                               │  │ │
│  │  │  ├── GET  /api/reports/:id                           │  │ │
│  │  │  ├── DELETE /api/reports/:id                         │  │ │
│  │  │  └── GET  /api/health                                │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  │  Uses:                                                       │ │
│  │  ├── utils/dlsCalculator.js (DLS logic)                    │ │
│  │  └── utils/dlsResourceTable.js (Resource tables)           │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Firebase Admin SDK
                            │ (Authenticated via env var)
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    FIREBASE FIRESTORE                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Collection: artifacts/dls-calculator/match-reports        │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Document 1: {matchData, dlsResults, timestamp}      │  │ │
│  │  │  Document 2: {matchData, dlsResults, timestamp}      │  │ │
│  │  │  Document 3: ...                                     │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Storage Limit: 850 MB (enforced in code)                       │
│  Free Tier: 50K reads/day, 20K writes/day                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### 1. Calculate DLS & Save Report

```
User fills form → Click "Calculate DLS"
                      ↓
        POST /api/calculate-and-save
                      ↓
              Netlify Function
                      ↓
         ┌────────────┴────────────┐
         ↓                         ↓
  calculateDLS()          Check storage limit
  (DLS algorithm)         (current usage < 850MB?)
         ↓                         ↓
    DLS Results              ✓ Space available
         └────────────┬────────────┘
                      ↓
         Save to Firestore (with timestamp)
                      ↓
         Return report ID + data
                      ↓
         Display results to user
```

### 2. View Reports List

```
User clicks "View Reports"
                      ↓
            GET /api/reports
                      ↓
              Netlify Function
                      ↓
     Query Firestore (order by date)
                      ↓
         Return list of reports
                      ↓
         Display in UI
```

### 3. View Report Details

```
User clicks on a report
                      ↓
        GET /api/reports/:id
                      ↓
              Netlify Function
                      ↓
    Fetch document from Firestore
                      ↓
         Return full report data
                      ↓
      Display with Par Score tables
```

### 4. Generate PDF

```
User clicks "Generate PDF"
                      ↓
    Client-side: html2canvas + jsPDF
                      ↓
    Capture DOM elements as images
                      ↓
      Generate PDF in browser
                      ↓
        Download to user's device
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT VARIABLES                         │
│                  (Netlify Environment Secrets)                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  FIREBASE_SERVICE_ACCOUNT (JSON)                           │ │
│  │  - Never exposed to client                                 │ │
│  │  - Only accessible to Netlify Functions                    │ │
│  │  - Rotatable via Netlify dashboard                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                            ↓ (injected at runtime)
┌─────────────────────────────────────────────────────────────────┐
│                      NETLIFY FUNCTION                            │
│  process.env.FIREBASE_SERVICE_ACCOUNT                            │
│  → Parsed and used for Firebase Admin initialization            │
│  → Never sent to client                                          │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FIREBASE ADMIN SDK                            │
│  - Server-side authenticated connection                          │
│  - Full read/write access to Firestore                           │
│  - Bypasses client-side security rules                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📦 Build & Deploy Process

```
Developer pushes to Git
         ↓
    GitHub/GitLab
         ↓
  Netlify webhook triggered
         ↓
┌────────────────────────────┐
│  Build Environment         │
│  1. Install dependencies   │
│     npm install            │
│  2. Build React app        │
│     npm run build          │
│  3. Bundle functions       │
│     esbuild (automatic)    │
└────────────────────────────┘
         ↓
┌────────────────────────────┐
│  Deploy to Netlify         │
│  1. Upload static files    │
│     → Global CDN           │
│  2. Deploy functions       │
│     → Function runtime     │
│  3. Apply redirects        │
│     → /api/* routing       │
└────────────────────────────┘
         ↓
    ✅ Site Live!
 https://your-app.netlify.app
```

---

## 🌍 Global Distribution

```
                    ┌──────────────────┐
                    │  Netlify Global  │
                    │   CDN Network    │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ↓                   ↓                   ↓
    ┌─────────┐        ┌─────────┐        ┌─────────┐
    │  Edge 1 │        │  Edge 2 │        │  Edge 3 │
    │ (US)    │        │ (EU)    │        │ (Asia)  │
    └─────────┘        └─────────┘        └─────────┘
         ↑                   ↑                   ↑
         │                   │                   │
    User in USA       User in Europe      User in Asia

    → Static files served from nearest edge
    → Functions run in US (default region)
    → Firebase in your configured region
```

---

## 💾 Data Storage

```
┌──────────────────────────────────────────────────────────────┐
│                      FIRESTORE STRUCTURE                      │
├──────────────────────────────────────────────────────────────┤
│  artifacts (collection)                                       │
│    └── dls-calculator (document)                             │
│          └── match-reports (sub-collection)                  │
│                ├── [auto-id-1] (document)                    │
│                │     ├── team1Name: "India"                  │
│                │     ├── team2Name: "Australia"              │
│                │     ├── venue: "MCG"                        │
│                │     ├── date: "2026-01-20"                  │
│                │     ├── team2Target: 255                    │
│                │     ├── parScoreTable_OO: [...]             │
│                │     ├── parScoreTable_BB: [...]             │
│                │     └── createdAt: Timestamp                │
│                │                                              │
│                ├── [auto-id-2] (document)                    │
│                └── [auto-id-3] (document)                    │
└──────────────────────────────────────────────────────────────┘

Total Storage: < 850 MB (enforced)
```

---

## 🎯 Performance Characteristics

| Aspect                  | Details                             |
| ----------------------- | ----------------------------------- |
| **First Load**          | 1-2 seconds (static files from CDN) |
| **Function Cold Start** | 2-3 seconds (first call after idle) |
| **Function Warm**       | 50-200ms (subsequent calls)         |
| **Firebase Read**       | 100-300ms (depending on region)     |
| **Firebase Write**      | 200-500ms (with timestamp)          |
| **PDF Generation**      | 2-5 seconds (client-side)           |

---

## 📊 Resource Limits

### Netlify Free Tier

- ✅ 125,000 function invocations/month
- ✅ 10-second function timeout
- ✅ 1024 MB function memory
- ✅ 100 GB bandwidth
- ✅ Unlimited sites

### Firebase Free Tier

- ✅ 50,000 document reads/day
- ✅ 20,000 document writes/day
- ✅ 20,000 document deletes/day
- ✅ 1 GB storage
- ✅ 10 GB/month network egress

---

## 🔄 Continuous Deployment

```
Git Push → Automatic Deploy

main branch → Production
             (your-app.netlify.app)

feature branch → Deploy Preview
                 (feature--your-app.netlify.app)

Pull Request → Deploy Preview + Status Check
               (pr-123--your-app.netlify.app)
```

---

**This architecture provides:**

- ✅ Global CDN distribution
- ✅ Serverless scalability
- ✅ Zero server maintenance
- ✅ Automatic HTTPS
- ✅ Git-based deployments
- ✅ Preview deployments for testing
