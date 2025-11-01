# Wealth Projection Calculator

A mobile-first financial planning tool that helps you visualize your wealth trajectory over time by factoring in interest growth, inflation, and various expenses.

## Overview

This application allows users to project their wealth year-over-year based on:
- Initial wealth amount
- Yearly interest rate on wealth
- Average inflation rate
- Multiple investment income entries (fixed amounts)
- Multiple cost entries (fixed or percentage-based)

All calculations happen in real-time as you adjust inputs, providing immediate feedback on your financial projections.

## Features

### Core Functionality
- **Initial Settings**: Configure starting wealth, interest rate, inflation rate, start year, and birth year
- **Investment Income**: Add unlimited investment entries that increase wealth each year
  - Fixed amounts that adjust for inflation
  - Configure name, amount, start year, and duration
- **Cost Management**: Add unlimited cost entries with two types:
  - **Fixed Amount**: Specific dollar amounts that adjust for inflation each year
  - **Percentage of Wealth**: Costs calculated as a percentage of current wealth
  - **Enable/Disable Toggle**: Each cost has a checkbox to enable or disable it without deleting
  - Disabled costs are not included in calculations
- **Year-over-Year Projections**: Detailed table showing wealth progression over time
- **Detailed Breakdown**: Expandable rows showing individual investments and costs per year
  - **Investment Income**: Shows all active investments with inflated amounts
  - **Cost Breakdown**: Shows all active costs with deductions
  - **Year 0 Value**: Each investment and cost displays its purchasing power in Year 0 terms (inflation-adjusted)
- **Interactive Chart View**: Visual representation of wealth and cash flows over time
  - Line graphs for wealth, investments, and costs
  - Toggle individual lines on/off
  - Wealth lines displayed at 1/10 scale for better comparison with costs/investments
  - Tooltips show actual (non-scaled) values
  - Age displayed in year axis labels (e.g., "Y0 (42)")
  - "Net Wealth (Year 0 Prices)" line showing inflation-adjusted purchasing power
  - "Show Year 0 Prices" toggle to view all values in inflation-adjusted terms
  - Scrollable chart for viewing extended projections

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
│   │   │   ├── InvestmentEntry.tsx    # Individual investment configuration
│   │   │   ├── CostEntry.tsx          # Individual cost configuration with enable/disable
│   │   │   ├── ProjectionTable.tsx    # Year-by-year results display
│   │   │   ├── ChartView.tsx          # Interactive chart visualization
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
- **Charts**: Recharts (responsive line charts)
- **Routing**: Wouter
- **State Management**: React Hooks (useState, useEffect)
- **Persistence**: Browser localStorage
- **Build Tool**: Vite
- **Server**: Express (serves frontend only)

## How It Works

### Calculation Logic

1. **Interest Application**: Each year, interest is calculated and added to the starting wealth
2. **Investment Income**: Investments are added to wealth (after interest)
   - Fixed amounts adjusted for inflation: `amount × (1 + inflation)^year`
3. **Cost Deduction**: Costs are then deducted from the wealth (after interest and investments)
   - **Fixed costs** increase each year based on inflation
   - **Percentage costs** are calculated from wealth after interest is applied
4. **Year 0 Value**: Each investment and cost's purchasing power is calculated in Year 0 terms by deflating the inflated amount
5. **Carry Forward**: Ending wealth becomes the starting wealth for the next year

**Formula per year:**
```
endingWealth = startingWealth + interest + investments - costs
```

### Example Calculation

