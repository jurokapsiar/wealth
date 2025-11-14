# Wealth Projection Calculator & Financial Data Viewers

## Overview
This project provides a comprehensive financial planning application with three primary tools: a Wealth Projection Calculator, an ETF Historical Data Viewer, and an Inflation Historical Data Viewer. The **Wealth Projection Calculator** is a mobile-first tool designed to help users visualize their financial future by factoring in interest growth, inflation, investment income, and various expenses. The **ETF Historical Data Viewer** allows users to analyze past performance of Exchange Traded Funds using real-time data. The **Inflation Historical Data Viewer** enables users to track and compare inflation rates across countries over time. The overarching goal is to empower users with clear insights into their financial trajectory, investment performance, and economic trends, enabling informed decision-making for long-term wealth management.

## User Preferences
I prefer simple language and clear explanations. I value immediate feedback and iterative development. Please ensure all calculations update in real-time as inputs are adjusted. I like clean, intuitive interfaces and prefer a mobile-first design approach. All data and settings should persist automatically in the browser's local storage. I expect to be able to manage multiple financial scenarios (save, load, and delete). I also prefer that any changes related to styling or UI components utilize Tailwind CSS and Shadcn UI.

## System Architecture
The application is a single-page application built with **React and TypeScript** for the frontend, styled using **Tailwind CSS and Shadcn UI**. **Recharts** is used for interactive data visualization. **Wouter** handles client-side routing, and **React Hooks** manage state. Data persistence is achieved via **Browser localStorage**, eliminating the need for a complex backend, though a minimal **Express server** serves the frontend.

**Key Features and Design Decisions:**
*   **Wealth Projection Calculator**:
    *   **Real-time Calculations**: All financial projections (initial wealth, interest, inflation, investment income, fixed/percentage-based costs) update instantly upon input changes.
    *   **Detailed Breakdown**: Year-over-year projections include expandable rows showing inflation-adjusted "Year 0 Value" for investments and costs.
    *   **Interactive Chart View**: Visualizes wealth, investments, and costs over time with toggleable lines, age display, and "Net Wealth (Year 0 Prices)" for inflation-adjusted purchasing power. Wealth lines are scaled for better comparison.
    *   **Scenario Management**: Allows users to save, load, and delete multiple financial scenarios, with automatic persistence to localStorage.
    *   **Cost Management**: Costs can be enabled/disabled without deletion and are categorized as fixed amounts (inflation-adjusted) or percentages of wealth.
*   **ETF Historical Data Viewer**:
    *   Fetches and displays historical monthly closing prices from an external API.
    *   Provides month-over-month and year-over-year performance analysis.
    *   **CAGR Calculation**: Displays Compound Annual Growth Rate (average yearly percentage) for each ETF, accounting for cumulative multiplication across the entire data range.
    *   Supports comparison of multiple ETFs on interactive charts with toggleable percentage view.
    *   **Percentage Mode**: Charts can toggle between absolute prices and percentage increase from initial value, allowing direct performance comparison regardless of price scale.
    *   **Year Slider**: Interactive slider allows selecting a starting year for analysis, dynamically recalculating CAGR and percentage baselines from the selected year onward.
    *   **Dynamic Legend**: Chart legend displays each ETF's CAGR value (e.g., "SPY - +12.45% avg/yr"), updating in real-time as the year slider changes.
    *   Allows custom date ranges for analysis with real-time validation (highlights invalid dates like Feb 30).
    *   **IndexedDB Caching**: Historical data cached permanently (no expiration) to reduce API calls and improve performance.
    *   **Cache-First Strategy**: Checks cache before making API calls, displays toast notification showing cached vs. fetched data.
    *   **Mobile-Friendly Tables**: Horizontal scrolling for wide tables with sticky Year and YoY Change columns at the beginning. Both columns remain visible during scroll with fixed widths (Year: 80px, YoY: 96px).
*   **Inflation Historical Data Viewer**:
    *   Loads and displays historical inflation rates (2000-2023) from CSV files in World Bank format.
    *   **CSV Data Source**: 30 countries with monthly data stored in `/public/data/inflation/{ISO3}.csv`
    *   **Country Selector**: Dropdown selector with 30 major economies (US, EU, G7, G20), sorted alphabetically.
    *   **Date Range Selection**: Custom date range inputs with real-time validation (same pattern as ETF viewer).
    *   **Average Inflation Calculation**: Displays average inflation rate across all years for each country (arithmetic mean, not CAGR).
    *   **Interactive Chart**: Line chart comparing inflation rates across multiple countries over time.
    *   **Year Slider**: Interactive slider to select starting year for analysis, dynamically recalculating average inflation from selected year onward.
    *   **Dynamic Legend**: Chart legend displays each country's average inflation rate (e.g., "United States - 2.09% avg"), updating in real-time as year slider changes.
    *   **YoY Tables**: Year-over-year tables with sticky Year and Avg YoY columns at the beginning, showing average inflation for each year.
    *   **Color Coding**: Visual indicators for inflation levels - red for high (≥3%), yellow for medium (≥2%), green for low (<2%).
    *   **Dual Caching**: In-memory cache for instant reloads + IndexedDB for permanent storage (cache version: v2).
    *   **Legacy Cache Migration**: Automatically migrates old Trading Economics cache entries to new CSV format in background.
    *   **CSV Lazy Loading**: CSV files loaded on-demand per country with retry logic (2 attempts, 500ms delay).
    *   **Mobile-Friendly Tables**: Horizontal scrolling with sticky columns (Year: 80px, Avg YoY: 96px).
*   **UI/UX**: Emphasizes a mobile-first, responsive design with a clean and intuitive interface. A sticky header with badges for quick navigation to cost entries is implemented for mobile users.
*   **Project Structure**: The codebase is organized into `client/` (React app), `server/` (minimal Express), and `shared/` (type definitions).

## External Dependencies
*   **Twelve Data API**: Used for fetching real-time and historical ETF data.
*   **Recharts**: A composable charting library for React used for interactive graphs.
*   **Shadcn UI**: A collection of re-usable components built with Radix UI and Tailwind CSS.

## Technical Implementation Notes
*   **Inflation Data Architecture**: The Inflation Viewer is fully frontend-based, loading CSV files from `/public/data/inflation/` directory:
    *   **CSV Format**: World Bank format with Year,Month,Value columns (288 rows per country: 2000-2023, monthly)
    *   **Static File Serving**: Express serves `/public` directory in development mode via `express.static('public')`
    *   **Cache Strategy**: Check in-memory cache → check IndexedDB v2 cache → check legacy cache → fetch CSV
    *   **Data Validation**: All data points validated (year>1900, 1≤month≤12, value is number); invalid points logged and skipped
    *   **Legacy Migration**: Old Trading Economics cache entries automatically migrated to v2 format in background
    *   **localStorage Migration**: User selections automatically converted from country names to ISO3 codes on first load
*   **Curated Country List**: The application includes 30 major economies (US, EU countries, G7, G20 members) with reliable inflation data from 2000-2023.