const { getResource, oversBallsToDecimal } = require('./dlsResourceTable');

/**
 * Calculate DLS resources and target for a match
 * @param {Object} matchData - All match data
 * @returns {Object} Calculation results including target and par scores
 */
function calculateDLS(matchData) {
  // Validate input data
  if (!matchData) {
    throw new Error('Match data is required');
  }

  const {
    matchType,
    team1Name,
    team2Name,
    venue,
    tournamentName,
    date,
    dlsManagerName,
    team1Innings,
    team2Innings,
    penaltyRuns = 0
  } = matchData;

  // Validate required fields
  if (!team1Name || !team2Name) {
    throw new Error('Both team names are required');
  }

  if (!team1Innings || !team2Innings) {
    throw new Error('Both innings data are required');
  }

  if (team1Innings.finalScore === undefined || team1Innings.finalScore === null) {
    throw new Error('Team 1 final score is required');
  }

  if (!team1Innings.oversAtStart || team1Innings.oversAtStart <= 0) {
    throw new Error('Team 1 overs at start must be greater than 0');
  }

  // Determine total overs based on match type
  let totalOvers = 50;
  if (matchType === 'T20 (20)') totalOvers = 20;
  else if (matchType.startsWith('Other')) {
    const match = matchType.match(/\d+/);
    totalOvers = match ? parseInt(match[0]) : 50;
  }

  // Calculate Team 1's resource
  const { resources: R1_data, finalResource: R1_final } = calculateInningsResource(
    team1Innings,
    totalOvers
  );

  // Calculate Team 2's resource
  const { resources: R2_data, finalResource: R2_final } = calculateInningsResource(
    team2Innings,
    totalOvers
  );

  // Calculate Team 2's target
  const team1Score = team1Innings.finalScore;
  let team2Target;

  team2Target = Math.floor(team1Score * (R2_final / R1_final)) + 1;

  // Apply penalty runs
  team2Target += penaltyRuns;

  // Generate par score tables
  const parScoreTable_OO = generateParScoreTable(team1Score, R1_final, totalOvers, false);
  const parScoreTable_BB = generateParScoreTable(team1Score, R1_final, totalOvers, true);

  return {
    team1Name,
    team2Name,
    venue,
    tournamentName,
    date,
    dlsManagerName,
    team1Score,
    team1OversPlayed: team1Innings.oversPlayed,
    team2Target,
    team2OversAllocated: team2Innings.oversAllocated || totalOvers,
    R1_initial: R1_data.initial,
    R1_final,
    R2_initial: R2_data.initial,
    R2_final,
    stoppages_inn_1: team1Innings.stoppages || [],
    stoppages_inn_2: team2Innings.stoppages || [],
    parScoreTable_OO,
    parScoreTable_BB,
    totalOvers
  };
}

/**
 * Calculate resource for a single innings
 * @param {Object} innings - Innings data
 * @param {number} totalOvers - Total overs in the match
 * @returns {Object} Resource calculation results
 */
function calculateInningsResource(innings, totalOvers) {
  const { oversAtStart = totalOvers, stoppages = [] } = innings;
  
  // Initial resource (at start of innings with 0 wickets down)
  const initial = getResource(oversAtStart, 0, totalOvers);
  
  let currentResource = initial;
  const resourceHistory = [{ point: 'Start', resource: initial }];
  
  // Process each stoppage
  for (let i = 0; i < stoppages.length; i++) {
    const stoppage = stoppages[i];
    const { oversBowled, wicketsDown, oversLost } = stoppage;
    
    // Convert overs.balls to decimal
    const oversBowledDecimal = oversBallsToDecimal(oversBowled);
    const oversLostDecimal = oversBallsToDecimal(oversLost);
    
    // Calculate overs remaining before stoppage
    const oversRemainingBefore = oversAtStart - oversBowledDecimal;
    
    // Resource available before stoppage
    const resourceBefore = getResource(oversRemainingBefore, wicketsDown, totalOvers);
    
    // Calculate overs remaining after stoppage
    const oversRemainingAfter = oversRemainingBefore - oversLostDecimal;
    
    // Resource available after stoppage
    const resourceAfter = getResource(oversRemainingAfter, wicketsDown, totalOvers);
    
    // Resource lost in this stoppage
    const resourceLost = resourceBefore - resourceAfter;
    
    // Update current resource
    currentResource -= resourceLost;
    
    resourceHistory.push({
      stoppage: i + 1,
      oversBowled,
      wicketsDown,
      oversLost,
      resourceBefore,
      resourceAfter,
      resourceLost,
      currentResource
    });
  }
  
  return {
    initial,
    finalResource: currentResource,
    resources: {
      initial,
      history: resourceHistory
    }
  };
}

/**
 * Generate par score table (over-by-over or ball-by-ball)
 * @param {number} team1Score - Team 1's final score
 * @param {number} R1_final - Team 1's final resource percentage
 * @param {number} totalOvers - Total overs in match
 * @param {boolean} ballByBall - If true, generate ball-by-ball; otherwise over-by-over
 * @returns {Object} Par score table
 */
function generateParScoreTable(team1Score, R1_final, totalOvers, ballByBall) {
  const parScores = {};
  
  if (ballByBall) {
    // Ball-by-ball par scores
    for (let over = 0; over <= totalOvers; over++) {
      parScores[over] = {};
      for (let ball = 0; ball < 6; ball++) {
        const completedOvers = over + ((ball + 1) / 6);
        if (completedOvers > totalOvers) {
          continue;
        }

        const oversRemaining = totalOvers - completedOvers;
        
        // We assume different wicket scenarios (0-9 wickets down)
        // For display, we'll show the par score for the "current" situation
        // For simplicity, let's calculate for all wickets and store
        const wicketScores = {};
        for (let wickets = 0; wickets <= 9; wickets++) {
          const resourceAtThisPoint = getResource(oversRemaining, wickets, totalOvers);
          const parScore = Math.floor(team1Score * ((R1_final - resourceAtThisPoint) / R1_final));
          wicketScores[wickets] = parScore;
        }
        parScores[over][ball] = wicketScores;
      }

      if (Object.keys(parScores[over]).length === 0) {
        delete parScores[over];
      }
    }
  } else {
    // Over-by-over par scores
    for (let over = 0; over <= totalOvers; over++) {
      const oversRemaining = totalOvers - over;
      
      // Calculate for all wicket scenarios
      const wicketScores = {};
      for (let wickets = 0; wickets <= 9; wickets++) {
        const resourceAtThisPoint = getResource(oversRemaining, wickets, totalOvers);
        const parScore = Math.floor(team1Score * ((R1_final - resourceAtThisPoint) / R1_final));
        wicketScores[wickets] = parScore;
      }
      parScores[over] = wicketScores;
    }
  }
  
  return parScores;
}

module.exports = {
  calculateDLS,
  calculateInningsResource,
  generateParScoreTable
};
