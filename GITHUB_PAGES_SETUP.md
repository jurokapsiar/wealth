# GitHub Pages Setup Guide

This guide provides step-by-step instructions to configure GitHub Pages for the Wealth Projection Calculator, enabling automatic deployment when changes are merged to the `main` branch.

## Overview

The repository uses **GitHub Actions** for deployment (the modern approach). This means:
- ✅ No `gh-pages` branch needed
- ✅ Automatic builds on every push to `main`
- ✅ Secure deployment with proper permissions
- ✅ Build artifacts never stored in git history

## Prerequisites

- Repository owner or admin access
- The `.github/workflows/deploy.yml` workflow file (already present)
- Access to repository Settings

## Step-by-Step Setup Instructions

### Step 1: Navigate to Repository Settings

1. Go to your repository on GitHub: `https://github.com/jurokapsiar/wealth`
2. Click on the **Settings** tab (rightmost tab in the repository menu)
   - If you don't see Settings, you may not have admin access to the repository

### Step 2: Access GitHub Pages Settings

1. In the left sidebar, scroll down to the **Code and automation** section
2. Click on **Pages**

### Step 3: Configure the Source

This is the **critical step** for enabling GitHub Actions deployment:

1. Under the **Build and deployment** section, you'll see a **Source** dropdown
2. Click on the **Source** dropdown menu
3. Select **GitHub Actions** from the dropdown options

   **Important:** Do NOT select "Deploy from a branch" - that's the old method

4. Once you select **GitHub Actions**, the page will update and show:
   ```
   Use a suggested workflow, or create your own.
   ```

5. You don't need to do anything else on this page - your workflow file (`.github/workflows/deploy.yml`) is already configured

### Step 4: Save and Verify

1. The settings are automatically saved when you select **GitHub Actions**
2. You should see a confirmation message or the page will refresh
3. The **Source** should now show: **GitHub Actions**

### Step 5: Enable Deployments (if needed)

Some repositories may have deployments disabled. To check:

1. Still in **Settings**, look in the left sidebar under **Code and automation**
2. Click on **Actions** → **General**
3. Scroll to **Workflow permissions**
4. Ensure the following are enabled:
   - **Allow GitHub Actions to create and approve pull requests** (optional)
   - Workflow permissions should be set to **Read and write permissions** OR **Read repository contents and packages permissions**
   
5. Scroll down and click **Save** if you made any changes

### Step 6: Trigger the First Deployment

Now that GitHub Pages is configured, you can trigger the first deployment:

**Option A: Merge this PR**
1. Go to the Pull Request for this verification
2. Review and approve
3. Click **Merge pull request**
4. The workflow will automatically trigger

**Option B: Push to main**
1. Make any commit to the `main` branch
2. The workflow will automatically trigger

### Step 7: Monitor the Deployment

1. Go to the **Actions** tab in your repository
2. You should see a workflow run called "Deploy to GitHub Pages"
3. Click on it to see the progress
4. Wait for both jobs to complete:
   - ✅ **build** - Builds the application
   - ✅ **deploy** - Deploys to GitHub Pages

### Step 8: Access Your Site

Once the workflow completes successfully:

1. Go back to **Settings** → **Pages**
2. At the top, you'll see a success message with your site URL:
   ```
   Your site is live at https://jurokapsiar.github.io/wealth/
   ```
3. Click the **Visit site** button or navigate to the URL
4. Your Wealth Projection Calculator should be live! 🎉

## Expected Settings Summary

After completing the setup, your Pages settings should look like this:

```
┌─────────────────────────────────────────────────────────┐
│ GitHub Pages                                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ✅ Your site is live at                                 │
│    https://jurokapsiar.github.io/wealth/                │
│                                                          │
│ Build and deployment                                    │
│                                                          │
│ Source                                                   │
│ ┌──────────────────────┐                                │
│ │ GitHub Actions     ▼ │  ← Should be "GitHub Actions" │
│ └──────────────────────┘                                │
│                                                          │
│ Your GitHub Actions workflows deploy to GitHub Pages.   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Verification Checklist

After setup, verify everything is working:

- [ ] **Settings** → **Pages** shows "GitHub Actions" as Source
- [ ] Site URL is displayed: `https://jurokapsiar.github.io/wealth/`
- [ ] Workflow ran successfully (check **Actions** tab)
- [ ] Both **build** and **deploy** jobs completed
- [ ] Site is accessible at the URL
- [ ] No 404 errors on the site
- [ ] Assets (CSS, JS) load correctly

