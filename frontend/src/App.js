import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || (
  window.location.hostname === 'localhost' 
    ? 'http://localhost:5001/api' 
    : '/api'
);

function App() {
  // View management
  const [view, setView] = useState('calculator'); // 'calculator', 'reportList', 'reportDetail'
  const [currentReportId, setCurrentReportId] = useState(null);

  // Calculator form state
  const [matchMetadata, setMatchMetadata] = useState({
    team1Name: '',
    team2Name: '',
    venue: '',
    tournamentName: '',
    date: new Date().toISOString().split('T')[0],
    dlsManagerName: ''
  });

  const [matchType, setMatchType] = useState('ODI (50)');
  
  const [team1Innings, setTeam1Innings] = useState({
    oversAtStart: 50,
    finalScore: '',
    oversPlayed: 50,
    stoppages: [{
      oversBalls: '',
      runs: '',
      wickets: '',
      oversLost: ''
    }]
  });

  const [team2Innings, setTeam2Innings] = useState({
    oversAllocated: 50,
    stoppages: [{
      oversBalls: '',
      runs: '',
      wickets: '',
      oversLost: ''
    }],
    penaltyRuns: 0
  });

  // Report list and detail state
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [invalidFields, setInvalidFields] = useState(new Set());
  
  // Storage tracking state
  const [storageInfo, setStorageInfo] = useState({
    storageUsedMB: 0,
    storageLimitMB: 850,
    percentageUsed: 0
  });

  // Auto-calculate total overs based on stoppages
  useEffect(() => {
    // Calculate total overs lost in Team 1 innings
    const team1OversLost = team1Innings.stoppages.reduce((sum, stoppage) => {
      const oversLost = parseFloat(stoppage.oversLost) || 0;
      return sum + oversLost;
    }, 0);
    
    // Calculate total overs lost in Team 2 innings
    const team2OversLost = team2Innings.stoppages.reduce((sum, stoppage) => {
      const oversLost = parseFloat(stoppage.oversLost) || 0;
      return sum + oversLost;
    }, 0);
    
    // Update Team 1 overs played
    setTeam1Innings(prev => ({
      ...prev,
      oversPlayed: prev.oversAtStart - team1OversLost
    }));
    
    // Update Team 2 overs allocated
    setTeam2Innings(prev => ({
      ...prev,
      oversAllocated: team1Innings.oversAtStart - team1OversLost - team2OversLost
    }));
  }, [team1Innings.stoppages, team2Innings.stoppages, team1Innings.oversAtStart]);

  // Update overs when match type changes
  useEffect(() => {
    let overs = 50;
    if (matchType === 'T20 (20)') overs = 20;
    else if (matchType.startsWith('Other')) {
      const match = matchType.match(/\d+/);
      overs = match ? parseInt(match[0]) : 50;
    }
    
    setTeam1Innings(prev => ({
      ...prev,
      oversAtStart: overs,
      oversPlayed: overs
    }));
    setTeam2Innings(prev => ({
      ...prev,
      oversAllocated: overs
    }));
  }, [matchType]);

  // Add stoppage to team innings
  const addStoppage = useCallback((team) => {
    const newStoppage = {
      oversBowled: '0.0',
      runsScoredAtStoppage: 0,
      wicketsDown: 0,
      oversLost: '0.0'
    };

    if (team === 1) {
      setTeam1Innings(prev => ({
        ...prev,
        stoppages: [...prev.stoppages, newStoppage]
      }));
    } else {
      setTeam2Innings(prev => ({
        ...prev,
        stoppages: [...prev.stoppages, newStoppage]
      }));
    }
  }, []);

  // Update stoppage data
  const updateStoppage = useCallback((team, index, field, value) => {
    if (team === 1) {
      setTeam1Innings(prev => {
        const newStoppages = [...prev.stoppages];
        newStoppages[index] = { ...newStoppages[index], [field]: value };
        return { ...prev, stoppages: newStoppages };
      });
    } else {
      setTeam2Innings(prev => {
        const newStoppages = [...prev.stoppages];
        newStoppages[index] = { ...newStoppages[index], [field]: value };
        return { ...prev, stoppages: newStoppages };
      });
    }
  }, []);

  // Remove stoppage
  const removeStoppage = useCallback((team, index) => {
    if (team === 1) {
      setTeam1Innings(prev => ({
        ...prev,
        stoppages: prev.stoppages.filter((_, i) => i !== index)
      }));
    } else {
      setTeam2Innings(prev => ({
        ...prev,
        stoppages: prev.stoppages.filter((_, i) => i !== index)
      }));
    }
  }, []);

  // Fetch storage info
  const fetchStorageInfo = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/storage`);
      const data = await response.json();

      if (data.success) {
        setStorageInfo({
          storageUsedMB: data.storageUsedMB,
          storageLimitMB: data.storageLimitMB,
          percentageUsed: data.percentageUsed
        });
      }
    } catch (err) {
      console.error('Failed to fetch storage info:', err);
    }
  }, []);

  // Validate form data before submission
  const validateForm = useCallback(() => {
    const errors = [];
    const invalidFields = new Set(); // Track which fields have errors

    // Validate match metadata
    if (!matchMetadata.team1Name?.trim()) {
      errors.push('Team 1 name is required');
      invalidFields.add('team1Name');
    }
    if (!matchMetadata.team2Name?.trim()) {
      errors.push('Team 2 name is required');
      invalidFields.add('team2Name');
    }
    if (!matchMetadata.venue?.trim()) {
      errors.push('Venue is required');
      invalidFields.add('venue');
    }
    if (!matchMetadata.date) {
      errors.push('Match date is required');
      invalidFields.add('date');
    }

    // Validate Team 1 innings
    if (!team1Innings.oversAtStart || team1Innings.oversAtStart <= 0) {
      errors.push('Team 1: Overs at Start must be greater than 0');
      invalidFields.add('team1-oversAtStart');
    }
    if (team1Innings.oversAtStart > 200) {
      errors.push('Team 1: Overs at Start cannot exceed 200 (unrealistic value)');
      invalidFields.add('team1-oversAtStart');
    }
    
    if (team1Innings.finalScore === '' || team1Innings.finalScore === null || team1Innings.finalScore === undefined) {
      errors.push('Team 1: Final Score is required');
      invalidFields.add('team1-finalScore');
    }
    if (team1Innings.finalScore < 0) {
      errors.push('Team 1: Final Score cannot be negative');
      invalidFields.add('team1-finalScore');
    }
    if (team1Innings.finalScore > 1000) {
      errors.push('Team 1: Final Score cannot exceed 1000 (unrealistic value)');
      invalidFields.add('team1-finalScore');
    }

    // Validate Team 1 stoppages
    team1Innings.stoppages.forEach((stoppage, idx) => {
      if (stoppage.oversBowled || stoppage.runsScoredAtStoppage || stoppage.wicketsDown || stoppage.oversLost) {
        // If any field is filled, validate all fields
        if (!stoppage.oversBowled?.toString().trim()) {
          errors.push(`Team 1 Stoppage ${idx + 1}: Overs Bowled is required`);
          invalidFields.add(`team1-stoppage-${idx}-oversBowled`);
        } else {
          // Validate overs bowled format and range
          const oversBowled = parseFloat(stoppage.oversBowled);
          const oversAtStart = parseFloat(team1Innings.oversAtStart) || 0;
          if (isNaN(oversBowled) || oversBowled < 0) {
            errors.push(`Team 1 Stoppage ${idx + 1}: Overs Bowled must be a positive number`);
            invalidFields.add(`team1-stoppage-${idx}-oversBowled`);
          } else if (oversBowled > oversAtStart) {
            errors.push(`Team 1 Stoppage ${idx + 1}: Overs Bowled (${oversBowled}) cannot exceed Overs at Start (${oversAtStart})`);
            invalidFields.add(`team1-stoppage-${idx}-oversBowled`);
          }
        }
        
        if (stoppage.runsScoredAtStoppage === '' || stoppage.runsScoredAtStoppage === null || stoppage.runsScoredAtStoppage === undefined) {
          errors.push(`Team 1 Stoppage ${idx + 1}: Runs Scored is required`);
          invalidFields.add(`team1-stoppage-${idx}-runs`);
        } else {
          const runs = parseInt(stoppage.runsScoredAtStoppage);
          const finalScore = parseInt(team1Innings.finalScore) || 0;
          if (isNaN(runs) || runs < 0) {
            errors.push(`Team 1 Stoppage ${idx + 1}: Runs Scored must be a positive number`);
            invalidFields.add(`team1-stoppage-${idx}-runs`);
          } else if (runs > finalScore) {
            errors.push(`Team 1 Stoppage ${idx + 1}: Runs Scored (${runs}) cannot exceed Final Score (${finalScore})`);
            invalidFields.add(`team1-stoppage-${idx}-runs`);
          } else if (runs > 1000) {
            errors.push(`Team 1 Stoppage ${idx + 1}: Runs Scored cannot exceed 1000 (unrealistic value)`);
            invalidFields.add(`team1-stoppage-${idx}-runs`);
          }
        }
        
        if (stoppage.wicketsDown === '' || stoppage.wicketsDown === null || stoppage.wicketsDown === undefined) {
          errors.push(`Team 1 Stoppage ${idx + 1}: Wickets Down is required`);
          invalidFields.add(`team1-stoppage-${idx}-wickets`);
        } else if (stoppage.wicketsDown < 0 || stoppage.wicketsDown > 10) {
          errors.push(`Team 1 Stoppage ${idx + 1}: Wickets Down must be between 0 and 10`);
          invalidFields.add(`team1-stoppage-${idx}-wickets`);
        }
        
        if (!stoppage.oversLost?.toString().trim()) {
          errors.push(`Team 1 Stoppage ${idx + 1}: Overs Lost is required`);
          invalidFields.add(`team1-stoppage-${idx}-oversLost`);
        } else {
          const oversLost = parseFloat(stoppage.oversLost);
          const oversAtStart = parseFloat(team1Innings.oversAtStart) || 0;
          if (isNaN(oversLost) || oversLost < 0) {
            errors.push(`Team 1 Stoppage ${idx + 1}: Overs Lost must be a positive number`);
            invalidFields.add(`team1-stoppage-${idx}-oversLost`);
          } else if (oversLost > oversAtStart) {
            errors.push(`Team 1 Stoppage ${idx + 1}: Overs Lost (${oversLost}) cannot exceed Overs at Start (${oversAtStart})`);
            invalidFields.add(`team1-stoppage-${idx}-oversLost`);
          }
        }
      }
    });

    // Validate Team 2 stoppages
    team2Innings.stoppages.forEach((stoppage, idx) => {
      if (stoppage.oversBowled || stoppage.runsScoredAtStoppage || stoppage.wicketsDown || stoppage.oversLost) {
        const oversAllocated = parseFloat(team2Innings.oversAllocated) || parseFloat(team1Innings.oversAtStart) || 0;
        
        if (!stoppage.oversBowled?.toString().trim()) {
          errors.push(`Team 2 Stoppage ${idx + 1}: Overs Bowled is required`);
          invalidFields.add(`team2-stoppage-${idx}-oversBowled`);
        } else {
          const oversBowled = parseFloat(stoppage.oversBowled);
          if (isNaN(oversBowled) || oversBowled < 0) {
            errors.push(`Team 2 Stoppage ${idx + 1}: Overs Bowled must be a positive number`);
            invalidFields.add(`team2-stoppage-${idx}-oversBowled`);
          } else if (oversBowled > oversAllocated) {
            errors.push(`Team 2 Stoppage ${idx + 1}: Overs Bowled (${oversBowled}) cannot exceed Overs Allocated (${oversAllocated})`);
            invalidFields.add(`team2-stoppage-${idx}-oversBowled`);
          }
        }
        
        if (stoppage.runsScoredAtStoppage === '' || stoppage.runsScoredAtStoppage === null || stoppage.runsScoredAtStoppage === undefined) {
          errors.push(`Team 2 Stoppage ${idx + 1}: Runs Scored is required`);
          invalidFields.add(`team2-stoppage-${idx}-runs`);
        } else {
          const runs = parseInt(stoppage.runsScoredAtStoppage);
          if (isNaN(runs) || runs < 0) {
            errors.push(`Team 2 Stoppage ${idx + 1}: Runs Scored must be a positive number`);
            invalidFields.add(`team2-stoppage-${idx}-runs`);
          } else if (runs > 1000) {
            errors.push(`Team 2 Stoppage ${idx + 1}: Runs Scored cannot exceed 1000 (unrealistic value)`);
            invalidFields.add(`team2-stoppage-${idx}-runs`);
          }
        }
        
        if (stoppage.wicketsDown === '' || stoppage.wicketsDown === null || stoppage.wicketsDown === undefined) {
          errors.push(`Team 2 Stoppage ${idx + 1}: Wickets Down is required`);
          invalidFields.add(`team2-stoppage-${idx}-wickets`);
        } else if (stoppage.wicketsDown < 0 || stoppage.wicketsDown > 10) {
          errors.push(`Team 2 Stoppage ${idx + 1}: Wickets Down must be between 0 and 10`);
          invalidFields.add(`team2-stoppage-${idx}-wickets`);
        }
        
        if (!stoppage.oversLost?.toString().trim()) {
          errors.push(`Team 2 Stoppage ${idx + 1}: Overs Lost is required`);
          invalidFields.add(`team2-stoppage-${idx}-oversLost`);
        } else {
          const oversLost = parseFloat(stoppage.oversLost);
          if (isNaN(oversLost) || oversLost < 0) {
            errors.push(`Team 2 Stoppage ${idx + 1}: Overs Lost must be a positive number`);
            invalidFields.add(`team2-stoppage-${idx}-oversLost`);
          } else if (oversLost > oversAllocated) {
            errors.push(`Team 2 Stoppage ${idx + 1}: Overs Lost (${oversLost}) cannot exceed Overs Allocated (${oversAllocated})`);
            invalidFields.add(`team2-stoppage-${idx}-oversLost`);
          }
        }
      }
    });

    return { errors, invalidFields };
  }, [matchMetadata, team1Innings, team2Innings]);

  // Calculate and save report
  const handleCalculateAndSave = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setInvalidFields(new Set()); // Clear previous invalid fields

    // Validate form
    const { errors: validationErrors, invalidFields: newInvalidFields } = validateForm();
    if (validationErrors.length > 0) {
      setInvalidFields(newInvalidFields);
      setError(
        <div>
          <p className="font-bold mb-2">Please fix the following {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}:</p>
          <ul className="list-disc list-inside space-y-1 max-h-60 overflow-y-auto">
            {validationErrors.map((err, idx) => (
              <li key={idx} className="text-sm">{err}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm font-semibold">💡 Fields with errors are highlighted in red below.</p>
        </div>
      );
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/calculate-and-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...matchMetadata,
          matchType,
          team1Innings,
          team2Innings,
          penaltyRuns: team2Innings.penaltyRuns || 0
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentReportId(data.id);
        setCurrentReport(data.report);
        await fetchStorageInfo(); // Update storage info after save
        setInvalidFields(new Set()); // Clear invalid fields on success
        setSuccessMessage('Report calculated and saved successfully! 🎉');
        // Clear success message after showing report
        setTimeout(() => setSuccessMessage(null), 500);
        setView('reportDetail');
      } else {
        // Show specific error for storage limit
        if (response.status === 507) {
          setError('Storage limit reached (850 MB). Please delete some old reports before creating new ones.');
        } else {
          setError(data.error || 'Failed to calculate and save report');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  }, [matchMetadata, matchType, team1Innings, team2Innings, fetchStorageInfo, validateForm]);

  // Fetch all reports
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/reports`);
      const data = await response.json();

      if (data.success) {
        setReports(data.reports);
      } else {
        setError(data.error || 'Failed to fetch reports');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a report
  const deleteReport = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        // Refresh the reports list and storage info
        await fetchReports();
        await fetchStorageInfo();
        // If we're viewing this report, go back to list
        if (currentReportId === id) {
          setView('reportList');
        }
      } else {
        setError(data.error || 'Failed to delete report');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentReportId, fetchReports, fetchStorageInfo]);

  // Fetch single report
  const fetchReport = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}`);
      const data = await response.json();

      if (data.success) {
        setCurrentReport(data.report);
        setCurrentReportId(id);
        setView('reportDetail');
      } else {
        setError(data.error || 'Failed to fetch report');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculator View Component
  const CalculatorView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">DLS 5.0 Calculator</h1>
              <p className="text-blue-100 mt-1 text-sm sm:text-base">Duckworth-Lewis-Stern Method</p>
            </div>
            <button
              onClick={() => {
                fetchReports();
                fetchStorageInfo();
                setView('reportList');
              }}
              className="bg-white text-blue-600 px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md min-h-[44px] text-sm sm:text-base w-full sm:w-auto"
            >
              View Saved Reports
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-500 text-red-900 p-4 sm:p-6 mb-4 sm:mb-6 rounded-xl shadow-xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 mr-3 sm:mr-4 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <p className="font-bold text-lg sm:text-2xl text-red-700">⚠️ Validation Failed</p>
                  <button 
                    onClick={() => {setError(null); setInvalidFields(new Set());}}
                    className="text-red-600 hover:text-red-800 font-semibold text-xs sm:text-sm min-h-[44px] px-3"
                  >
                    ✕ Dismiss
                  </button>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-4 border border-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-500 text-green-900 p-6 mb-6 rounded-xl shadow-xl">
            <div className="flex items-start">
              <svg className="w-8 h-8 text-green-600 mr-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-bold text-2xl text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Match Metadata */}
        <div className="bg-white rounded-xl shadow-even-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
            Match Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team 1 Name *</label>
              <input
                type="text"
                value={matchMetadata.team1Name || ''}
                onChange={(e) => setMatchMetadata(prev => ({ ...prev, team1Name: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  invalidFields.has('team1Name') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., India"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team 2 Name *</label>
              <input
                type="text"
                value={matchMetadata.team2Name || ''}
                onChange={(e) => setMatchMetadata(prev => ({ ...prev, team2Name: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  invalidFields.has('team2Name') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., Australia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue *</label>
              <input
                type="text"
                value={matchMetadata.venue || ''}
                onChange={(e) => setMatchMetadata(prev => ({ ...prev, venue: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  invalidFields.has('venue') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., Lord's Cricket Ground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tournament *</label>
              <input
                type="text"
                value={matchMetadata.tournamentName || ''}
                onChange={(e) => setMatchMetadata(prev => ({ ...prev, tournamentName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., ICC World Cup 2023"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={matchMetadata.date || ''}
                onChange={(e) => setMatchMetadata(prev => ({ ...prev, date: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  invalidFields.has('date') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DLS Manager Name</label>
              <input
                type="text"
                value={matchMetadata.dlsManagerName || ''}
                onChange={(e) => setMatchMetadata(prev => ({ ...prev, dlsManagerName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., John Smith"
              />
            </div>
          </div>
        </div>

        {/* Match Type */}
        <div className="bg-white rounded-xl shadow-even-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
            Match Type
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="ODI (50)"
                checked={matchType === 'ODI (50)'}
                onChange={(e) => setMatchType(e.target.value)}
                className="mr-2"
              />
              <span className="font-medium">ODI (50 overs)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="T20 (20)"
                checked={matchType === 'T20 (20)'}
                onChange={(e) => setMatchType(e.target.value)}
                className="mr-2"
              />
              <span className="font-medium">T20 (20 overs)</span>
            </label>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Other"
                  checked={matchType.startsWith('Other')}
                  onChange={(e) => setMatchType('Other (50)')}
                  className="mr-2"
                />
                <span className="font-medium">Other:</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                disabled={!matchType.startsWith('Other')}
                value={matchType.startsWith('Other') ? matchType.match(/\d+/)?.[0] || '50' : '50'}
                onChange={(e) => setMatchType(`Other (${e.target.value})`)}
                className="ml-2 w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2">overs</span>
            </div>
          </div>
        </div>

        {/* Team 1 Innings */}
        <div className="bg-white rounded-xl shadow-even-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
            Team 1 Innings ({matchMetadata.team1Name || 'Team 1'})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Overs at Start *</label>
              <input
                type="number"
                value={team1Innings.oversAtStart || ''}
                onChange={(e) => setTeam1Innings(prev => ({ ...prev, oversAtStart: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  invalidFields.has('team1-oversAtStart') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., 50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Final Score *</label>
              <input
                type="number"
                value={team1Innings.finalScore || ''}
                onChange={(e) => setTeam1Innings(prev => ({ ...prev, finalScore: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  invalidFields.has('team1-finalScore') ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., 287"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overs Played
                <span className="text-xs text-gray-500 ml-2">(Auto-calculated)</span>
              </label>
              <input
                type="number"
                value={team1Innings.oversPlayed || ''}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                title="Auto-calculated based on overs at start and overs lost"
              />
            </div>
          </div>

          {/* Stoppages */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Stoppages / Interruptions</h3>
              <button
                onClick={() => addStoppage(1)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                + Add Stoppage
              </button>
            </div>
            
            {team1Innings.stoppages.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">No stoppages added. Click "Add Stoppage" if there were any interruptions.</p>
            ) : (
              <div className="space-y-3">
                {team1Innings.stoppages.map((stoppage, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-700">Stoppage {idx + 1}</h4>
                      <button
                        onClick={() => removeStoppage(1, idx)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Overs Bowled *</label>
                        <input
                          type="text"
                          value={stoppage.oversBowled || ''}
                          onChange={(e) => updateStoppage(1, idx, 'oversBowled', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                            invalidFields.has(`team1-stoppage-${idx}-oversBowled`) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 25.3"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: 25.3 (25 overs, 3 balls)</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Runs Scored *</label>
                        <input
                          type="number"
                          value={stoppage.runsScoredAtStoppage || ''}
                          onChange={(e) => updateStoppage(1, idx, 'runsScoredAtStoppage', e.target.value === '' ? '' : parseInt(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                            invalidFields.has(`team1-stoppage-${idx}-runs`) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 145"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Wickets Down *</label>
                        <input
                          type="number"
                          min="0"
                          max="9"
                          value={stoppage.wicketsDown || ''}
                          onChange={(e) => updateStoppage(1, idx, 'wicketsDown', e.target.value === '' ? '' : parseInt(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                            invalidFields.has(`team1-stoppage-${idx}-wickets`) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Overs Lost *</label>
                        <input
                          type="text"
                          value={stoppage.oversLost || ''}
                          onChange={(e) => updateStoppage(1, idx, 'oversLost', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                            invalidFields.has(`team1-stoppage-${idx}-oversLost`) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 5.0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: 5.0 (5 overs)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team 2 Innings */}
        <div className="bg-white rounded-xl shadow-even-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">4</span>
            Team 2 Innings ({matchMetadata.team2Name || 'Team 2'})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overs Allocated
                <span className="text-xs text-gray-500 ml-2">(Auto-calculated)</span>
              </label>
              <input
                type="number"
                value={team2Innings.oversAllocated || 0}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                title="Auto-calculated based on match overs and total overs lost"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Penalty Runs</label>
              <input
                type="number"
                value={team2Innings.penaltyRuns || 0}
                onChange={(e) => setTeam2Innings(prev => ({ ...prev, penaltyRuns: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>

          {/* Stoppages */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Stoppages / Interruptions</h3>
              <button
                onClick={() => addStoppage(2)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
              >
                + Add Stoppage
              </button>
            </div>
            
            {team2Innings.stoppages.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">No stoppages added. Click "Add Stoppage" if there were any interruptions.</p>
            ) : (
              <div className="space-y-3">
                {team2Innings.stoppages.map((stoppage, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-700">Stoppage {idx + 1}</h4>
                      <button
                        onClick={() => removeStoppage(2, idx)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Overs Bowled *</label>
                        <input
                          type="text"
                          value={stoppage.oversBowled || ''}
                          onChange={(e) => updateStoppage(2, idx, 'oversBowled', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                            invalidFields.has(`team2-stoppage-${idx}-oversBowled`) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 25.3"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: 25.3 (25 overs, 3 balls)</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Runs Scored *</label>
                        <input
                          type="number"
                          value={stoppage.runsScoredAtStoppage || ''}
                          onChange={(e) => updateStoppage(2, idx, 'runsScoredAtStoppage', e.target.value === '' ? '' : parseInt(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                            invalidFields.has(`team2-stoppage-${idx}-runs`) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 145"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Wickets Down *</label>
                        <input
                          type="number"
                          min="0"
                          max="9"
                          value={stoppage.wicketsDown || ''}
                          onChange={(e) => updateStoppage(2, idx, 'wicketsDown', e.target.value === '' ? '' : parseInt(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                            invalidFields.has(`team2-stoppage-${idx}-wickets`) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Overs Lost *</label>
                        <input
                          type="text"
                          value={stoppage.oversLost || ''}
                          onChange={(e) => updateStoppage(2, idx, 'oversLost', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${
                            invalidFields.has(`team2-stoppage-${idx}-oversLost`) ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 5.0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: 5.0 (5 overs)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Calculate Button */}
        <div className="bg-white rounded-xl shadow-even-lg p-6">
          <button
            onClick={handleCalculateAndSave}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 rounded-lg text-xl font-bold hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </span>
            ) : (
              '🎯 Calculate DLS & Generate Report'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Report List View Component
  const ReportListView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Saved Reports</h1>
              <p className="text-blue-100 mt-1">View all DLS calculation reports</p>
            </div>
            <button
              onClick={() => setView('calculator')}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md"
            >
              ← Back to Calculator
            </button>
          </div>
          
          {/* Storage Usage Bar */}
          <div className="mt-4 bg-blue-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Storage Usage</span>
              <span className="text-sm">{storageInfo.storageUsedMB} MB / {storageInfo.storageLimitMB} MB</span>
            </div>
            <div className="w-full bg-blue-900 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  storageInfo.percentageUsed > 90 ? 'bg-red-400' : 
                  storageInfo.percentageUsed > 75 ? 'bg-yellow-400' : 
                  'bg-green-400'
                }`}
                style={{ width: `${Math.min(storageInfo.percentageUsed, 100)}%` }}
              />
            </div>
            <div className="text-xs text-blue-200 mt-1">
              {parseFloat(storageInfo.percentageUsed).toFixed(1)}% used
              {storageInfo.percentageUsed > 90 && ' - Please delete old reports to free up space'}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-even-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Reports Yet</h2>
            <p className="text-gray-600 mb-6">Create your first DLS calculation report</p>
            <button
              onClick={() => setView('calculator')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Calculator
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-even-lg p-6 hover:shadow-even-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 text-blue-600 rounded-lg px-3 py-1 text-sm font-semibold">
                    {report.tournamentName || 'Tournament'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {report.date ? new Date(report.date).toLocaleDateString() : ''}
                  </div>
                </div>
                
                <div className="mb-4 cursor-pointer" onClick={() => fetchReport(report.id)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg text-gray-800">{report.team1Name || 'Team 1'}</span>
                    <span className="text-2xl font-bold text-gray-900">{report.team1Score}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">vs</div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-gray-800">{report.team2Name || 'Team 2'}</span>
                    <span className="text-lg font-semibold text-blue-600">Target: {report.team2Target}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-600 mb-3">
                    <div className="flex items-center justify-between">
                      <span>📍 {report.venue || 'Venue'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchReport(report.id)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteReport(report.id);
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
                      title="Delete Report"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Report Detail View Component (with print-friendly design)
  const ReportDetailView = () => {
    if (!currentReport) return null;

    const handlePrint = async () => {
      const isMobileOrTablet = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.matchMedia('(max-width: 1024px)').matches;

      if (isMobileOrTablet) {
        try {
          const reportContent = document.querySelector('[data-report-content="true"]');
          if (!reportContent) {
            throw new Error('Report content not found');
          }

          const html2canvas = (await import('html2canvas')).default;
          const { jsPDF } = await import('jspdf');

          const canvas = await html2canvas(reportContent, {
            scale: 2,
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff',
            removeContainer: true,
            imageTimeout: 0,
            allowTaint: false
          });

          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
          });

          const pageWidth = 210;
          const pageHeight = 297;
          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const imgData = canvas.toDataURL('image/jpeg', 0.9);

          let renderedHeight = imgHeight;
          let yOffset = 0;

          pdf.addImage(imgData, 'JPEG', 0, yOffset, imgWidth, imgHeight);
          renderedHeight -= pageHeight;

          while (renderedHeight > 0) {
            yOffset = renderedHeight - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, yOffset, imgWidth, imgHeight);
            renderedHeight -= pageHeight;
          }

          const matchDate = new Date(currentReport.date).toISOString().split('T')[0];
          const fileName = `DLS_Report_${currentReport.team1Name}_vs_${currentReport.team2Name}_${matchDate}`.replace(/[^a-z0-9_-]/gi, '_');
          pdf.save(`${fileName}.pdf`);
          return;
        } catch (err) {
          setError(`Unable to generate PDF on this device: ${err.message}`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      // Set document title for the PDF filename
      const originalTitle = document.title;
      const matchDate = new Date(currentReport.date).toISOString().split('T')[0]; // YYYY-MM-DD format
      const newTitle = `DLS_Report_${currentReport.team1Name}_vs_${currentReport.team2Name}_${matchDate}`.replace(/[^a-z0-9_-]/gi, '_');
      
      // Set title before print
      document.title = newTitle;
      
      // Use setTimeout to ensure title is set before print dialog opens
      setTimeout(() => {
        window.print();
        
        // Restore original title after printing
        const afterPrint = () => {
          document.title = originalTitle;
          window.removeEventListener('afterprint', afterPrint);
        };
        window.addEventListener('afterprint', afterPrint);
        
        // Fallback: restore after 2 seconds if afterprint doesn't fire
        setTimeout(() => {
          if (document.title === newTitle) {
            document.title = originalTitle;
          }
        }, 2000);
      }, 100);
    };

    /* SHARE BUTTON - COMMENTED OUT FOR NOW
    const handleShare = async () => {
      // On mobile: generate PDF using print and share
      if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        try {
          // Show loading indicator
          const originalText = document.querySelector('.bg-green-500')?.textContent;
          const shareButton = document.querySelector('.bg-green-500');
          if (shareButton) shareButton.textContent = 'Generating PDF...';
          
          // Import html2canvas and jspdf dynamically
          const html2canvas = (await import('html2canvas')).default;
          const { jsPDF } = await import('jspdf');
          
          // Get the report content
          const reportContent = document.querySelector('.container.mx-auto.px-2');
          if (!reportContent) {
            alert('Report content not found');
            if (shareButton && originalText) shareButton.textContent = originalText;
            return;
          }
          
          // Generate canvas from HTML with optimized settings for smaller file size
          const canvas = await html2canvas(reportContent, {
            scale: 1.5, // Reduced from 2 to 1.5 for smaller file size
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff',
            removeContainer: true,
            imageTimeout: 0,
            allowTaint: false
          });
          
          // Create PDF with JPEG compression for smaller file size
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true // Enable PDF compression
          });
          
          const imgWidth = 210; // A4 width in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Convert to JPEG with compression (much smaller than PNG)
          const imgData = canvas.toDataURL('image/jpeg', 0.85); // 85% quality
          
          // Add image to PDF
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
          
          // Add footer text
          pdf.setFontSize(8);
          pdf.setTextColor(128, 128, 128);
          pdf.text('DLS 5.0 Calculator', 105, 290, { align: 'center' });
          
          // Convert PDF to blob
          const pdfBlob = pdf.output('blob');
          
          // Check file size (WhatsApp has limits around 16MB for documents)
          const fileSizeMB = pdfBlob.size / (1024 * 1024);
          console.log(`PDF size: ${fileSizeMB.toFixed(2)} MB`);
          
          if (fileSizeMB > 15) {
            alert('PDF file is too large for sharing. Please try using Print PDF instead.');
            if (shareButton && originalText) shareButton.textContent = originalText;
            return;
          }
          
          // Create file from blob with sanitized filename
          const fileName = `DLS_${currentReport.team1Name.replace(/[^a-z0-9]/gi, '_')}_vs_${currentReport.team2Name.replace(/[^a-z0-9]/gi, '_')}.pdf`;
          const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
          
          // Restore button text
          if (shareButton && originalText) shareButton.textContent = originalText;
          
          // Check if files can be shared
          if (navigator.canShare && !navigator.canShare({ files: [file] })) {
            // Fallback: try sharing without files (just text)
            await navigator.share({
              title: `DLS Match Report: ${currentReport.team1Name} vs ${currentReport.team2Name}`,
              text: `${currentReport.team1Name} ${currentReport.team1Score} vs ${currentReport.team2Name} (Target: ${currentReport.team2Target})\n\nView full report at: ${window.location.href}`
            });
            return;
          }
          
          // Share the PDF file
          await navigator.share({
            files: [file],
            title: `DLS Match Report: ${currentReport.team1Name} vs ${currentReport.team2Name}`,
            text: `Match Report - ${currentReport.team1Name} vs ${currentReport.team2Name}`
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Share error:', err);
            alert(`Unable to share PDF: ${err.message}. Please try using Print PDF instead.`);
          }
        }
      } else {
        // For desktop: open print dialog for PDF save
        window.print();
      }
    };
    */

    return (
      <div className="min-h-screen bg-white">
        {/* Navigation bar - hide on print */}
        <div className="print:hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-10">
          <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex gap-2 sm:gap-4 flex-wrap">
                <button
                  onClick={() => setView('calculator')}
                  className="bg-white text-blue-600 px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm sm:text-base flex-1 sm:flex-initial min-h-[44px]"
                >
                  ← Calculator
                </button>
                <button
                  onClick={() => {
                    fetchReports();
                    setView('reportList');
                  }}
                  className="bg-white text-blue-600 px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm sm:text-base flex-1 sm:flex-initial min-h-[44px]"
                >
                  All Reports
                </button>
              </div>
              <div className="flex gap-2 sm:gap-3">
                {/* SHARE BUTTON COMMENTED OUT - WhatsApp compatibility issues
                Share functionality temporarily disabled due to mobile compatibility
                Print PDF works better: saves to Files app, then share from there
                <button
                  className="bg-green-500 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md flex items-center justify-center gap-2 text-sm sm:text-base flex-1 sm:flex-initial min-h-[44px]"
                >
                  📧 Share PDF
                </button>
                */}
                <button
                  onClick={handlePrint}
                  className="bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-md flex items-center justify-center gap-2 text-sm sm:text-base flex-1 sm:flex-initial min-h-[44px]"
                  title="Save as PDF"
                >
                  🖨️ Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Print Title - only visible when printing */}
        <div className="print-title hidden print:block text-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            {currentReport.team1Name} vs {currentReport.team2Name}
          </h1>
          <p className="text-sm text-gray-600">
            {currentReport.tournamentName} • {new Date(currentReport.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Report Content */}
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl" data-report-content="true">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-2xl p-4 sm:p-8 print:rounded-none">
            <div className="text-center">
              <h1 className="text-2xl sm:text-4xl font-bold mb-2">DLS 5.0 Match Report</h1>
              <p className="text-base sm:text-xl text-blue-100">{currentReport.tournamentName}</p>
              <p className="text-sm sm:text-lg text-blue-200 mt-2">{currentReport.venue} • {new Date(currentReport.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Match Summary */}
          <div className="bg-white border-x border-gray-200 p-4 sm:p-8">
            <div className="grid grid-cols-1 gap-4 sm:gap-8 mb-4 sm:mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 border-2 border-green-300">
                <div className="text-xs sm:text-sm font-semibold text-green-800 mb-2">TEAM 1 - BATTING FIRST</div>
                <div className="text-xl sm:text-3xl font-bold text-green-900 mb-2">{currentReport.team1Name}</div>
                <div className="flex items-baseline gap-2 sm:gap-3">
                  <span className="text-3xl sm:text-5xl font-bold text-green-700">{currentReport.team1Score}</span>
                  <span className="text-base sm:text-xl text-green-600">({currentReport.team1OversPlayed} overs)</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border-2 border-blue-300">
                <div className="text-xs sm:text-sm font-semibold text-blue-800 mb-2">TEAM 2 - CHASING</div>
                <div className="text-xl sm:text-3xl font-bold text-blue-900 mb-2">{currentReport.team2Name}</div>
                <div className="flex items-baseline gap-2 sm:gap-3">
                  <span className="text-base sm:text-xl text-blue-700 font-semibold">Target:</span>
                  <span className="text-3xl sm:text-5xl font-bold text-blue-700">{currentReport.team2Target}</span>
                  <span className="text-base sm:text-xl text-blue-600">({currentReport.team2OversAllocated} overs)</span>
                </div>
              </div>
            </div>

            {/* DLS Calculation Summary */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4">DLS Calculation Summary</h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white p-3 sm:p-4 rounded-lg text-center">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Team 1 Resource</div>
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">{currentReport.R1_final?.toFixed(2)}%</div>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-lg text-center">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Team 2 Resource</div>
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">{currentReport.R2_final?.toFixed(2)}%</div>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-lg text-center">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Match Type</div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-800">{currentReport.totalOvers} Overs</div>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-lg text-center">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Par Score Type</div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-800">Cumulative</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stoppages Details */}
          {(currentReport.stoppages_inn_1?.length > 0 || currentReport.stoppages_inn_2?.length > 0) && (
            <div className="bg-white border-x border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Match Stoppages</h2>
              
              {currentReport.stoppages_inn_1?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-green-700 mb-3">{currentReport.team1Name} Innings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-green-100">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">#</th>
                          <th className="px-4 py-2 text-left font-semibold">Overs Bowled</th>
                          <th className="px-4 py-2 text-left font-semibold">Runs</th>
                          <th className="px-4 py-2 text-left font-semibold">Wickets Down</th>
                          <th className="px-4 py-2 text-left font-semibold">Overs Lost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentReport.stoppages_inn_1.map((stop, idx) => (
                          <tr key={idx} className="border-b hover:bg-green-50">
                            <td className="px-4 py-2">{idx + 1}</td>
                            <td className="px-4 py-2 font-medium">{stop.oversBowled}</td>
                            <td className="px-4 py-2">{stop.runsScoredAtStoppage}</td>
                            <td className="px-4 py-2">{stop.wicketsDown}</td>
                            <td className="px-4 py-2 font-medium text-red-600">{stop.oversLost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {currentReport.stoppages_inn_2?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-3">{currentReport.team2Name} Innings</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-blue-100">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">#</th>
                          <th className="px-4 py-2 text-left font-semibold">Overs Bowled</th>
                          <th className="px-4 py-2 text-left font-semibold">Runs</th>
                          <th className="px-4 py-2 text-left font-semibold">Wickets Down</th>
                          <th className="px-4 py-2 text-left font-semibold">Overs Lost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentReport.stoppages_inn_2.map((stop, idx) => (
                          <tr key={idx} className="border-b hover:bg-blue-50">
                            <td className="px-4 py-2">{idx + 1}</td>
                            <td className="px-4 py-2 font-medium">{stop.oversBowled}</td>
                            <td className="px-4 py-2">{stop.runsScoredAtStoppage}</td>
                            <td className="px-4 py-2">{stop.wicketsDown}</td>
                            <td className="px-4 py-2 font-medium text-red-600">{stop.oversLost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Par Score Tables */}
          <div className="bg-white border-x border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Over-by-Over Par Scores</h2>
            <p className="text-sm text-gray-600 mb-4">Cumulative par score for a tie at each over, grouped by overs bowled, overs remaining, and wickets down.</p>
            <div className="overflow-x-auto print:text-xs">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="border border-gray-300 px-2 py-2">Overs Bowled</th>
                    <th className="border border-gray-300 px-2 py-2">Overs Remaining</th>
                    <th className="border border-gray-300 px-2 py-2">0</th>
                    <th className="border border-gray-300 px-2 py-2">1</th>
                    <th className="border border-gray-300 px-2 py-2">2</th>
                    <th className="border border-gray-300 px-2 py-2">3</th>
                    <th className="border border-gray-300 px-2 py-2">4</th>
                    <th className="border border-gray-300 px-2 py-2">5</th>
                    <th className="border border-gray-300 px-2 py-2">6</th>
                    <th className="border border-gray-300 px-2 py-2">7</th>
                    <th className="border border-gray-300 px-2 py-2">8</th>
                    <th className="border border-gray-300 px-2 py-2">9</th>
                  </tr>
                  <tr className="bg-gray-100 text-xs text-gray-600">
                    <th className="border border-gray-300 px-2 py-1" colSpan="2">Wickets Down →</th>
                    <th className="border border-gray-300 px-1 py-1" colSpan="10"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentReport.parScoreTable_OO && Object.keys(currentReport.parScoreTable_OO).sort((a, b) => Number(a) - Number(b)).map((over) => {
                    const overNum = Number(over);
                    const remaining = currentReport.totalOvers - overNum;
                    const scores = currentReport.parScoreTable_OO[over];
                    
                    return (
                      <tr key={over} className={overNum % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border border-gray-300 px-2 py-2 font-semibold text-center">{over}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">{remaining}</td>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(wicket => (
                          <td key={wicket} className="border border-gray-300 px-2 py-2 text-center font-medium">
                            {scores[wicket] !== undefined ? scores[wicket] : '-'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ball-by-Ball Par Scores - Scrollable */}
          <div className="bg-white border border-gray-200 p-8 print:break-before-page">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ball-by-Ball Par Scores</h2>
            <p className="text-sm text-gray-600 mb-4">Cumulative par score for a tie after each completed legal ball, based on wickets down.</p>
            <div className="max-h-96 overflow-y-auto print:max-h-none print:overflow-visible">
              <div className="overflow-x-auto print:text-xs">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 bg-white print:relative">
                    <tr className="bg-gray-800 text-white">
                      <th className="border border-gray-300 px-2 py-2">Over.Ball</th>
                      <th className="border border-gray-300 px-2 py-2">0</th>
                      <th className="border border-gray-300 px-2 py-2">1</th>
                      <th className="border border-gray-300 px-2 py-2">2</th>
                      <th className="border border-gray-300 px-2 py-2">3</th>
                      <th className="border border-gray-300 px-2 py-2">4</th>
                      <th className="border border-gray-300 px-2 py-2">5</th>
                      <th className="border border-gray-300 px-2 py-2">6</th>
                      <th className="border border-gray-300 px-2 py-2">7</th>
                      <th className="border border-gray-300 px-2 py-2">8</th>
                      <th className="border border-gray-300 px-2 py-2">9</th>
                    </tr>
                    <tr className="bg-gray-100 text-xs text-gray-600">
                      <th className="border border-gray-300 px-2 py-1">Wickets Down →</th>
                      <th className="border border-gray-300 px-1 py-1" colSpan="10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReport.parScoreTable_BB && Object.keys(currentReport.parScoreTable_BB).sort((a, b) => Number(a) - Number(b)).map((over) => {
                      const balls = currentReport.parScoreTable_BB[over];
                      
                      return Object.keys(balls).sort((a, b) => Number(a) - Number(b)).map((ball) => {
                        const scores = balls[ball];
                        const totalBallsBowled = (Number(over) * 6) + Number(ball) + 1;
                        const displayOver = Math.floor(totalBallsBowled / 6);
                        const displayBall = totalBallsBowled % 6;
                        const overBall = `${displayOver}.${displayBall}`;
                        
                        return (
                          <tr key={overBall} className={Number(over) % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="border border-gray-300 px-2 py-2 font-semibold text-center">{overBall}</td>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(wicket => (
                              <td key={wicket} className="border border-gray-300 px-2 py-2 text-center font-medium">
                                {scores[wicket] !== undefined ? scores[wicket] : '-'}
                              </td>
                            ))}
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-b-2xl p-6 print:rounded-none">
            <div className="text-center">
              <p className="text-sm">DLS Manager: {currentReport.dlsManagerName || 'Not specified'}</p>
              <p className="text-xs text-blue-200 mt-2">Generated by DLS 5.0 Calculator • © {new Date().getFullYear()} International Cricket Council</p>
              <p className="text-xs text-blue-200 mt-1">Report ID: {currentReportId}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {view === 'calculator' && CalculatorView()}
      {view === 'reportList' && ReportListView()}
      {view === 'reportDetail' && ReportDetailView()}
    </>
  );
}

export default App;
