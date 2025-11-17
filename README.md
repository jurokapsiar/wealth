# Wealth Projection Calculator

A client-side web application for calculating wealth projection over time with interest growth and inflation-adjusted costs. Plan your financial future with detailed year-over-year analysis.

## Features

- **Wealth Calculator**: Calculate your wealth projection over time with customizable interest rates and inflation
- **ETF Viewer**: View historical ETF data using the Twelve Data API
- **Inflation Viewer**: Analyze inflation data for 30+ countries from 2000-2023

## Deployment

This application is deployed to GitHub Pages automatically when changes are pushed to the `main` branch.

### 📋 Setup GitHub Pages

**New to GitHub Pages?** Follow the [GitHub Pages Setup Guide](./GITHUB_PAGES_SETUP.md) for detailed step-by-step instructions with screenshots.

**Quick setup:**
1. Go to repository **Settings** → **Pages**
2. Set **Source** to **GitHub Actions**
3. Merge to `main` branch to trigger deployment
4. Site will be live at `https://jurokapsiar.github.io/wealth/`

For deployment verification and troubleshooting, see [DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md).

### Deployment Verification

The deployment workflow (`.github/workflows/deploy.yml`) is verified to:
- ✅ Build the application with correct production settings
- ✅ Use the correct base path (`/wealth/`)
- ✅ Generate all required files including `.nojekyll`
- ✅ Deploy to GitHub Pages using GitHub Actions

A verification workflow (`.github/workflows/verify-deployment.yml`) automatically checks the build configuration on pull requests.

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
