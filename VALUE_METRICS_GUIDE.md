# Fantasy Football Value Metrics Guide

## Understanding VORP, VORS, and VOBP

This guide explains the three key value metrics used in the Fantasy Football Analytics Dashboard to evaluate player performance and value.

---

## 🎯 VORP (Value Over Replacement Player)

### What It Measures
VORP quantifies how much better a player is than a typical waiver wire pickup at their position.

### Calculation Formula
```
VORP = Player Points - Average Position Points
```

### Detailed Breakdown
- **Player Points**: Total fantasy points scored by the player in the season
- **Average Position Points**: Mean points of all players at that position
- **Result**: Positive VORP means the player is above average for their position

### Example Calculation
- **Patrick Mahomes**: 285.4 points
- **QB Position Average**: 200.0 points
- **VORP**: 285.4 - 200.0 = **85.4**

### Interpretation
- **VORP > 0**: Player is above average for their position
- **VORP = 0**: Player is exactly average for their position  
- **VORP < 0**: Player is below average for their position

---

## 🏆 VORS (Value Over Replacement Starter)

### What It Measures
VORS quantifies how much better a player is than the minimum acceptable starter at their position.

### Calculation Formula
```
VORS = Player Points - Baseline Starter Points
```

### Baseline Starter Points (Position Thresholds)
| Position | Baseline | Description |
|----------|----------|-------------|
| **QB** | 20.0 points | QB10 (10th ranked QB) |
| **RB** | 14.0 points | RB20 (20th ranked RB) |
| **WR** | 13.5 points | WR20 (20th ranked WR) |
| **TE** | 10.0 points | TE10 (10th ranked TE) |
| **K** | 9.0 points | K10 (10th ranked K) |

### Example Calculation
- **Christian McCaffrey**: 298.7 points
- **RB Baseline Starter**: 14.0 points
- **VORS**: 298.7 - 14.0 = **284.7**

### Interpretation
- **VORS > 0**: Player is a legitimate starter
- **VORS = 0**: Player is at the minimum starter threshold
- **VORS < 0**: Player is below starter quality

---

## 💪 VOBP (Value Over Bench Player)

### What It Measures
VOBP quantifies how much better a player is than the next best option on their team's bench.

### Calculation Formula
```
VOBP = Player Points - Best Bench Alternative Points
```

### How It's Calculated
1. Identify all bench players on the same team
2. Find the bench player with the highest points
3. Calculate the difference between starter and best bench player

### Example Calculation
- **Tyreek Hill (Starter)**: 245.3 points
- **Best Bench WR**: 226.5 points
- **VOBP**: 245.3 - 226.5 = **18.8**

### Interpretation
- **VOBP > 0**: Player is outperforming bench alternatives
- **VOBP = 0**: Player and best bench option are equal
- **VOBP < 0**: Bench option is actually better

---

## 🔍 Practical Applications

### Using VORP
- **Waiver Wire Decisions**: Higher VORP players are better waiver targets
- **Trade Value**: Players with high VORP have more trade value
- **Position Scarcity**: Compare VORP across positions to identify scarcity

### Using VORS
- **Start/Sit Decisions**: Players with negative VORS should be benched
- **Roster Construction**: Ensure all starters have positive VORS
- **Draft Strategy**: Target players likely to maintain positive VORS

### Using VOBP
- **Roster Depth**: High VOBP indicates strong bench depth
- **Trade Opportunities**: Low VOBP players might be tradeable
- **Lineup Optimization**: Identify players who could be replaced

---

## 📊 Dashboard Implementation

### Data Sources
- **Player Points**: From Sleeper API player statistics
- **Position Averages**: Calculated from all players in the league
- **Baseline Starters**: Fixed thresholds based on position depth
- **Bench Players**: Identified from team rosters

### Real-Time Updates
- Metrics recalculate automatically with new data
- Weekly updates reflect current performance
- Seasonal trends show player development

### Interactive Features
- Sortable columns for all metrics
- Position-based filtering
- Search functionality for specific players
- Color-coded positive/negative values

---

## 🎯 Key Insights

### High VORP + High VORS
- **Elite players** who are both above average and clear starters
- **Trade targets** with high value
- **Must-start** players every week

### High VORP + Low VORS
- **Good players** in deep positions
- **Flex options** or bye-week fillers
- **Trade candidates** for teams needing depth

### Low VORP + High VORS
- **Starters by default** in weak positions
- **Replaceable** if better options become available
- **Roster bubble** players

### Low VORP + Low VORS
- **Bench players** or waiver wire fodder
- **Drop candidates** for better options
- **Depth pieces** only

---

## 🚀 Advanced Analysis

### Position-Specific Insights
- **QB**: VORS threshold (20.0) reflects 10-team league starter quality
- **RB**: VORS threshold (14.0) accounts for RB scarcity and depth in smaller leagues
- **WR**: VORS threshold (13.5) reflects WR depth in modern NFL for 10-team leagues
- **TE**: VORS threshold (10.0) accounts for TE scarcity in smaller leagues
- **K**: VORS threshold (9.0) reflects kicker consistency for 10-team leagues

### League Context
- **10-team leagues**: Current configuration (QB10, RB20, WR20, TE10, K10)
- **12+ team leagues**: Higher VORS thresholds would apply
- **PPR vs Standard**: Adjusts baseline calculations
- **Scoring systems**: Custom thresholds for different formats

### Historical Trends
- **Rookie development**: VORP increases over time
- **Veteran decline**: VORS decreases with age
- **Injury impact**: VOBP changes with roster moves
- **Schedule strength**: Affects all three metrics

---

## 💡 Pro Tips

1. **Compare Across Positions**: VORP helps identify which positions have the most value
2. **Monitor Trends**: Track VORS changes week-to-week for roster decisions
3. **Use VOBP for Trades**: High VOBP players are more valuable in trades
4. **Combine Metrics**: Use all three together for complete player evaluation
5. **Consider Context**: League size, scoring system, and roster requirements matter

---

## 🔧 Technical Details

### Calculation Frequency
- **Real-time**: Updates with each API call
- **Weekly**: Full recalculation after each game week
- **Seasonal**: Cumulative metrics for full season analysis

### Data Accuracy
- **Sleeper API**: Direct integration for accurate data
- **Error Handling**: Graceful fallbacks for missing data
- **Validation**: Checks for data consistency and completeness

### Performance
- **Optimized**: Efficient calculations for large datasets
- **Cached**: Intelligent caching to reduce API calls
- **Responsive**: Fast updates for interactive dashboard

---

*This guide covers the core value metrics used in the Fantasy Football Analytics Dashboard. For more advanced analytics and insights, explore the full dashboard features.*
