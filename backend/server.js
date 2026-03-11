require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { calculateDLS } = require('./dlsCalculator');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://dls-calculator-5.netlify.app"
  ],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
// Initialize Firebase Admin
let db;
try {
  let serviceAccount;
  
  // Check if FIREBASE_SERVICE_ACCOUNT is a file path or JSON string
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const accountValue = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    // If it starts with './' or '/', treat it as a file path
    if (accountValue.startsWith('./') || accountValue.startsWith('/')) {
      serviceAccount = require(accountValue);
    } else {
      // Otherwise, parse as JSON
      serviceAccount = JSON.parse(accountValue);
    }
  } else {
    // Default: use service account file
    serviceAccount = require('./serviceAccountKey.json');
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  db = admin.firestore();
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.log('⚠️  Server will run but database operations will fail');
}

// Define the app ID for Firestore paths
const APP_ID = 'dls-calculator';

// Storage limit: 850 MB in bytes
const STORAGE_LIMIT_BYTES = 850 * 1024 * 1024;

/**
 * Calculate approximate storage size of reports collection
 */
async function calculateStorageSize() {
  if (!db) return 0;
  
  const snapshot = await db
    .collection('artifacts')
    .doc(APP_ID)
    .collection('match-reports')
    .get();
  
  let totalSize = 0;
  snapshot.forEach(doc => {
    // Estimate size based on JSON string length
    // Multiply by 2 to account for overhead (rough estimate)
    totalSize += JSON.stringify(doc.data()).length * 2;
  });
  
  return totalSize;
}

/**
 * POST /api/calculate-and-save
 * Calculate DLS and save the report to Firestore
 */
app.post('/api/calculate-and-save', async (req, res) => {
  try {
    console.log('📥 Received calculation request');
    
    // Check storage limit before saving
    const currentSize = await calculateStorageSize();
    console.log(`📊 Current storage: ${(currentSize / 1024 / 1024).toFixed(2)} MB`);
    
    if (currentSize >= STORAGE_LIMIT_BYTES) {
      return res.status(507).json({
        success: false,
        error: 'Storage limit reached (850 MB). Please delete some old reports before creating new ones.',
        storageUsed: currentSize,
        storageLimit: STORAGE_LIMIT_BYTES
      });
    }
    
    // Extract data from request body
    const matchData = req.body;
    
    // Perform DLS calculation
    const calculationResult = calculateDLS(matchData);
    
    // Create the match report object
    const matchReport = {
      ...calculationResult,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Save to Firestore
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    const docRef = await db
      .collection('artifacts')
      .doc(APP_ID)
      .collection('match-reports')
      .add(matchReport);
    
    console.log('✅ Report saved with ID:', docRef.id);
    
    // Return the report with its ID
    res.status(201).json({
      success: true,
      id: docRef.id,
      report: matchReport
    });
    
  } catch (error) {
    console.error('❌ Error in calculate-and-save:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports
 * Get all saved match reports
 */
app.get('/api/reports', async (req, res) => {
  try {
    console.log('📥 Fetching all reports');
    
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    const snapshot = await db
      .collection('artifacts')
      .doc(APP_ID)
      .collection('match-reports')
      .orderBy('createdAt', 'desc')
      .get();
    
    const reports = [];
    snapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${reports.length} reports`);
    
    res.json({
      success: true,
      count: reports.length,
      reports
    });
    
  } catch (error) {
    console.error('❌ Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports/:id
 * Get a specific match report by ID
 */
app.get('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📥 Fetching report:', id);
    
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    const doc = await db
      .collection('artifacts')
      .doc(APP_ID)
      .collection('match-reports')
      .doc(id)
      .get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    console.log('✅ Report found');
    
    res.json({
      success: true,
      id: doc.id,
      report: doc.data()
    });
    
  } catch (error) {
    console.error('❌ Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/reports/:id
 * Delete a specific match report
 */
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📥 Deleting report:', id);
    
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    await db
      .collection('artifacts')
      .doc(APP_ID)
      .collection('match-reports')
      .doc(id)
      .delete();
    
    console.log('✅ Report deleted');
    
    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 */
/**
 * GET /api/storage
 * Get current storage usage information
 */
app.get('/api/storage', async (req, res) => {
  try {
    const currentSize = await calculateStorageSize();
    
    res.json({
      success: true,
      storageUsed: currentSize,
      storageLimit: STORAGE_LIMIT_BYTES,
      storageUsedMB: parseFloat((currentSize / 1024 / 1024).toFixed(2)),
      storageLimitMB: parseFloat((STORAGE_LIMIT_BYTES / 1024 / 1024).toFixed(2)),
      percentageUsed: parseFloat(((currentSize / STORAGE_LIMIT_BYTES) * 100).toFixed(2))
    });
  } catch (error) {
    console.error('❌ Error getting storage info:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'not connected'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   DLS 5.0 Calculator API Server        ║
║   Running on http://localhost:${PORT}   ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
