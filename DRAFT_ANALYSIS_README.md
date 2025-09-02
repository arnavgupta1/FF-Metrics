# Fantasy Football Draft Analysis Dashboard

## Overview

This comprehensive draft analysis dashboard compares actual draft results from Sleeper leagues against expert rankings and ADP data from the MockoSheet Draft Aid. It provides detailed insights into draft efficiency, value picks, and team performance.

## Features

### 🎯 Draft Pick Analysis
- **Comprehensive Pick Table**: View every draft pick with expert rankings, ADP, and reach calculations
- **Advanced Filtering**: Filter by team, position, and sort by various metrics
- **Value Identification**: Automatically identify value picks (negative reach) and reaches (positive reach)
- **Color-coded Results**: Green for value picks, red for reaches



### 🏈 Position Analysis
- **Position-specific Insights**: Analyze draft performance by position (QB, RB, WR, TE, DEF, K)
- **Efficiency Metrics**: Average reach and value pick percentages by position
- **Strategic Analysis**: Identify which positions were drafted most efficiently

## Data Sources

### MockoSheet Draft Aid 2025
- **Expert Consensus Rankings (ECR)**: FantasyPros-based rankings
- **Average Draft Position (ADP)**: Sleeper-based ADP data
- **Value Scores (VAL)**: Projected value over baseline players
- **Position Tiers**: QB1, RB2, WR3, etc. tier classifications
- **VAL-ADP Scores**: Value relative to ADP recommendations

### Sleeper API Integration
- **Draft Results**: Actual draft picks from Sleeper leagues
- **Player Database**: Complete NFL player information
- **Team Information**: League and team details

## Key Calculations

### Reach Calculation
```
Reach = ADP - Actual Pick Number
```
- **Positive Reach**: Value pick (drafted earlier than ADP)
- **Negative Reach**: Reach (drafted later than ADP)
- **Zero Reach**: Perfect ADP alignment



### Value Pick Identification
- **Value Pick**: Reach < 0 (drafted later than ADP)
- **Reach**: Reach > 0 (drafted earlier than ADP)
- **Perfect Pick**: Reach = 0 (exactly at ADP)

## Usage Instructions

### 1. Access the Dashboard
1. Navigate to the main dashboard
2. Enter your Sleeper League ID
3. Click "Analyze Draft" button

### 2. Understanding the Results

#### Draft Picks Table
- **Pick Number**: Overall draft position
- **Player Name**: Drafted player
- **Position**: Player position with color coding
- **Team**: Drafting team
- **ADP**: Average Draft Position from MockoSheet
- **Expert Rank**: Expert Consensus Ranking
- **Reach**: Difference between actual pick and ADP
- **VAL-ADP**: Value score relative to ADP
- **Tier**: Position tier (QB1, RB2, etc.)



#### Position Analysis Table
- **Position**: Player position
- **Total Picks**: Number of players drafted at position
- **Avg Reach**: Average reach for position
- **Value Picks**: Number of value picks at position
- **Reaches**: Number of reaches at position

### 3. Filtering and Sorting

#### Available Filters
- **Team**: Filter picks by specific team
- **Position**: Filter by QB, RB, WR, TE, DEF, K
- **Sort By**: Pick Number, Reach Amount, ADP, Expert Rank
- **Order**: Ascending or Descending

#### Color Coding
- **Green**: Value picks (negative reach)
- **Red**: Reaches (positive reach)
- **Blue**: QB players
- **Green**: RB players
- **Purple**: WR players
- **Orange**: TE players
- **Gray**: DEF/K players

## Technical Implementation

### Architecture
```
src/
├── app/
│   ├── api/draft-analysis/     # Draft analysis API endpoint
│   └── page.tsx               # Main dashboard with draft analysis option
├── components/
│   └── draft/                 # Draft analysis components
├── lib/
│   ├── csv-parser/            # MockoSheet CSV parsing
│   ├── sleeper/               # Sleeper API integration
│   ├── player-matching/       # Player name matching algorithm
│   └── draft-analytics/       # Draft analysis calculations
└── types/
    └── draft.ts               # Draft analysis type definitions
```

### Key Components

#### MockoSheetParser
- Parses multi-section CSV format
- Extracts player data from QB, RB, WR, TE, DEF, K sections
- Handles ADP conversion and value score parsing

#### PlayerMatcher
- Fuzzy name matching between Sleeper and MockoSheet data
- Position-based matching for accuracy
- Handles name variations and special characters

#### DraftAnalyticsCalculator
- Calculates reach metrics
- Generates position analysis
- Provides draft efficiency statistics

### Data Flow
1. **CSV Parsing**: MockoSheet data parsed into structured format
2. **Sleeper API**: Draft results and player data fetched
3. **Player Matching**: Sleeper players matched to MockoSheet rankings
4. **Analysis**: Reach calculations computed
5. **Display**: Results presented in interactive tables

## Error Handling

### Common Issues
- **Player Not Found**: Players not in MockoSheet data show as "N/A"
- **API Errors**: Clear error messages for Sleeper API failures
- **CSV Parsing**: Graceful handling of malformed CSV data

### Data Quality
- **Match Rate**: Percentage of players successfully matched
- **Missing Data**: Clear indication of unavailable information
- **Validation**: Data validation for ADP and ranking values

## Performance Considerations

### Optimization
- **Client-side Filtering**: Fast table filtering without server requests
- **Efficient Parsing**: Optimized CSV parsing for large datasets
- **Caching**: API responses cached for better performance

### Scalability
- **Large Drafts**: Handles drafts with 150+ picks efficiently
- **Multiple Positions**: Supports all fantasy positions
- **Real-time Updates**: Responsive UI for large datasets

## Future Enhancements

### Planned Features
- **Draft Simulation**: Mock draft with expert recommendations
- **Historical Analysis**: Compare multiple draft years
- **Export Functionality**: CSV export of analysis results
- **Advanced Visualizations**: Charts and graphs for draft trends
- **Custom Scoring**: Adjustable scoring systems for different league formats

### Integration Opportunities
- **Additional Rankings**: Support for other expert ranking sources
- **Dynasty Analysis**: Dynasty-specific draft analysis
- **Auction Drafts**: Support for auction draft formats
- **Keeper Leagues**: Analysis for keeper league drafts

## Support and Troubleshooting

### Getting Help
- Check the console for detailed error messages
- Verify your Sleeper League ID is correct
- Ensure the CSV file is properly formatted
- Contact support for technical issues

### Data Accuracy
- MockoSheet data is updated regularly
- Player matching uses fuzzy algorithms for accuracy
- Manual review available for unmatched players
- Validation checks ensure data integrity

---

**Note**: This dashboard is designed for 10-team standard leagues with the scoring format specified in the MockoSheet data. Results may vary for different league formats or scoring systems.
