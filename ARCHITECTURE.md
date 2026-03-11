# DLS 5.0 Calculator - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  React Frontend                         │    │
│  │                 (localhost:3000)                        │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │  Calculator  │  │  Report List │  │Report Detail │ │    │
│  │  │     View     │  │     View     │  │     View     │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  │                                                          │    │
│  │              State-Based Navigation                     │    │
│  │              Tailwind CSS Styling                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ HTTP/HTTPS                        │
│                              │ (Fetch API)                       │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Node.js Backend Server                        │
│                     (localhost:5000)                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  Express.js API                         │    │
│  │                                                          │    │
│  │  ┌──────────────────┐  ┌──────────────────┐           │    │
│  │  │  API Endpoints   │  │  DLS Calculator   │           │    │
│  │  │                  │  │     Engine        │           │    │
│  │  │ • POST /calc..   │  │                  │           │    │
│  │  │ • GET /reports   │  │ • Resource Table │           │    │
│  │  │ • GET /report/:id│  │ • Target Calc    │           │    │
│  │  │ • DELETE /report │  │ • Par Scores     │           │    │
│  │  └──────────────────┘  └──────────────────┘           │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────┐          │    │
│  │  │     Firebase Admin SDK Integration       │          │    │
│  │  └──────────────────────────────────────────┘          │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ Firebase Admin SDK                │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Firebase Firestore                            │
│                      (Cloud Database)                            │
│                                                                  │
│  /artifacts/dls-calculator/match-reports/                       │
│                                                                  │
│    ├── {reportId-1}                                             │
│    │   ├── team1Name: "India"                                   │
│    │   ├── team2Name: "Australia"                               │
│    │   ├── team1Score: 287                                      │
│    │   ├── team2Target: 288                                     │
│    │   ├── parScoreTable_OO: {...}                              │
│    │   ├── parScoreTable_BB: {...}                              │
│    │   └── ...                                                   │
│    │                                                             │
│    ├── {reportId-2}                                             │
│    │   └── ...                                                   │
│    │                                                             │
│    └── {reportId-N}                                             │
│        └── ...                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. Calculate & Save Report Flow

```
User Input (Calculator)
        │
        ├─ Match Details (teams, venue, tournament, date)
        ├─ Match Type (ODI/T20/Custom)
        ├─ Team 1 Innings (score, stoppages)
        └─ Team 2 Innings (stoppages, penalty)
        │
        ▼
Frontend State Management
        │
        ├─ Form validation
        ├─ State updates (useState)
        └─ Prepare request payload
        │
        ▼
HTTP POST /api/calculate-and-save
        │
        ▼
Backend API Handler
        │
        ├─ Receive match data
        ├─ Call DLS Calculator
        │   │
        │   ├─ Get resource table values
        │   ├─ Calculate R1 (Team 1 resource)
        │   ├─ Calculate R2 (Team 2 resource)
        │   ├─ Apply DLS target formula
        │   ├─ Generate par score tables
        │   │   ├─ Over-by-over (51 rows × 10 wickets)
        │   │   └─ Ball-by-ball (306 rows × 10 wickets)
        │   └─ Return calculation result
        │
        ├─ Add timestamps
        └─ Save to Firestore
        │
        ▼
Firestore Database
        │
        ├─ Generate document ID
        ├─ Store all report data
        └─ Return saved document
        │
        ▼
HTTP Response (200 OK)
        │
        ├─ Success: true
        ├─ Report ID
        └─ Full report data
        │
        ▼
Frontend Receives Response
        │
        ├─ Update current report state
        ├─ Switch to Report Detail view
        └─ Display professional report
```

### 2. View Reports List Flow

```
User Clicks "View Saved Reports"
        │
        ▼
HTTP GET /api/reports
        │
        ▼
Backend API Handler
        │
        ├─ Query Firestore
        │   └─ Order by createdAt (desc)
        │
        ├─ Fetch all documents
        └─ Format response
        │
        ▼
Firestore Database
        │
        └─ Return all match reports
        │
        ▼
HTTP Response (200 OK)
        │
        ├─ Success: true
        ├─ Count: number of reports
        └─ Reports: array of report objects
        │
        ▼
Frontend Receives Response
        │
        ├─ Update reports state
        ├─ Switch to Report List view
        └─ Display report cards in grid
```

