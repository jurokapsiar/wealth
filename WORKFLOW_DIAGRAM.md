# GitHub Pages Deployment Workflow Diagram

## Workflow Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Push to main branch                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            .github/workflows/deploy.yml triggers             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      BUILD JOB                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 1. Checkout code (actions/checkout@v4)                │  │
│  └───────────────────────────────────────────────────────┘  │
│                       │                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 2. Setup Node.js 20 (actions/setup-node@v4)           │  │
│  │    - Enable npm caching                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                       │                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 3. Install dependencies (npm ci)                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                       │                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 4. Build application                                   │  │
│  │    - Command: npm run build                            │  │
│  │    - Environment: NODE_ENV=production                  │  │
│  │    - Vite builds from client/ to dist/                │  │
│  │    - Base path set to /wealth/                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                       │                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 5. Upload artifact                                     │  │
│  │    - Path: ./dist                                      │  │
│  │    - Action: actions/upload-pages-artifact@v3          │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     DEPLOY JOB                               │
│  (needs: build - waits for build to complete)               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Deploy to GitHub Pages                                 │  │
│  │    - Action: actions/deploy-pages@v4                   │  │
│  │    - Deploys uploaded artifact to GitHub Pages         │  │
│  │    - Output: deployment URL                            │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Site live at GitHub Pages URL                   │
│         https://<username>.github.io/wealth/                 │
└─────────────────────────────────────────────────────────────┘
```

## Build Output Structure

```
dist/
├── .nojekyll                    # Prevents Jekyll processing
├── index.html                   # Main entry point
│                                # Assets referenced as /wealth/assets/*
├── favicon.png                  # Site icon
├── assets/
│   ├── index-[hash].js         # Main JavaScript bundle
│   └── index-[hash].css        # Main CSS bundle
└── data/
    └── inflation/
        ├── manifest.json        # Inflation data manifest
        └── *.csv                # Country-specific inflation data
```

## Key Configuration Points

### 1. Vite Configuration (vite.config.ts)
```typescript
{
  base: process.env.NODE_ENV === 'production' ? '/wealth/' : '/',
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  }
}
```

### 2. Workflow Permissions
```yaml
permissions:
  contents: read      # Read repository content
  pages: write       # Write to GitHub Pages
  id-token: write    # Authentication for deployment
```

### 3. GitHub Pages Settings (Required)
- **Repository Settings** → **Pages**
- **Source**: GitHub Actions (not branch-based)
- Site will be built and deployed automatically

## Verification Points

### Pre-deployment Checks
- ✓ Workflow syntax is valid YAML
- ✓ Required jobs (build, deploy) are defined
- ✓ Workflow has necessary permissions
- ✓ Trigger is set to `push: main`

### Build Verification
- ✓ Dependencies install successfully
- ✓ Build completes without errors
- ✓ dist/ directory is created
- ✓ index.html contains /wealth/ base path
- ✓ .nojekyll file is present
- ✓ All assets are bundled correctly

### Post-deployment Checks
- ✓ Site accessible at GitHub Pages URL
- ✓ Assets load (no 404 errors)
- ✓ Routing works correctly
- ✓ Static data files are accessible

## Comparison: GitHub Actions vs Branch-based Deployment

### GitHub Actions Method (Current) ✅
```
Push to main → GitHub Actions workflow → Build → Deploy → Live
```
**Advantages:**
- No need to maintain gh-pages branch
- Build happens in CI/CD environment
- Better security with controlled permissions
- Full control over build process

### Branch-based Method (Legacy) ❌
```
Push to main → Build locally → Push to gh-pages → Live
```
**Disadvantages:**
- Requires maintaining separate branch
- Build artifacts in git history
- Manual build and push steps
- Less secure (requires write access to branch)

## Troubleshooting Guide

### Issue: Deployment fails
**Check:**
1. GitHub Pages is enabled in repository settings
2. Source is set to "GitHub Actions"
3. Workflow has proper permissions
4. Build completes successfully

### Issue: Site shows 404
**Check:**
1. Base path is set to `/wealth/` in vite.config.ts
2. Assets are referenced with correct paths
3. .nojekyll file exists in build output

### Issue: Assets fail to load
**Check:**
1. Browser console for specific error
2. Asset paths in index.html use /wealth/ prefix
3. Build output includes assets/ directory
4. No build errors in workflow logs
