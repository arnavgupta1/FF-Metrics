# Fantasy Football Analytics Dashboard

A comprehensive fantasy football analytics dashboard that integrates with the Sleeper Fantasy Football API. Built with Next.js 14, TypeScript, and Tailwind CSS for optimal local development and easy future migration.

## Features

### 🏆 Season Overview Table
- **Power Rankings**: Composite scoring algorithm incorporating total points, optimal lineup strength, and recent form
- **Sleeper Rankings**: Official league standings
- **Advanced Metrics**: Self-inflicted losses, potential wins, and opponent points analysis
- **Interactive Sorting**: Click any column header to sort data

### 👥 Player Value Analysis
- **VORP (Value Over Replacement Player)**: Points over waiver wire replacement
- **VORS (Value Over Replacement Starter)**: Points over baseline starter (QB12, RB30, WR30, TE12, K12)
- **VOBP (Value Over Bench Player)**: Points over best bench alternative
- **Positional Rankings**: Within-position scoring rankings
- **Advanced Filtering**: Search by name/owner and filter by position

### 🎯 Analytics Engine
- **Power Ranking Algorithm**: 40% total points + 35% optimal lineup + 25% recent form
- **Value Calculations**: Sophisticated replacement player analysis
- **Performance Metrics**: Lineup optimization and bench analysis
- **Data Processing**: Clean transformation of raw Sleeper API data

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for modern, responsive design
- **Charts**: Recharts for data visualizations
- **API Integration**: Sleeper Fantasy Football API
- **State Management**: React hooks and context

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
cd fantasy-dashboard
npm install
```

2. **Start local development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

4. **Enter your Sleeper League ID:**
- Go to your Sleeper fantasy football league
- Copy the league ID from the URL (e.g., `1234567890` from `https://sleeper.com/league/1234567890`)
- Paste it into the dashboard and click "Load Dashboard"

## Project Structure

```
fantasy-dashboard/
├── src/
│   ├── app/                 # Next.js 14 app directory
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page with league ID input
│   │   └── globals.css     # Global styles and Tailwind
│   ├── components/         # React components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   │   ├── Dashboard.tsx           # Main dashboard
│   │   │   ├── SeasonOverviewTable.tsx # Team standings table
│   │   │   └── PlayerValueTable.tsx    # Player analysis table
│   │   └── common/         # Reusable UI components
│   ├── lib/               # Core business logic
│   │   ├── sleeper/       # Sleeper API integration
│   │   │   └── api.ts     # API service layer
│   │   ├── analytics/     # Fantasy football calculations
│   │   │   ├── calculations.ts # Analytics algorithms
│   │   │   └── dataProcessor.ts # Data transformation
│   │   └── utils/         # Helper functions
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── next.config.js         # Next.js configuration
```

## API Integration

### Sleeper API Endpoints
- **League Information**: Basic league details and settings
- **Team Rosters**: Player rosters and starting lineups
- **User Data**: Owner information and display names
- **Matchup Results**: Weekly game results and scores
- **Player Statistics**: Individual player performance data

### Data Processing
- **Real-time Fetching**: Live data from Sleeper API
- **Error Handling**: Graceful fallbacks and retry logic
- **Caching Strategy**: Intelligent API response caching
- **Data Transformation**: Raw API data to dashboard-ready format

## Analytics Algorithms

### Power Ranking Formula
```
PowerRank = (TotalPoints × 0.4) + (OptimalAverage × 0.35) + (Recent3Week × 0.25)
```

### Value Over Replacement Metrics
- **VORP**: Player points - Replacement player points
- **VORS**: Player points - Baseline starter points
- **VOBP**: Player points - Best bench alternative points

### Baseline Starter Points
- **QB**: QB12 (18.5 points)
- **RB**: RB30 (12.0 points)
- **WR**: WR30 (11.5 points)
- **TE**: TE12 (8.5 points)
- **K**: K12 (8.0 points)

## Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Local Development Features
- **Hot Reload**: Instant feedback during development
- **Type Safety**: Full TypeScript coverage
- **Error Boundaries**: Comprehensive error handling
- **Responsive Design**: Mobile-first development approach

## Future Enhancements

### Phase 2: Advanced Analytics
- **Weekly Recaps**: Detailed weekly analysis
- **Trend Analysis**: Performance over time charts
- **Trade Analysis**: Player trade value calculations
- **Draft Insights**: Historical draft performance

### Phase 3: Interactive Features
- **Custom Filters**: Advanced data filtering options
- **Export Functionality**: CSV/PDF data export
- **Multiple Leagues**: Support for multiple league IDs
- **User Preferences**: Customizable dashboard views

## Migration to Production

### Deployment Options
1. **Vercel**: Zero-config deployment with `git push`
2. **Netlify**: Simple drag-and-drop deployment
3. **Custom Hosting**: Traditional VPS or cloud hosting

### Migration Benefits
- **No Code Changes**: Same codebase works locally and in production
- **Custom Domain**: Easy to add your own domain
- **Scalability**: Can add database, authentication, and more features
- **Performance**: Production-optimized builds

## Contributing

### Code Standards
- **TypeScript**: Full type coverage required
- **Clean Architecture**: Modular, extensible design
- **Error Handling**: Comprehensive error states
- **Documentation**: JSDoc comments for complex functions
- **Testing**: Unit tests for utility functions

### Development Workflow
1. **Local Development**: Focus on getting working dashboard quickly
2. **Clean Code**: Structure for easy extension and maintenance
3. **Performance**: Consider optimization opportunities from start
4. **Extensibility**: Document extension points for future features

## Support

### Common Issues
- **League ID Not Found**: Verify the league ID from your Sleeper URL
- **API Rate Limits**: Sleeper API has rate limits; dashboard includes retry logic
- **Data Loading**: Large leagues may take longer to load initially

### Getting Help
- Check the browser console for error messages
- Verify your Sleeper league ID is correct
- Ensure you have internet connectivity for API calls

## License

This project is built for educational and personal use. Please respect Sleeper's API terms of service when using this dashboard.

---

**Built with ❤️ for fantasy football enthusiasts who love data-driven insights**