### 3. View Single Report Flow

```
User Clicks Report Card
        │
        ├─ Extract report ID
        │
        ▼
HTTP GET /api/reports/{id}
        │
        ▼
Backend API Handler
        │
        ├─ Extract ID from URL
        ├─ Query Firestore for specific document
        │
        ▼
Firestore Database
        │
        └─ Return report document
        │
        ▼
HTTP Response (200 OK)
        │
        ├─ Success: true
        ├─ Report ID
        └─ Full report data
        │
        ▼
Frontend Receives Response
        │
        ├─ Update current report state
        ├─ Switch to Report Detail view
        └─ Display full report with tables
```

### 4. Print/PDF Flow

```
User Clicks "Print / Save as PDF"
        │
        ▼
window.print()
        │
        ├─ Browser print dialog opens
        │
        ├─ Apply print-specific CSS
        │   ├─ Hide navigation buttons
        │   ├─ Optimize page breaks
        │   ├─ Enable background graphics
        │   └─ Adjust table sizing
        │
        ▼
User Selects "Save as PDF"
        │
        ├─ Choose location
        └─ Save file
        │
        ▼
High-Quality PDF Generated
        │
        ├─ All colors preserved
        ├─ Tables properly formatted
        ├─ Professional layout maintained
        └─ Ready for printing/sharing
```

---

## 🧩 Component Breakdown

### Frontend Components (in App.js)

```
App (Main Component)
│
├── State Management
│   ├── view (calculator/reportList/reportDetail)
│   ├── matchMetadata (team names, venue, etc.)
│   ├── matchType (ODI/T20/Custom)
│   ├── team1Innings (score, stoppages)
│   ├── team2Innings (stoppages, penalty)
│   ├── reports (array of all reports)
│   └── currentReport (selected report data)
│
├── CalculatorView
│   ├── Match Details Form (6 fields)
│   ├── Match Type Selector (radio buttons)
│   ├── Team 1 Innings Section
│   │   ├── Score inputs
│   │   └── Dynamic stoppage rows
│   ├── Team 2 Innings Section
│   │   ├── Allocation inputs
│   │   └── Dynamic stoppage rows
│   └── Calculate Button
│
├── ReportListView
│   ├── Header with back button
│   ├── Loading state
│   ├── Empty state
│   └── Report Grid
│       └── Report Cards (clickable)
│
└── ReportDetailView
    ├── Navigation Bar (hidden in print)
    ├── Report Header (gradient)
    ├── Match Summary (teams, scores)
    ├── DLS Calculation Summary
    ├── Stoppage Details Tables
    ├── Over-by-Over Par Score Table
    ├── Ball-by-Ball Par Score Table
    └── Report Footer
```

### Backend Modules

```
server.js
│
├── Express Setup
│   ├── CORS middleware
│   ├── JSON body parser
│   └── Route handlers
│
├── Firebase Admin Init
│   ├── Service account loading
│   └── Firestore connection
│
└── API Endpoints
    ├── POST /api/calculate-and-save
    ├── GET /api/reports
    ├── GET /api/reports/:id
    ├── DELETE /api/reports/:id
    └── GET /health

dlsResourceTable.js
│
├── DLS_RESOURCE_TABLE
│   └── 51 rows × 10 columns = 510 data points
│
├── G50 Constant (245)
│
└── Utility Functions
    ├── getResource(overs, wickets)
    ├── oversBallsToDecimal(oversStr)
    └── decimalToOversBalls(decimalOvers)

dlsCalculator.js
│
├── calculateDLS(matchData)
│   ├── Determine total overs
│   ├── Calculate innings resources
│   ├── Apply target formula
│   └── Generate par score tables
│
├── calculateInningsResource(innings, totalOvers)
│   ├── Get initial resource
│   ├── Process stoppages
│   ├── Calculate resource lost
│   └── Return final resource
│
└── generateParScoreTable(score, resource, overs, ballByBall)
    ├── Loop through overs/balls
    ├── Calculate par for each wicket scenario
    └── Return complete table
```

