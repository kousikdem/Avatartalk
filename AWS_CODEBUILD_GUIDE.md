# AWS CodeBuild Configuration Guide

## Overview
This buildspec.yml configures AWS CodeBuild to build the React + Vite frontend application using Yarn.

## Prerequisites

### 1. AWS CodeBuild Project Settings

**Environment:**
- Environment image: `Managed image`
- Operating system: `Amazon Linux 2`
- Runtime: `Standard`
- Image: `aws/codebuild/standard:7.0` (includes Node.js 20)
- Image version: `Always use the latest`
- Environment type: `Linux`
- Privileged: `No` (not required)

**Service Role:**
- Create a new service role or use existing with necessary permissions
- Required permissions: S3, CloudWatch Logs, ECR (if using Docker)

### 2. Environment Variables (Required)

Configure these in CodeBuild project → Environment → Additional configuration → Environment variables:

| Name | Value | Type |
|------|-------|------|
| `VITE_SUPABASE_URL` | Your Supabase URL | Plaintext |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase key | Plaintext or Secrets Manager |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID | Plaintext |
| `VITE_SITE_URL` | Your production URL | Plaintext |
| `NODE_OPTIONS` | `--max-old-space-size=8192` | Plaintext |

**Security Best Practice:**
Store sensitive keys in AWS Secrets Manager and reference them:
```
Name: VITE_SUPABASE_PUBLISHABLE_KEY
Value: arn:aws:secretsmanager:region:account:secret:supabase-key
Type: SECRETS_MANAGER
```

### 3. Buildspec File Location

**Option A: Root of repository (current setup)**
- File: `/buildspec.yml`
- CodeBuild setting: Leave "Buildspec name" empty (uses default)

**Option B: Custom location**
- File: `/aws/buildspec.yml`
- CodeBuild setting: Set "Buildspec name" to `aws/buildspec.yml`

### 4. Source Configuration

**GitHub:**
- Repository: Connect your GitHub repository
- Branch: `main` or `master`
- Webhook: Enable for automatic builds on push

**CodeCommit:**
- Repository: Your AWS CodeCommit repository
- Branch: `main` or `master`

### 5. Artifacts Configuration

**Primary artifact:**
- Type: `Amazon S3`
- Bucket name: `your-bucket-name`
- Name: `build-artifacts`
- Packaging: `Zip` (optional)
- Artifacts encryption: `Default AWS managed key`

**Or for static website:**
- Type: `Amazon S3`
- Bucket name: `your-static-website-bucket`
- Enable: `Insert build commands in build spec`
- Artifacts packaging: `None` (copy files directly)

### 6. Compute Configuration

**Recommended:**
- Compute: `3 GB memory, 2 vCPUs` (sufficient for most builds)
- Timeout: `30 minutes`
- Queued timeout: `8 hours`

**For large applications:**
- Compute: `7 GB memory, 4 vCPUs`
- Increase Node memory: `NODE_OPTIONS=--max-old-space-size=8192`

---

## Build Process

### Phase 1: Install
1. Installs Node.js 20 runtime
2. Installs Yarn 1.22.22 globally
3. Navigates to `frontend/` directory
4. Installs dependencies using `yarn install --frozen-lockfile`

### Phase 2: Pre-Build
1. Validates environment variables
2. Creates `.env` file from environment variables
3. Runs ESLint (non-blocking)

### Phase 3: Build
1. Executes `yarn build`
2. Outputs to `frontend/dist/`
3. Displays bundle sizes

### Phase 4: Post-Build
1. Logs completion status
2. Prepares artifacts

---

## Deployment Options

### Option 1: S3 + CloudFront (Static Website)

**buildspec.yml addition (post_build):**
```yaml
post_build:
  commands:
    - cd frontend
    - echo "Deploying to S3..."
    - aws s3 sync dist/ s3://$S3_BUCKET_NAME --delete
    - echo "Invalidating CloudFront cache..."
    - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DIST_ID --paths "/*"
```

**Required environment variables:**
- `S3_BUCKET_NAME`: Your S3 bucket for hosting
- `CLOUDFRONT_DIST_ID`: Your CloudFront distribution ID

