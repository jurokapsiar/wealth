# Wealth Projection Calculator

A mobile-first financial planning tool that helps you visualize your wealth trajectory over time by factoring in interest growth, inflation, and various expenses.

## Overview

This application allows users to project their wealth year-over-year based on:
- Initial wealth amount
- Yearly interest rate on wealth
- Average inflation rate
- Multiple cost entries (fixed or percentage-based)

All calculations happen in real-time as you adjust inputs, providing immediate feedback on your financial projections.

## Features

### Core Functionality
- **Initial Settings**: Configure starting wealth, interest rate, inflation rate, and start year
- **Cost Management**: Add unlimited cost entries with two types:
  - **Fixed Amount**: Specific dollar amounts that adjust for inflation each year
  - **Percentage of Wealth**: Costs calculated as a percentage of current wealth
- **Year-over-Year Projections**: Detailed table showing wealth progression over time
- **Cost Breakdown**: Expandable rows showing individual cost deductions per year

### User Experience
- Mobile-first responsive design
- Real-time calculation updates
- Interactive projection table
- Clean, intuitive interface
- No backend required - works entirely in the browser

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SettingsCard.tsx       # Initial wealth & rate inputs
│   │   │   ├── CostEntry.tsx          # Individual cost configuration
│   │   │   ├── ProjectionTable.tsx    # Year-by-year results display
│   │   │   └── ui/                    # Shadcn UI components
│   │   ├── pages/
│   │   │   └── Home.tsx               # Main application page
│   │   └── index.css                  # Tailwind & theme styles
├── server/                            # Express server (minimal)
└── shared/
    └── schema.ts                      # Type definitions
```

## Technical Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Routing**: Wouter
- **State Management**: React Hooks (useState, useEffect)
- **Build Tool**: Vite
- **Server**: Express (serves frontend only)

## How It Works

### Calculation Logic

1. **Interest Application**: Each year, interest is calculated and added to the starting wealth
2. **Cost Deduction**: Costs are then deducted from the wealth (after interest)
3. **Inflation Adjustment**: Fixed costs increase each year based on the inflation rate
4. **Percentage Costs**: Calculated from wealth after interest is applied
5. **Carry Forward**: Ending wealth becomes the starting wealth for the next year

### Example Calculation

```
Year 0:
- Starting Wealth: $100,000
- Interest (7.5%): +$7,500
- Wealth after Interest: $107,500
- Fixed Cost: -$50,000
- Ending Wealth: $57,500

Year 1:
- Starting Wealth: $57,500
- Interest (7.5%): +$4,312.50
- Wealth after Interest: $61,812.50
- Fixed Cost (inflation-adjusted 3%): -$51,500
- Ending Wealth: $10,312.50
```

## Development

### Running the Application

```bash
npm run dev
```

The application runs on port 5000 and combines both frontend and backend.

### Key Components

**SettingsCard**: Manages initial wealth configuration
- Initial wealth input (dollars)
- Yearly interest percentage
- Inflation rate
- Starting year

**CostEntry**: Individual cost configuration
- Cost name
- Type selector (fixed vs percentage)
- Amount input (adapts based on type)
- Start year (0-based from start year)
- Duration in years
- Remove button

**ProjectionTable**: Displays wealth projections
- Year-by-year breakdown
- Expandable cost details
- Responsive column visibility
- Formatted currency display

### State Management

The application uses React state to manage:
- Initial settings (wealth, interest, inflation, year)
- Cost array (multiple cost entries)
- Projections array (calculated from settings + costs)

Calculations run automatically via `useEffect` whenever any input changes, providing real-time updates.

## Usage Guide

1. **Set Initial Parameters**
   - Enter your starting wealth
   - Set expected yearly interest rate on your wealth
   - Set average inflation rate
   - Choose a start year (default: 2026)

2. **Add Costs**
   - Click "Add Cost" button
   - Enter a descriptive name
   - Choose cost type:
     - **Fixed Amount**: For expenses like rent, subscriptions
     - **Percentage of Wealth**: For lifestyle expenses tied to wealth
   - Set when the cost starts (Year 0 = first year)
   - Set how many years the cost applies

3. **Review Projections**
   - View year-by-year wealth progression
   - Click on any year to see detailed cost breakdown
   - Adjust inputs to see different scenarios

## Design Philosophy

- **Mobile-First**: Optimized for small screens with progressive enhancement
- **Immediate Feedback**: All calculations update instantly
- **Simple & Clean**: Focused interface without unnecessary complexity
- **Accessible**: Proper labels, keyboard navigation, and semantic HTML

## Future Enhancements

Potential features for future development:
- Save/load scenarios
- Export to CSV/PDF
- Chart visualization of wealth trajectory
- Comparison of multiple scenarios
- Income streams (in addition to costs)
- One-time events (windfalls, major purchases)
