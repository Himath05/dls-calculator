# Sample Test Data for DLS Calculator

## Test Case 1: Simple Match (No Interruptions)

**Match Details:**

- Team 1: India
- Team 2: Australia
- Venue: Lord's Cricket Ground
- Tournament: ICC World Cup 2023
- Date: 2023-11-05
- DLS Manager: John Smith

**Match Type:** ODI (50)

**Team 1 Innings:**

- Overs at Start: 50
- Final Score: 287
- Overs Played: 50
- Stoppages: None

**Team 2 Innings:**

- Overs Allocated: 50
- Stoppages: None
- Penalty Runs: 0

**Expected Result:**

- Target: 288 (287 + 1)
- R1_final: 100%
- R2_final: 100%

---

## Test Case 2: Rain-Affected Match (Team 1 Interruption)

**Match Details:**

- Team 1: England
- Team 2: South Africa
- Venue: The Oval
- Tournament: Champions Trophy
- Date: 2023-06-15
- DLS Manager: Sarah Johnson

**Match Type:** ODI (50)

**Team 1 Innings:**

- Overs at Start: 50
- Final Score: 250
- Overs Played: 45
- Stoppages:
  1. Stoppage 1:
     - Overs Bowled: 25.3 (25 overs, 3 balls)
     - Runs Scored: 125
     - Wickets Down: 2
     - Overs Lost: 5.0

**Team 2 Innings:**

- Overs Allocated: 45
- Stoppages: None
- Penalty Runs: 0

**Expected Result:**

- Target will be adjusted based on resource calculation
- R1_final < 100% (due to overs lost)
- R2_final = R1_final (both teams same overs)

---

## Test Case 3: Multiple Interruptions (Both Innings)

**Match Details:**

- Team 1: Pakistan
- Team 2: New Zealand
- Venue: Eden Gardens
- Tournament: Tri-Series
- Date: 2023-09-20
- DLS Manager: Michael Chen

**Match Type:** ODI (50)

**Team 1 Innings:**

- Overs at Start: 50
- Final Score: 280
- Overs Played: 48
- Stoppages:
  1. Stoppage 1:
     - Overs Bowled: 15.0
     - Runs Scored: 75
     - Wickets Down: 1
     - Overs Lost: 2.0

**Team 2 Innings:**

- Overs Allocated: 48
- Stoppages:
  1. Stoppage 1:
     - Overs Bowled: 20.4
     - Runs Scored: 105
     - Wickets Down: 3
     - Overs Lost: 8.0
- Penalty Runs: 5

**Expected Result:**

- Complex calculation with multiple stoppages
- R2_final < R1_final (Team 2 lost more overs)
- Target adjusted downward, then +5 penalty runs

---

## Test Case 4: T20 Match

**Match Details:**

- Team 1: Mumbai Indians
- Team 2: Chennai Super Kings
- Venue: Wankhede Stadium
- Tournament: IPL 2023
- Date: 2023-05-10
- DLS Manager: Ravi Kumar

**Match Type:** T20 (20)

**Team 1 Innings:**

- Overs at Start: 20
- Final Score: 185
- Overs Played: 20
- Stoppages: None

**Team 2 Innings:**

- Overs Allocated: 20
- Stoppages:
  1. Stoppage 1:
     - Overs Bowled: 12.2
     - Runs Scored: 98
     - Wickets Down: 4
     - Overs Lost: 3.0
- Penalty Runs: 0

**Expected Result:**

- T20 match with interruption in second innings
- Target adjusted based on 17 overs available
- R2_final < R1_final

---

## Test Case 5: Custom Overs Match

**Match Details:**

- Team 1: Sri Lanka A
- Team 2: Bangladesh A
- Venue: R. Premadasa Stadium
- Tournament: Practice Match
- Date: 2023-08-05
- DLS Manager: Dinesh Silva

**Match Type:** Other (40)

**Team 1 Innings:**

- Overs at Start: 40
- Final Score: 220
- Overs Played: 40
- Stoppages: None

**Team 2 Innings:**

- Overs Allocated: 40
- Stoppages:
  1. Stoppage 1:
     - Overs Bowled: 18.5
     - Runs Scored: 95
     - Wickets Down: 2
     - Overs Lost: 5.0
- Penalty Runs: 10

**Expected Result:**

- 40-over match format
- Target calculated for 35 overs
- +10 penalty runs added

---

## Test Case 6: Multiple Stoppages Same Innings

**Match Details:**

- Team 1: West Indies
- Team 2: Ireland
- Venue: Kensington Oval
- Tournament: Bilateral Series
- Date: 2023-07-12
- DLS Manager: Chris Williams

**Match Type:** ODI (50)

**Team 1 Innings:**

- Overs at Start: 50
- Final Score: 265
- Overs Played: 42
- Stoppages:
  1. Stoppage 1:
     - Overs Bowled: 15.0
     - Runs Scored: 68
     - Wickets Down: 1
     - Overs Lost: 3.0
  2. Stoppage 2:
     - Overs Bowled: 30.2
     - Runs Scored: 145
     - Wickets Down: 4
     - Overs Lost: 5.0

**Team 2 Innings:**

- Overs Allocated: 42
- Stoppages: None
- Penalty Runs: 0

**Expected Result:**

- Two separate rain breaks in Team 1's innings
- Cumulative resource loss
- Equal overs for both teams

---

## How to Use These Test Cases

1. **Start the Application**

   - Backend: `cd backend && npm start`
   - Frontend: `cd frontend && npm start`

2. **Enter Test Data**

   - Copy values from any test case above
   - Fill in the calculator form
   - For overs.balls format: 25.3 means 25 overs and 3 balls

3. **Verify Results**

   - Check if target makes sense
   - Review par score tables
   - Test PDF generation

4. **Common Patterns**
   - No interruptions: Target = Score + 1
   - Equal resource loss: Target = Score + 1
   - Team 2 fewer resources: Target reduced
   - Team 2 more resources: Target increased

---

## Understanding Overs.Balls Format

- `25.3` = 25 overs and 3 balls bowled
- `5.0` = 5 complete overs
- `0.4` = 0 overs and 4 balls (= 4 balls = 0.667 overs)
- `10.5` = 10 overs and 5 balls

**Valid ball values:** 0, 1, 2, 3, 4, 5 (not 6 - that's a complete over!)

---

## Tips for Testing

1. **Start Simple:** Use Test Case 1 first to verify basic functionality
2. **Test Incrementally:** Add one stoppage at a time
3. **Check Calculations:** Compare targets with expected DLS outcomes
4. **Test PDF:** Generate and review PDF quality for each test
5. **Save Reports:** Check if reports are properly stored and retrievable

---

**Note:** These test cases use realistic cricket scores and scenarios. Actual DLS calculations may vary based on the exact resource table implementation.