**IAM Permissions needed:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::your-bucket/*", "arn:aws:s3:::your-bucket"]
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::account-id:distribution/*"
    }
  ]
}
```

### Option 2: Elastic Beanstalk

**Additional file needed: `.ebextensions/nodecommand.config`**
```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
```

**Modify artifacts section:**
```yaml
artifacts:
  files:
    - 'frontend/dist/**/*'
    - 'frontend/package.json'
    - '.ebextensions/**/*'
```

### Option 3: ECS/Fargate (Docker)

**Add Dockerfile to project root:**
```dockerfile
FROM nginx:alpine
COPY frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Modify buildspec.yml post_build:**
```yaml
post_build:
  commands:
    - echo "Building Docker image..."
    - docker build -t $ECR_REPO_URI:$CODEBUILD_RESOLVED_SOURCE_VERSION .
    - docker push $ECR_REPO_URI:$CODEBUILD_RESOLVED_SOURCE_VERSION
```

---

## Troubleshooting

### Issue: "npm install exited with 1"
**Cause:** Trying to use npm instead of yarn

**Solution:** Verify buildspec.yml uses `yarn install` (already fixed in provided config)

### Issue: "VITE_SUPABASE_URL is not defined"
**Cause:** Environment variables not set in CodeBuild project

**Solution:**
1. Go to CodeBuild project → Edit → Environment
2. Add all required VITE_* variables
3. Rebuild

### Issue: "Out of memory" during build
**Cause:** Insufficient compute resources

**Solution:**
1. Increase compute to 7 GB memory
2. Add environment variable: `NODE_OPTIONS=--max-old-space-size=8192`
3. Rebuild

### Issue: "yarn: command not found"
**Cause:** Yarn not installed in build environment

**Solution:** Already handled in buildspec.yml install phase (installs Yarn globally)

### Issue: Build succeeds but artifacts are empty
**Cause:** Incorrect artifacts base-directory

**Solution:** Verify `base-directory: 'frontend/dist'` matches your build output location

### Issue: "frozen-lockfile" fails
**Cause:** package.json and yarn.lock out of sync

**Solution:**
```bash
# Locally run:
cd frontend
yarn install
git add yarn.lock
git commit -m "Update yarn.lock"
git push
```

---

## Monitoring & Logs

### View Build Logs
1. AWS Console → CodeBuild → Build history
2. Click on build ID
3. View "Build logs" tab
4. Enable CloudWatch Logs for persistent storage

### Build Metrics
- Duration: Typical build time 2-5 minutes
- Success rate: Monitor in CloudWatch
- Cache hit rate: Check cache effectiveness

### Notifications
**Set up SNS notifications:**
1. CodeBuild → Notifications
2. Create notification rule
3. Events: Build state change (failed, succeeded)
4. Target: SNS topic → Email/Slack

---

## Cost Optimization

### Caching
- Enabled in buildspec.yml for `node_modules`
- Reduces build time by ~50%
- Saves compute costs

### Build Triggers
- Use webhooks only for important branches (main, develop)
- Avoid building on every commit to feature branches
- Use pull request builds sparingly

### Compute Sizing
- Start with 3 GB memory
- Monitor build times and memory usage
- Upgrade only if needed

---

## Best Practices

1. **Environment Variables**: Never commit secrets to buildspec.yml
2. **Cache**: Always cache `node_modules` to speed up builds
3. **Artifacts**: Only include necessary files in artifacts
4. **Timeout**: Set realistic timeout (5-30 minutes)
5. **Notifications**: Set up failure notifications
6. **Branch Strategy**: Different buildspec for different branches if needed

---

## Quick Setup Checklist

- [ ] Create CodeBuild project in AWS Console
- [ ] Configure environment (Amazon Linux 2, Standard 7.0)
- [ ] Add environment variables (VITE_*)
- [ ] Connect source repository (GitHub/CodeCommit)
- [ ] Set buildspec file location (default: /buildspec.yml)
- [ ] Configure artifacts (S3 bucket or deployment target)
- [ ] Set up IAM role with necessary permissions
- [ ] Enable CloudWatch Logs
- [ ] Create SNS notification rule for build failures
- [ ] Test build manually
- [ ] Enable webhook for automatic builds

---

**Last Updated:** 2025-03-26  
**Compatible With:** Node.js 20, Yarn 1.22.22, Vite 5.x  
**AWS CodeBuild Version:** 2.0