---

## 📊 DLS Calculation Logic

### Resource Calculation Algorithm

```
For each innings:
  1. Start with initial resource (based on overs allocated, 0 wickets)
  2. For each stoppage:
     a. Determine overs remaining BEFORE stoppage
     b. Get resource available at that point (considering wickets down)
     c. Determine overs remaining AFTER stoppage (overs lost subtracted)
     d. Get resource available after stoppage
     e. Calculate resource lost = resource_before - resource_after
     f. Subtract from total resource
  3. Final resource = initial resource - sum of all resource losses
```

### Target Calculation Logic

```
Given:
  - Team 1 Score (S1)
  - Team 1 Resource (R1)
  - Team 2 Resource (R2)
  - G50 = 245

Calculate:
  IF R2 < R1:
    // Team 2 has fewer resources (proportional reduction)
    Target = FLOOR(S1 × (R2 / R1)) + 1

  ELSE IF R2 > R1:
    // Team 2 has more resources (G50 increase)
    Target = FLOOR(S1 + (G50 × (R2 - R1) / 100)) + 1

  ELSE:
    // Equal resources
    Target = S1 + 1

  // Add penalty runs
  Target = Target + PenaltyRuns
```

### Par Score Calculation Logic

```
For each over (or ball):
  For each wicket scenario (0-9 wickets down):
    1. Determine overs remaining at this point
    2. Get resource percentage for (overs_remaining, wickets_down)
    3. Calculate: ParScore = FLOOR(Team1Score × (Resource / R1_final))
    4. Store in table
```

---

## 🎨 Styling Architecture

### Tailwind CSS Utility Classes

```
Layout:
  - min-h-screen, container, mx-auto, px-4, py-8
  - grid, grid-cols-1, md:grid-cols-2, lg:grid-cols-3
  - flex, items-center, justify-between

Colors:
  - bg-gradient-to-r, from-blue-600, to-blue-800
  - text-white, text-gray-800, text-blue-600
  - border-gray-300, border-blue-300

Spacing:
  - gap-4, gap-6, gap-8
  - mb-4, mb-6, mb-8
  - p-4, p-6, p-8

Typography:
  - text-2xl, text-3xl, text-4xl
  - font-bold, font-semibold, font-medium

Interactive:
  - hover:bg-blue-700, hover:shadow-2xl
  - transition-colors, transition-all
  - cursor-pointer, disabled:opacity-50

Responsive:
  - md:grid-cols-2 (medium screens)
  - lg:grid-cols-3 (large screens)
  - print:hidden (hide on print)
```

### Print-Specific CSS

```css
@media print {
  @page {
    size: A4;
    margin: 1cm;
  }

  body {
    print-color-adjust: exact;
  }

  .print:hidden {
    display: none;
  }

  table {
    page-break-inside: avoid;
  }
}
```

---

## 🔐 Security Considerations

```
Frontend:
  ✓ No sensitive data stored in browser
  ✓ Environment variables for API URL
  ✓ Input validation on forms

Backend:
  ✓ Service account key not in version control
  ✓ Environment variables for credentials
  ✓ CORS configuration for allowed origins
  ✓ Error handling doesn't expose internals

Database:
  ✓ Firebase Admin SDK for server-side access
  ✓ Firestore security rules (can be configured)
  ✓ Data stored in isolated app collection
  ✓ Timestamps for audit trail
```

---

## 📈 Scalability

### Current Architecture Supports:

- ✅ **Multiple Users**: Concurrent requests handled by Express
- ✅ **Large Datasets**: Firestore queries with ordering/pagination
- ✅ **Growing Reports**: Unlimited report storage in Firestore
- ✅ **High Traffic**: Can be deployed to cloud platforms with auto-scaling

### Future Enhancements:

- 🔄 Redis caching for frequently accessed reports
- 🔄 Background job queue for heavy calculations
- 🔄 CDN for frontend assets
- 🔄 Load balancer for multiple backend instances
- 🔄 Real-time updates with Firestore listeners

---

This architecture provides a robust, scalable, and maintainable foundation for the DLS 5.0 Calculator application!