```
Year 0:
- Starting Wealth: $100,000
- Interest (7.5%): +$7,500
- Wealth after Interest: $107,500
- Investment Income: +$20,000 (Year 0 Value: $20,000)
- Wealth with Investments: $127,500
- Fixed Cost: -$50,000 (Year 0 Value: $50,000)
- Ending Wealth: $77,500

Year 1:
- Starting Wealth: $77,500
- Interest (7.5%): +$5,812.50
- Wealth after Interest: $83,312.50
- Investment (inflation-adjusted 3%): +$20,600 (Year 0 Value: $20,000)
- Wealth with Investments: $103,912.50
- Fixed Cost (inflation-adjusted 3%): -$51,500 (Year 0 Value: $50,000)
- Ending Wealth: $52,412.50

Year 2:
- Starting Wealth: $52,412.50
- Interest (7.5%): +$3,930.94
- Wealth after Interest: $56,343.44
- Investment (inflation-adjusted 3%): +$21,218 (Year 0 Value: $20,000)
- Wealth with Investments: $77,561.44
- Fixed Cost (inflation-adjusted 3%): -$53,045 (Year 0 Value: $50,000)
- Ending Wealth: $24,516.44
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
- Birth year (for age calculation on charts)

**InvestmentEntry**: Individual investment configuration
- Investment name
- Annual amount input
- Start year (0-based from start year)
- Duration in years
- Remove button

**CostEntry**: Individual cost configuration
- Enable/disable checkbox (disabled costs are not included in calculations)
- Cost name
- Type selector (fixed vs percentage)
- Amount input (adapts based on type)
- Start year (0-based from start year)
- Duration in years
- Remove button
- Visual indication when disabled (reduced opacity)

**ProjectionTable**: Displays wealth projections
- Year-by-year breakdown
- Expandable investment and cost details
- Responsive column visibility
- Formatted currency display
- Year 0 Value calculations

**ChartView**: Interactive visualization of projections
- Line graphs for net wealth, investments, and costs
- Dual wealth lines: nominal and inflation-adjusted (Year 0 prices)
- Wealth lines scaled at 1/10 for better visual comparison
- Tooltips display actual (non-scaled) values
- Toggle visibility of individual lines
- Age display in year axis (e.g., "Y0 (42)")
- "Show Year 0 Prices" toggle for inflation-adjusted view
- Purple dashed line for Year 0 wealth (purchasing power)
- Scrollable horizontal axis for extended projections
- Color-coded lines for different investments and costs

### State Management

The application uses React state to manage:
- Initial settings (wealth, interest, inflation, year)
- Investments array (multiple investment entries)
- Costs array (multiple cost entries)
- Projections array (calculated from settings + investments + costs)

Calculations run automatically via `useEffect` whenever any input changes, providing real-time updates.

## Usage Guide

1. **Set Initial Parameters**
   - Enter your starting wealth
   - Set expected yearly interest rate on your wealth
   - Set average inflation rate
   - Choose a start year (default: 2026)

2. **Add Investment Income**
   - Click "Add Investment" button
   - Enter a descriptive name (e.g., "Rental Income", "Dividends")
   - Set the annual amount
   - Choose when the investment starts (Year 0 = first year)
   - Set how many years the investment continues
   - Remove any investment by clicking the trash icon

3. **Add Costs**
   - Click "Add Cost" button
   - Enter a descriptive name
   - Choose cost type:
     - **Fixed Amount**: For expenses like rent, subscriptions
     - **Percentage of Wealth**: For lifestyle expenses tied to wealth
   - Set when the cost starts (Year 0 = first year)
   - Set how many years the cost applies
   - Use the checkbox to enable/disable costs without deleting them
   - Disabled costs are excluded from all calculations
   - Remove any cost by clicking the trash icon

4. **Review Projections**
   - View 30 years of projections by default
   - Click "Show 10 More Years" to extend the projection
   - **Chart View**: 
     - Interactive line graphs showing wealth trajectory over time
     - Toggle individual lines on/off (wealth, investments, costs)
     - Hover over any point to see detailed values
     - View age progression in the year axis
     - Toggle "Show Year 0 Prices" to see inflation-adjusted values
     - Compare nominal wealth vs purchasing power (Year 0 prices)
   - **Table View**:
     - Click on any year to see detailed breakdown
     - **Investment Income**: All active investments with Year 0 Values
     - **Cost Breakdown**: All active costs with Year 0 Values
     - **Net Wealth**: Final wealth after all transactions
   - Adjust inputs to see different scenarios

5. **Automatic Saving**
   - All changes are automatically saved to your browser
   - Refresh the page anytime - your data will persist
   - Clear browser data to reset the calculator

## Design Philosophy

- **Mobile-First**: Optimized for small screens with progressive enhancement
- **Immediate Feedback**: All calculations update instantly
- **Simple & Clean**: Focused interface without unnecessary complexity
- **Accessible**: Proper labels, keyboard navigation, and semantic HTML

## Recent Updates

### Chart Visualization (Completed)
- Interactive line charts using Recharts
- Toggleable lines for wealth, investments, and costs
- Wealth lines scaled at 1/10 for better visualization
- Age display in year axis based on birth year
- Year 0 prices view for inflation-adjusted analysis
- Dual wealth lines showing both nominal and real purchasing power

### Cost Management Enhancements (Completed)
- Enable/disable checkbox for each cost
- Disabled costs excluded from calculations
- Visual feedback for disabled state

### Age Tracking (Completed)
- Birth year input in settings
- Dynamic age calculation: (start year - birth year) + year number
- Age displayed in chart year axis labels

## Future Enhancements

Potential features for future development:
- Save/load multiple scenarios
- Export to CSV/PDF
- Scenario comparison (side-by-side)
- One-time events (windfalls, major purchases)
- Percentage-based investments (e.g., portfolio growth)
- Tax considerations
- Social Security/pension income modeling
