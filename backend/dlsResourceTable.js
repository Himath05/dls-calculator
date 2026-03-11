// DLS 5.0 Resource Percentage Table
// Maps (overs_remaining, wickets_lost) to resource_percentage

const DLS_RESOURCE_TABLE = {
  50: [100.0, 93.4, 85.1, 74.9, 62.7, 49.5, 36.6, 24.5, 14.2, 5.4],
  49: [99.0, 92.6, 84.5, 74.4, 62.3, 49.3, 36.4, 24.4, 14.2, 5.4],
  48: [98.0, 91.8, 83.8, 73.8, 61.9, 49.0, 36.3, 24.3, 14.1, 5.4],
  47: [97.0, 91.0, 83.1, 73.3, 61.5, 48.8, 36.1, 24.2, 14.1, 5.4],
  46: [96.0, 90.2, 82.5, 72.7, 61.1, 48.5, 35.9, 24.1, 14.0, 5.3],
  45: [94.9, 89.3, 81.8, 72.1, 60.6, 48.2, 35.8, 24.0, 14.0, 5.3],
  44: [93.9, 88.5, 81.1, 71.6, 60.2, 48.0, 35.6, 23.9, 13.9, 5.3],
  43: [92.9, 87.6, 80.4, 71.0, 59.8, 47.7, 35.4, 23.8, 13.9, 5.3],
  42: [91.8, 86.7, 79.7, 70.4, 59.3, 47.4, 35.3, 23.7, 13.8, 5.2],
  41: [90.7, 85.8, 79.0, 69.8, 58.9, 47.1, 35.1, 23.6, 13.7, 5.2],
  40: [89.6, 84.9, 78.2, 69.2, 58.4, 46.8, 34.9, 23.4, 13.7, 5.2],
  39: [88.5, 84.0, 77.5, 68.6, 58.0, 46.5, 34.7, 23.3, 13.6, 5.1],
  38: [87.4, 83.0, 76.7, 68.0, 57.5, 46.2, 34.5, 23.2, 13.5, 5.1],
  37: [86.2, 82.1, 75.9, 67.3, 57.0, 45.9, 34.3, 23.1, 13.5, 5.1],
  36: [85.1, 81.1, 75.1, 66.7, 56.5, 45.6, 34.1, 23.0, 13.4, 5.0],
  35: [83.9, 80.1, 74.3, 66.0, 56.0, 45.3, 33.9, 22.8, 13.3, 5.0],
  34: [82.7, 79.1, 73.5, 65.4, 55.5, 44.9, 33.7, 22.7, 13.2, 5.0],
  33: [81.5, 78.1, 72.7, 64.7, 55.0, 44.6, 33.5, 22.6, 13.2, 4.9],
  32: [80.2, 77.1, 71.8, 64.0, 54.5, 44.3, 33.3, 22.4, 13.1, 4.9],
  31: [79.0, 76.1, 71.0, 63.3, 54.0, 43.9, 33.1, 22.3, 13.0, 4.9],
  30: [77.7, 75.1, 70.1, 62.6, 53.4, 43.6, 32.8, 22.2, 12.9, 4.8],
  29: [76.4, 74.0, 69.2, 61.9, 52.9, 43.2, 32.6, 22.0, 12.8, 4.8],
  28: [75.1, 72.9, 68.3, 61.1, 52.4, 42.9, 32.4, 21.9, 12.7, 4.7],
  27: [73.8, 71.8, 67.4, 60.4, 51.8, 42.5, 32.1, 21.7, 12.7, 4.7],
  26: [72.4, 70.7, 66.5, 59.6, 51.2, 42.1, 31.9, 21.6, 12.6, 4.7],
  25: [71.0, 69.6, 65.5, 58.8, 50.7, 41.8, 31.6, 21.4, 12.5, 4.6],
  24: [69.6, 68.5, 64.6, 58.0, 50.1, 41.4, 31.4, 21.3, 12.4, 4.6],
  23: [68.2, 67.3, 63.6, 57.2, 49.5, 41.0, 31.1, 21.1, 12.3, 4.5],
  22: [66.7, 66.1, 62.6, 56.4, 48.9, 40.6, 30.8, 20.9, 12.2, 4.5],
  21: [65.2, 64.9, 61.6, 55.6, 48.3, 40.2, 30.6, 20.8, 12.1, 4.4],
  20: [63.7, 63.7, 60.6, 54.7, 47.7, 39.8, 30.3, 20.6, 12.0, 4.4],
  19: [62.1, 62.5, 59.5, 53.9, 47.0, 39.3, 30.0, 20.4, 11.9, 4.3],
  18: [60.5, 61.2, 58.4, 53.0, 46.4, 38.9, 29.7, 20.2, 11.7, 4.3],
  17: [58.9, 59.9, 57.3, 52.1, 45.7, 38.5, 29.4, 20.0, 11.6, 4.2],
  16: [57.3, 58.6, 56.2, 51.2, 45.0, 38.0, 29.1, 19.8, 11.5, 4.2],
  15: [55.6, 57.2, 55.0, 50.2, 44.3, 37.6, 28.7, 19.6, 11.4, 4.1],
  14: [53.9, 55.8, 53.8, 49.3, 43.6, 37.1, 28.4, 19.4, 11.3, 4.1],
  13: [52.2, 54.4, 52.6, 48.3, 42.9, 36.6, 28.1, 19.1, 11.1, 4.0],
  12: [50.4, 52.9, 51.4, 47.3, 42.1, 36.1, 27.7, 18.9, 11.0, 3.9],
  11: [48.6, 51.4, 50.1, 46.3, 41.4, 35.6, 27.3, 18.7, 10.8, 3.9],
  10: [46.8, 49.9, 48.8, 45.2, 40.6, 35.1, 26.9, 18.4, 10.7, 3.8],
  9: [44.9, 48.3, 47.5, 44.1, 39.8, 34.6, 26.5, 18.1, 10.5, 3.7],
  8: [43.0, 46.7, 46.1, 43.0, 39.0, 34.0, 26.1, 17.9, 10.4, 3.7],
  7: [41.1, 45.0, 44.7, 41.9, 38.1, 33.5, 25.7, 17.6, 10.2, 3.6],
  6: [39.1, 43.3, 43.3, 40.7, 37.3, 32.9, 25.3, 17.3, 10.0, 3.5],
  5: [37.1, 41.6, 41.9, 39.6, 36.4, 32.3, 24.8, 17.0, 9.9, 3.4],
  4: [35.1, 39.8, 40.4, 38.3, 35.5, 31.7, 24.4, 16.7, 9.7, 3.4],
  3: [33.0, 38.0, 38.9, 37.1, 34.6, 31.1, 23.9, 16.4, 9.5, 3.3],
  2: [30.8, 36.1, 37.4, 35.8, 33.6, 30.4, 23.4, 16.1, 9.3, 3.2],
  1: [28.7, 34.1, 35.8, 34.5, 32.7, 29.8, 23.0, 15.8, 9.1, 3.1],
  0: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

// G50 constant - average score in a 50-over innings
const G50 = 245;

/**
 * Get resource percentage for given overs remaining and wickets lost
 * @param {number} overs - Overs remaining (can be decimal)
 * @param {number} wickets - Wickets lost (0-9)
 * @returns {number} Resource percentage
 */
function getResource(overs, wickets) {
  // Ensure wickets is within valid range
  if (wickets < 0) wickets = 0;
  if (wickets > 9) wickets = 9;
  
  // Handle edge cases
  if (overs <= 0) return DLS_RESOURCE_TABLE[0][wickets];
  if (overs >= 50) return DLS_RESOURCE_TABLE[50][wickets];
  
  // Get the floor and ceiling over values
  const oversFloor = Math.floor(overs);
  const oversCeil = Math.ceil(overs);
  
  // If overs is a whole number, return directly from table
  if (oversFloor === oversCeil) {
    return DLS_RESOURCE_TABLE[oversFloor][wickets];
  }
  
  // Linear interpolation between two overs values
  const resourceFloor = DLS_RESOURCE_TABLE[oversFloor][wickets];
  const resourceCeil = DLS_RESOURCE_TABLE[oversCeil][wickets];
  const fraction = overs - oversFloor;
  
  return resourceFloor + (resourceCeil - resourceFloor) * fraction;
}

/**
 * Convert overs.balls format to decimal overs
 * @param {string|number} oversStr - Overs in format "10.3" meaning 10 overs 3 balls
 * @returns {number} Overs as decimal
 */
function oversBallsToDecimal(oversStr) {
  // Handle undefined, null, or empty string
  if (oversStr === undefined || oversStr === null || oversStr === '') {
    return 0;
  }
  
  if (typeof oversStr === 'number') {
    const overs = Math.floor(oversStr);
    const balls = Math.round((oversStr - overs) * 10);
    return overs + (balls / 6);
  }
  
  const [overs, balls] = oversStr.toString().split('.').map(Number);
  return overs + (balls || 0) / 6;
}

/**
 * Convert decimal overs to overs.balls format
 * @param {number} decimalOvers - Overs as decimal
 * @returns {string} Overs in format "10.3"
 */
function decimalToOversBalls(decimalOvers) {
  const overs = Math.floor(decimalOvers);
  const balls = Math.round((decimalOvers - overs) * 6);
  return `${overs}.${balls}`;
}

module.exports = {
  DLS_RESOURCE_TABLE,
  G50,
  getResource,
  oversBallsToDecimal,
  decimalToOversBalls
};
