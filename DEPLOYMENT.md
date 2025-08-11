# Deployment Guide

This document outlines the deployment process for the Nivaro application using GitHub Actions, Cloudflare Pages, and Cloudflare Workers.

## Overview

The deployment workflow is designed to provide:
- **Continuous Integration**: Automated testing on pull requests
- **Staging Deployments**: Automatic deployment to staging on main branch pushes  
- **Production Deployments**: Tagged releases trigger production deployment
- **Multi-environment Support**: Separate staging and production environments

## Architecture

- **Frontend**: Next.js application deployed to Cloudflare Pages
- **Backend**: Rust-based Cloudflare Worker for API endpoints
- **CI/CD**: GitHub Actions for automated testing and deployment

## Environments

### Staging
- **Frontend**: `nivaro-frontend-staging.pages.dev`
- **Backend**: `nivaro-backend-staging.workers.dev`
- **Triggered by**: Pushes to `main` branch

### Production  
- **Frontend**: `nivaro-frontend.pages.dev` (custom domain configurable)
- **Backend**: `nivaro-backend.workers.dev` (custom domain configurable) 
- **Triggered by**: Git tags matching `v*.*.*` pattern

## Required Secrets

Configure these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Zone:Read, Account:Read permissions | `abc123...` |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID | `def456...` |

### Getting Cloudflare Credentials

1. **API Token**: 
   - Go to [Cloudflare API Tokens](https://dash.cloudflare.com/api-tokens)
   - Create token with permissions: `Account:Read`, `User:Read`, `Zone:Read`, `Zone:Edit`
   - Copy the token value

2. **Account ID**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Select your account, copy Account ID from the right sidebar

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on every pull request and push to main/develop:
- Installs dependencies
- Runs linting and tests
- Builds both frontend and backend
- Ensures code quality before merging

### 2. Staging Deployment (`.github/workflows/deploy-staging.yml`)

Runs on pushes to `main` branch:
- Builds frontend with static export
- Deploys to Cloudflare Pages staging project
- Builds backend Rust Worker
- Deploys to Cloudflare Workers staging environment

### 3. Production Deployment (`.github/workflows/deploy-production.yml`)

Runs on version tags (e.g., `v1.0.0`):
- Builds and deploys to production environments
- Creates GitHub release with deployment details
- Provides production-ready builds

## Deployment Process

### Staging Deployment

Staging deployments happen automatically:

1. Push code to `main` branch
2. GitHub Actions triggers staging workflow
3. Frontend deployed to staging Cloudflare Pages
4. Backend deployed to staging Cloudflare Workers
5. Test your changes on staging environment

### Production Deployment

Production deployments use git tags:

1. Create and push a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Actions triggers production workflow
3. Builds are deployed to production environments
4. GitHub release is created automatically

## Configuration

### Frontend Configuration (`app/next.config.ts`)

- Static export enabled for Cloudflare Pages compatibility
- Image optimization disabled (Cloudflare handles this)
- Trailing slashes enabled for consistent routing

### Backend Configuration (`backend/wrangler.toml`)

- Separate environment configurations for staging/production
- Environment variables configured per environment
- Build command specified for automated deployment

### Environment Variables

Set these in your Cloudflare dashboard for each environment:

| Variable | Description | Staging Value | Production Value |
|----------|-------------|---------------|------------------|
| `ENVIRONMENT` | Environment name | `staging` | `production` |
| `API_BASE_URL` | Base URL for API calls | `https://nivaro-backend-staging.workers.dev` | `https://nivaro-backend.workers.dev` |

## Monitoring and Troubleshooting

### Viewing Deployments

- **Cloudflare Pages**: Visit [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
- **Cloudflare Workers**: Visit [Cloudflare Workers Dashboard](https://dash.cloudflare.com/workers)
- **GitHub Actions**: Check the Actions tab in your GitHub repository

### Common Issues

1. **Build Failures**: Check GitHub Actions logs for detailed error messages
2. **Deployment Errors**: Verify Cloudflare credentials and permissions
3. **Static Export Issues**: Ensure all dynamic routes have proper fallbacks

### Logs and Debugging

- **Frontend Logs**: Available in Cloudflare Pages dashboard
- **Backend Logs**: Available in Cloudflare Workers dashboard using `wrangler tail`
- **Local Development**: Use `npm run dev` (frontend) and `wrangler dev` (backend)

## Security Considerations

- API tokens should have minimal required permissions
- Environment secrets are encrypted in GitHub Actions
- Production deployments only triggered by authorized tags
- Staging and production environments are isolated

## Rollback Process

If issues occur in production:

1. **Quick Rollback**: Deploy previous working tag
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

2. **Manual Rollback**: Use Cloudflare dashboard to rollback to previous deployment

## Future Enhancements

- Custom domain configuration
- Database migration workflows  
- Blue-green deployment strategy
- Performance monitoring integration
- Automated security scanning