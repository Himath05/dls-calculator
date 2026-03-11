# DLS 5.0 Calculator & Professional Report Generator

A full-stack web application that implements the Duckworth-Lewis-Stern (DLS) Method for calculating cricket match targets and generates professional, print-ready match reports.

## 🏏 Features

- **DLS 5.0 Calculation Engine**: Accurate implementation of the official DLS resource percentage table
- **Match Calculator**: User-friendly interface for inputting match data and stoppages
- **Professional Reports**: Eye-catching, print-ready match reports with comprehensive data
- **Par Score Tables**: Both over-by-over and ball-by-ball par score calculations
- **Report Management**: Save, view, and retrieve all generated reports
- **High-Quality PDF Export**: Print-optimized reports for professional documentation

## 🏗️ Architecture

### Frontend (React)

- Single-page application built with React 19
- Tailwind CSS for modern, responsive design
- Three main views: Calculator, Report List, Report Detail
- Print-optimized styling for high-quality PDF generation

### Backend (Node.js + Express)

- RESTful API server
- Firebase Firestore for data persistence
- DLS calculation engine with full resource table
- CORS-enabled for frontend communication

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Firestore enabled
- Firebase Admin SDK service account key

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
cd /Users/himathdesilva/Developer/DLS
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure Firebase
# Copy your Firebase service account key JSON file to backend/serviceAccountKey.json
# OR set the FIREBASE_SERVICE_ACCOUNT environment variable

# Create .env file (optional)
cp .env.example .env
# Edit .env if you want to customize PORT or other settings

# Start the backend server
npm start

# For development with auto-restart
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# The default API URL is http://localhost:5000/api

# Start the frontend development server
npm start
```

The frontend will open in your browser at `http://localhost:3000`

## 🔧 Firebase Configuration

### Setting up Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable Firestore Database
4. Go to Project Settings > Service Accounts
5. Click "Generate New Private Key"
6. Save the JSON file as `backend/serviceAccountKey.json`

### Firestore Structure:

```
/artifacts
  /dls-calculator
    /match-reports
      /{reportId}
        - team1Name
        - team2Name
        - venue
        - tournamentName
        - date
        - dlsManagerName
        - team1Score
        - team2Target
        - parScoreTable_OO
        - parScoreTable_BB
        - ... (other fields)
```

## 📖 API Endpoints

### POST /api/calculate-and-save

Calculate DLS target and save match report.

**Request Body:**

```json
{
  "team1Name": "India",
  "team2Name": "Australia",
  "venue": "Lord's Cricket Ground",
  "tournamentName": "ICC World Cup 2023",
  "date": "2023-11-05",
  "dlsManagerName": "John Smith",
  "matchType": "ODI (50)",
  "team1Innings": {
    "oversAtStart": 50,
    "finalScore": 287,
    "oversPlayed": 50,
    "stoppages": []
  },
  "team2Innings": {
    "oversAllocated": 50,
    "stoppages": [],
    "penaltyRuns": 0
  }
}
```

**Response:**

```json
{
  "success": true,
  "id": "report-id-123",
  "report": { ... }
}
```

### GET /api/reports

Get all saved match reports.

**Response:**

```json
{
  "success": true,
  "count": 10,
  "reports": [ ... ]
}
```

### GET /api/reports/:id

Get a specific match report by ID.

**Response:**

```json
{
  "success": true,
  "id": "report-id-123",
  "report": { ... }
}
```

### DELETE /api/reports/:id

Delete a specific match report.

## 🎯 Usage Guide

### 1. Enter Match Details

- Fill in team names, venue, tournament, date
- Optionally add DLS manager name

### 2. Select Match Type

- ODI (50 overs)
- T20 (20 overs)
- Custom (specify overs)

### 3. Team 1 Innings

- Enter final score
- Add stoppages if any (overs bowled, runs, wickets, overs lost)

### 4. Team 2 Innings

- Add stoppages if any
- Add penalty runs if applicable

### 5. Calculate & Save

- Click "Calculate DLS & Generate Report"
- View the professional report
- Print or save as PDF

### 6. View Saved Reports

- Access all previously generated reports
- Click any report to view details
- Print or export as needed

## 🖨️ Generating PDFs

To create a high-quality PDF report:

1. Open any saved report
2. Click "Print / Save as PDF"
3. In the print dialog:
   - Select "Save as PDF" as destination
   - Ensure "Background graphics" is enabled
   - Use A4 or Letter paper size
   - Set margins to minimum or default

The report is optimized for professional printing with:

- Proper page breaks
- Print-specific styling
- Color preservation
- Table formatting

## 📁 Project Structure

```
DLS/
├── backend/
│   ├── server.js              # Express server & API endpoints
│   ├── dlsResourceTable.js    # DLS 5.0 resource table & utilities
│   ├── dlsCalculator.js       # DLS calculation engine
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   └── serviceAccountKey.json.example
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main React application (single file)
│   │   ├── index.js
│   │   ├── index.css          # Tailwind CSS + print styles
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── README.md
└── media/
    └── ParScores OO.txt       # Reference par score table
```

## 🧮 DLS Calculation Details

### Resource Calculation

- Uses official DLS 5.0 resource percentage table
- Accounts for overs remaining and wickets lost
- Linear interpolation for fractional overs

### Target Calculation

- **R2 < R1**: Target = (Team1Score × R2/R1) + 1
- **R2 > R1**: Target = Team1Score + (G50 × (R2-R1)/100) + 1
- **R2 = R1**: Target = Team1Score + 1
- G50 constant = 245

### Par Score Tables

- Over-by-over: Par score at the end of each over
- Ball-by-ball: Par score after each ball
- Calculated for all wicket scenarios (0-9 wickets down)

## 🎨 Design Highlights

- **Gradient backgrounds** for visual appeal
- **Color-coded sections** for easy navigation
- **Responsive design** works on all devices
- **Accessible forms** with clear labels and placeholders
- **Professional typography** for reports
- **Print-optimized** styling for PDF generation

## 🔒 Security Notes

- Never commit `serviceAccountKey.json` to version control
- Always use `.env` files for sensitive configuration
- In production, use environment variables for Firebase credentials
- Implement authentication if needed for report access

## 🚀 Deployment

### Backend

- Deploy to platforms like Heroku, Railway, or Google Cloud Run
- Set `FIREBASE_SERVICE_ACCOUNT` environment variable
- Ensure `PORT` environment variable is set correctly

### Frontend

- Build for production: `npm run build`
- Deploy to Vercel, Netlify, or Firebase Hosting
- Update `REACT_APP_API_URL` to point to deployed backend

## 📝 License

© 2025 - DLS 5.0 Calculator. Built for professional cricket match management.

## 🤝 Credits

- **DLS Method**: © International Cricket Council
- **Developer**: Himath De Silva
- **Framework**: React, Node.js, Express, Firebase

## 📞 Support

For issues or questions, please refer to the code documentation or contact the development team.

---

**Note**: This application implements the DLS 5.0 method for educational and professional use. Ensure you have the necessary permissions for commercial usage of the DLS methodology.
