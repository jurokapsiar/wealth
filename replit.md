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
  - **Year 0 Value**: Each cost displays its purchasing power in Year 0 terms (inflation-adjusted)

### User Experience
- Mobile-first responsive design
- Real-time calculation updates
- Interactive projection table
- Clean, intuitive interface
- No backend required - works entirely in the browser
- **localStorage Persistence**: All settings and costs automatically save to your browser
- **Extended Projections**: View 30 years by default, with option to extend by 10-year increments

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
- **Persistence**: Browser localStorage
- **Build Tool**: Vite
- **Server**: Express (serves frontend only)

## How It Works

### Calculation Logic

1. **Interest Application**: Each year, interest is calculated and added to the starting wealth
2. **Cost Deduction**: Costs are then deducted from the wealth (after interest)
3. **Inflation Adjustment**: Fixed costs increase each year based on the inflation rate
4. **Percentage Costs**: Calculated from wealth after interest is applied
5. **Year 0 Value**: Each cost's purchasing power is calculated in Year 0 terms by deflating the inflated amount
6. **Carry Forward**: Ending wealth becomes the starting wealth for the next year

### Example Calculation

```
Year 0:
- Starting Wealth: $100,000
- Interest (7.5%): +$7,500
- Wealth after Interest: $107,500
- Fixed Cost: -$50,000 (Year 0 Value: $50,000)
- Ending Wealth: $57,500

Year 1:
- Starting Wealth: $57,500
- Interest (7.5%): +$4,312.50
- Wealth after Interest: $61,812.50
- Fixed Cost (inflation-adjusted 3%): -$51,500 (Year 0 Value: $50,000)
- Ending Wealth: $10,312.50

Year 2:
- Starting Wealth: $10,312.50
- Interest (7.5%): +$773.44
- Wealth after Interest: $11,085.94
- Fixed Cost (inflation-adjusted 3%): -$53,045 (Year 0 Value: $50,000)
- Ending Wealth: -$41,959.06
```

**Understanding Year 0 Value:**
The "Year 0 Value" shows what each cost would be worth at Year 0 prices, helping you understand the real purchasing power of each expense regardless of inflation. For a fixed $50,000 annual cost with 3% inflation:
- Year 1 cost: $51,500 → Year 0 Value: $50,000
- Year 5 cost: $57,964 → Year 0 Value: $50,000
- Year 10 cost: $67,196 → Year 0 Value: $50,000

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
   - Remove any cost by clicking the trash icon

3. **Review Projections**
   - View 30 years of projections by default
   - Click "Show 10 More Years" to extend the projection
   - Click on any year to see detailed cost breakdown
   - Each cost shows both the inflated amount and its Year 0 Value
   - Adjust inputs to see different scenarios

4. **Automatic Saving**
   - All changes are automatically saved to your browser
   - Refresh the page anytime - your data will persist
   - Clear browser data to reset the calculator

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
