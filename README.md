# Wealth Projection Calculator

A client-side web application for calculating wealth projection over time with interest growth and inflation-adjusted costs. Plan your financial future with detailed year-over-year analysis.

## Features

- **Wealth Calculator**: Calculate your wealth projection over time with customizable interest rates and inflation
- **ETF Viewer**: View historical ETF data using the Twelve Data API
- **Inflation Viewer**: Analyze inflation data for 30+ countries from 2000-2023

## Deployment

This application is deployed to GitHub Pages automatically when changes are pushed to the `main` branch.

### GitHub Pages Setup

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Build and deployment", set:
   - **Source**: GitHub Actions
4. The site will be automatically deployed on every push to the main branch

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI components
- **Recharts** - Data visualization
- **Wouter** - Client-side routing

## Project Structure

```
wealth/
├── client/
│   ├── public/          # Static assets
│   │   └── data/        # Static inflation data (CSV files)
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── lib/         # Utilities and helpers
│       └── data/        # Data utilities
├── .github/
│   └── workflows/       # GitHub Actions workflows
└── dist/                # Build output (generated)
```

## License

MIT