## Troubleshooting

### "I don't see the GitHub Actions option"

**Solution:** GitHub Actions for Pages may not be enabled for your repository.
1. Ensure your repository is public OR you have GitHub Pro/Team/Enterprise
2. Check that Actions are enabled: **Settings** → **Actions** → **General**
3. Contact GitHub support if the issue persists

### "The workflow doesn't trigger after merging"

**Solution:** Check workflow permissions.
1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, ensure workflows can run
3. Check that `.github/workflows/deploy.yml` exists in the `main` branch

### "Deployment fails with permission error"

**Solution:** The workflow needs proper permissions.
1. The `deploy.yml` file already has correct permissions:
   ```yaml
   permissions:
     contents: read
     pages: write
     id-token: write
   ```
2. If it still fails, check repository settings under **Settings** → **Actions** → **General** → **Workflow permissions**

### "Site shows 404 error"

**Solutions:**
1. **Wait a few minutes** - deployment can take 1-5 minutes after workflow completes
2. **Check the workflow logs** - ensure both build and deploy jobs succeeded
3. **Verify the URL** - it should be `https://jurokapsiar.github.io/wealth/` (with `/wealth/` at the end)
4. **Hard refresh your browser** - Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### "Assets fail to load (CSS/JS broken)"

**Solution:** This is usually a base path issue.
1. The `vite.config.ts` should have: `base: process.env.NODE_ENV === 'production' ? '/wealth/' : '/'`
2. This is already configured correctly in the repository
3. If issues persist, run `./verify-deployment.sh` to check the build

## What Happens on Each Push to Main

Every time you merge a PR or push directly to `main`:

1. **GitHub Actions triggers** the deploy workflow
2. **Workflow checks out** your code
3. **Installs dependencies** with `npm ci`
4. **Builds the app** with `npm run build`
   - Vite builds from `client/` to `dist/`
   - Sets base path to `/wealth/`
   - Includes `.nojekyll` file
5. **Uploads build artifact** (the `dist/` folder)
6. **Deploys to GitHub Pages** using the artifact
7. **Site updates** at `https://jurokapsiar.github.io/wealth/`
8. **Deployment takes 1-5 minutes** total

## Advanced Configuration (Optional)

### Custom Domain

If you want to use a custom domain:

1. In **Settings** → **Pages**, scroll to **Custom domain**
2. Enter your domain (e.g., `wealth.yourdomain.com`)
3. Add a CNAME record in your DNS settings pointing to `jurokapsiar.github.io`
4. Wait for DNS propagation (can take 24-48 hours)
5. Enable **Enforce HTTPS** after DNS is configured

**Note:** You'll need to update `vite.config.ts` to remove the `/wealth/` base path if using a custom domain:
```typescript
base: process.env.NODE_ENV === 'production' ? '/' : '/'
```

### Environment Variables

The workflow already sets `NODE_ENV=production` for the build. If you need additional environment variables:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add your secret name and value
4. Update `.github/workflows/deploy.yml` to use the secret:
   ```yaml
   env:
     NODE_ENV: production
     YOUR_SECRET: ${{ secrets.YOUR_SECRET }}
   ```

## Support and Documentation

- **Deployment Verification**: See [DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md)
- **Quick Start Guide**: See [QUICKSTART.md](./QUICKSTART.md)
- **Workflow Diagram**: See [WORKFLOW_DIAGRAM.md](./WORKFLOW_DIAGRAM.md)
- **GitHub Pages Docs**: https://docs.github.com/en/pages
- **GitHub Actions Docs**: https://docs.github.com/en/actions

## Summary

✅ **Setup is simple:**
1. Go to **Settings** → **Pages**
2. Set **Source** to **GitHub Actions**
3. Merge to `main` branch
4. Wait for deployment
5. Visit `https://jurokapsiar.github.io/wealth/`

The workflow handles everything else automatically! 🚀
