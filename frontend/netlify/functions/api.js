const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { calculateDLS } = require('./utils/dlsCalculator');

// Initialize Express app
const app = express();

// CORS configuration - allow all origins for Netlify Functions
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
let db;
try {
  // Parse Firebase credentials from environment variable
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  
  db = admin.firestore();
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
}

// Storage configuration
const STORAGE_LIMIT_BYTES = 850 * 1024 * 1024; // 850 MB

// Helper function to calculate storage size
const calculateStorageSize = (report) => {
  const jsonString = JSON.stringify(report);
  return Buffer.byteLength(jsonString, 'utf8');
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'not connected'
  });
});

// Calculate DLS and save report
app.post('/api/calculate-and-save', async (req, res) => {
  try {
    const { matchType, team1Innings, team2Innings, penaltyRuns, ...metadata } = req.body;

    // Calculate DLS - pass entire match data as single object
    const result = calculateDLS(req.body);

    // Create report object
    const report = {
      ...metadata,
      matchType,
      team1OversPlayed: team1Innings.oversPlayed,
      team1Score: team1Innings.finalScore,
      team2OversAllocated: team2Innings.oversAllocated,
      team2Target: result.team2Target,
      totalOvers: result.totalOvers,
      parScoreTable_OO: result.parScoreTable_OO,
      parScoreTable_BB: result.parScoreTable_BB,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Calculate report size
    const reportSize = calculateStorageSize(report);

    // Get current storage usage
    const reportsRef = db.collection('artifacts').doc('dls-calculator').collection('match-reports');
    const snapshot = await reportsRef.get();
    
    let totalSize = 0;
    snapshot.forEach(doc => {
      const docSize = calculateStorageSize(doc.data());
      totalSize += docSize;
    });

    // Check if adding this report would exceed the limit
    if (totalSize + reportSize > STORAGE_LIMIT_BYTES) {
      return res.status(400).json({
        error: 'Storage limit reached (850 MB). Please delete some reports before creating new ones.',
        storageUsedMB: (totalSize / (1024 * 1024)).toFixed(2),
        storageLimitMB: 850
      });
    }

    // Save to Firestore
    const docRef = await reportsRef.add(report);

    res.json({
      success: true,
      id: docRef.id,
      reportId: docRef.id,
      report: {
        ...report,
        id: docRef.id
      }
    });
  } catch (error) {
    console.error('Error calculating DLS:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all reports
app.get('/api/reports', async (req, res) => {
  try {
    const reportsRef = db.collection('artifacts').doc('dls-calculator').collection('match-reports');
    const snapshot = await reportsRef.orderBy('createdAt', 'desc').get();
    
    const reports = [];
    snapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString()
      });
    });

    res.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single report
app.get('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('artifacts').doc('dls-calculator').collection('match-reports').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      success: true,
      report: {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete report
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('artifacts').doc('dls-calculator').collection('match-reports').doc(id);
    
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await docRef.delete();
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get storage info
app.get('/api/storage', async (req, res) => {
  try {
    const reportsRef = db.collection('artifacts').doc('dls-calculator').collection('match-reports');
    const snapshot = await reportsRef.get();
    
    let totalSize = 0;
    snapshot.forEach(doc => {
      const docSize = calculateStorageSize(doc.data());
      totalSize += docSize;
    });

    const storageLimitMB = 850;
    const storageUsedMB = totalSize / (1024 * 1024);
    const percentageUsed = (storageUsedMB / storageLimitMB) * 100;

    res.json({
      success: true,
      storageUsedMB: storageUsedMB.toFixed(2),
      storageLimitMB,
      percentageUsed: percentageUsed.toFixed(1)
    });
  } catch (error) {
    console.error('Error fetching storage info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export the serverless function
module.exports.handler = serverless(app);
