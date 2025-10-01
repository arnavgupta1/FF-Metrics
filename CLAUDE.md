# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fantasy Football Analytics Dashboard - A Next.js 14 application that integrates with the Sleeper Fantasy Football API to provide comprehensive analytics including power rankings, player value analysis (VORP/VOBP), draft analysis, and team performance metrics.

## Common Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing (when available)
# No test commands currently configured
```

## Architecture

### Data Flow
1. **API Layer** (`src/lib/sleeper/api.ts`, `src/lib/sleeper/draftApi.ts`): Fetches data from Sleeper API with rate limiting and retry logic
2. **Data Processing** (`src/lib/analytics/dataProcessor.ts`): Transforms raw Sleeper data into analytics-ready structures
3. **Analytics** (`src/lib/analytics/calculations.ts`): Calculates fantasy metrics (VORP, VOBP, power rankings, self-inflicted losses)
4. **Components**: Render dashboards with interactive tables and charts

### Key Concepts

**Season Analytics**:
- Power Rankings use a weighted formula: `(TotalPoints × 0.4) + (OptimalAverage × 0.35) + (Recent3Week × 0.25)`
- Self-inflicted losses occur when optimal lineup would have won but actual lineup lost
- Weekly lineup comparison tracks actual vs optimal points and opponent scores

**Player Value Metrics**:
- **VORP**: Points over replacement player (baseline: QB10, RB20, WR20, TE10, K10, DEF10 for 10-team league)
- **VOBP**: Points over best bench alternative on the same team
- **VORS**: Points over baseline starter

**Draft Analytics**:
- Value-based analysis comparing draft picks to expected performance
- Team tier analysis using spider charts for positional strength
- CSV parsing for mock draft data integration (`src/lib/csv-parser/`)

### Critical Data Structures

**Team Processing** (`src/lib/analytics/dataProcessor.ts`):
- Uses roster settings (`fpts`, `wins`) as primary source when available
- Falls back to matchup calculation when roster settings missing
- `weeklyLineups` array contains per-week analysis for lineup optimization tracking

**Player Matching** (`src/lib/player-matching/matcher.ts`):
- Fuzzy matching between Sleeper player data and external sources
- Handles name variations and position discrepancies

### Path Aliases
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Always use path aliases for imports: `import { Team } from '@/types'`

### API Integration
- **Base URL**: `https://api.sleeper.app/v1`
- **Rate Limiting**: Automatic retry with 1s delay on 429 responses
- **Error Handling**: Specific error messages for 404, 403, 500, 502-504 status codes
- All API calls include debug logging with `[DEBUG]` prefix

### Type Safety
- All Sleeper API responses have TypeScript interfaces in `src/types/index.ts` and `src/types/draft.ts`
- Use existing types; avoid `any` unless interfacing with untyped API responses
- Player data uses `SleeperPlayer` interface with optional `points` field for calculated values

### Component Organization
- `src/components/dashboard/`: Season analysis components (SeasonOverviewTable, PlayerValueTable, WeeklyLineupComparison, AdvancedAnalytics)
- `src/components/draft/`: Draft analysis components (DraftAnalysisDashboard, TeamTiersDashboard)
- `src/components/charts/`: Recharts-based visualizations (TeamPointsChart, SpiderCharts)
- All dashboard components are client-side ('use client') for interactivity

### Utility Functions
- `src/lib/utils/rosterUtils.ts`: Roster ID normalization, matchup filtering, points extraction
- Always use `normalizeRosterId()` when comparing roster IDs (handles string/number inconsistencies)
- Use `filterMatchupsForRoster()` to get team-specific matchup data

## Development Notes

- Default league ID is hardcoded in `src/app/page.tsx:9` for testing
- Debug logging is extensive - search for `[DEBUG]` prefix in console
- Sleeper API endpoints are documented in `src/lib/sleeper/api.ts`
- CSV parser supports both test data and Mocko sheet format for draft analysis
- Spider charts use Recharts library with custom domain calculations for positional analysis
