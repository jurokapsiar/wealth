# Wealth Projection Calculator & ETF Viewer

## Overview
This project provides a comprehensive financial planning application with two primary tools: a Wealth Projection Calculator and an ETF Historical Data Viewer. The **Wealth Projection Calculator** is a mobile-first tool designed to help users visualize their financial future by factoring in interest growth, inflation, investment income, and various expenses. The **ETF Historical Data Viewer** allows users to analyze past performance of Exchange Traded Funds using real-time data. The overarching goal is to empower users with clear insights into their financial trajectory and investment performance, enabling informed decision-making for long-term wealth management.

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
    *   Supports comparison of multiple ETFs on interactive charts.
    *   Allows custom date ranges for analysis with real-time validation (highlights invalid dates like Feb 30).
    *   **IndexedDB Caching**: Historical data cached permanently (no expiration) to reduce API calls and improve performance.
    *   **Cache-First Strategy**: Checks cache before making API calls, displays toast notification showing cached vs. fetched data.
    *   **Mobile-Friendly Tables**: Horizontal scrolling for wide tables with sticky Year and YoY Change columns at the beginning. Both columns remain visible during scroll with fixed widths (Year: 80px, YoY: 96px).
*   **UI/UX**: Emphasizes a mobile-first, responsive design with a clean and intuitive interface. A sticky header with badges for quick navigation to cost entries is implemented for mobile users.
*   **Project Structure**: The codebase is organized into `client/` (React app), `server/` (minimal Express), and `shared/` (type definitions).

## External Dependencies
*   **Twelve Data API**: Used for fetching real-time and historical ETF data.
*   **Recharts**: A composable charting library for React used for interactive graphs.
*   **Shadcn UI**: A collection of re-usable components built with Radix UI and Tailwind CSS.