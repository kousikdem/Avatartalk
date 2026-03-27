# AWS CodeBuild - Quick Fix Reference

## 🚨 Common Errors & Solutions

### Error 1: "npm install exited with 1"
**Error Message:**
```
[Container] Command did not exit successfully npm install exit status 1
```

**Cause:** Trying to use npm instead of yarn, or package-lock.json conflicts

**Solution:**
1. Verify buildspec.yml uses `yarn install` (not npm)
2. Remove package-lock.json: `rm -f frontend/package-lock.json`
3. Commit and push changes
4. Rebuild

**Buildspec.yml should have:**
```yaml
install:
  commands:
    - npm install -g yarn@1.22.22
    - cd frontend
    - yarn install --frozen-lockfile
```

---

### Error 2: "ENOENT: no such file or directory"
**Error Message:**
```
Error: ENOENT: no such file or directory, open 'package.json'
```

**Cause:** CodeBuild is in wrong directory

**Solution:** Add `cd frontend` before yarn commands
```yaml
install:
  commands:
    - npm install -g yarn@1.22.22
    - cd frontend  # ← Add this
    - yarn install
```

---

### Error 3: Environment variables not defined
**Error Message:**
```
error during build:
RollupError: "import.meta.env.VITE_SUPABASE_URL" is not exported
```

**Cause:** Environment variables not set in CodeBuild project

**Solution:**
1. Go to CodeBuild → Your project → Edit → Environment
2. Scroll to "Additional configuration"
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SITE_URL`
4. Save and rebuild

**Or add to buildspec.yml pre_build:**
```yaml
pre_build:
  commands:
    - cd frontend
    - cat > .env << EOF
      VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
      EOF
```

---

### Error 4: "yarn: command not found"
**Error Message:**
```
/bin/sh: yarn: command not found
```

**Cause:** Yarn not installed in CodeBuild environment

**Solution:** Add yarn installation in install phase:
```yaml
install:
  runtime-versions:
    nodejs: 20
  commands:
    - npm install -g yarn@1.22.22  # ← Add this
    - yarn --version  # Verify
```

---

### Error 5: Build timeout
**Error Message:**
```
Phase context status code: CLIENT_ERROR Message: Unable to complete build after X minutes
```

**Cause:** Build taking too long (default timeout: 60 minutes)

**Solutions:**
1. **Increase timeout:**
   - CodeBuild → Edit → Timeout → Set to 30-60 minutes

2. **Enable caching:**
```yaml
cache:
  paths:
    - 'frontend/node_modules/**/*'
```

3. **Use larger compute:**
   - CodeBuild → Edit → Environment → Compute: 7 GB memory

---

### Error 6: Out of memory (OOM)
**Error Message:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Cause:** Insufficient memory for Vite build

**Solutions:**
1. **Increase Node memory:**
   - Add environment variable: `NODE_OPTIONS=--max-old-space-size=8192`

2. **Use larger compute instance:**
   - CodeBuild → Edit → Environment → 7 GB memory (instead of 3 GB)

3. **Update package.json:**
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=8192' vite build"
  }
}
```

---

### Error 7: "frozen-lockfile" fails
**Error Message:**
```
error Your lockfile needs to be updated, but yarn was run with `--frozen-lockfile`.
```

**Cause:** package.json and yarn.lock are out of sync

**Solution:**
```bash
# Locally:
cd frontend
rm -rf node_modules yarn.lock
yarn install
git add yarn.lock package.json
git commit -m "Update yarn.lock"
git push
```

Then rebuild in CodeBuild.

---

### Error 8: Artifacts empty or not found
**Error Message:**
```
CLIENT_ERROR: No files found at specified base directory 'frontend/dist'
```

**Cause:** Build output directory doesn't match artifacts path

**Solutions:**
1. **Verify build succeeds:**
   - Check build logs for "✓ built in Xs"

2. **Check artifacts path in buildspec.yml:**
```yaml
artifacts:
  files:
    - '**/*'
  base-directory: 'frontend/dist'  # Must match Vite output
```

3. **Debug in buildspec.yml:**
```yaml
post_build:
  commands:
    - ls -lah frontend/dist/  # Check files exist
    - pwd  # Verify directory
```

---

### Error 9: Git clone fails
**Error Message:**
```
CLIENT_ERROR: fatal: could not read Username for 'https://github.com'
```

**Cause:** CodeBuild can't access Git repository

**Solutions:**
1. **For GitHub:** Use CodeBuild GitHub integration
   - CodeBuild → Source → GitHub → Connect using OAuth

2. **For private repos:**
   - Use personal access token or SSH key
   - Store in AWS Secrets Manager

3. **Check IAM permissions:**
   - CodeBuild service role needs access to repository

---

### Error 10: S3 upload fails
**Error Message:**
```
CLIENT_ERROR: Unable to upload artifacts: Access Denied
```

**Cause:** CodeBuild role lacks S3 permissions

**Solution:**
1. Go to IAM → Roles → Find CodeBuild service role
2. Attach policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::your-bucket-name/*",
        "arn:aws:s3:::your-bucket-name"
      ]
    }
  ]
}
```
3. Rebuild

---

## 🔧 Quick Diagnostics

### Check 1: Verify buildspec.yml syntax
```bash
# Locally test:
cat buildspec.yml | python -c "import yaml,sys;yaml.safe_load(sys.stdin)"
```

### Check 2: Test build locally
```bash
# Simulate CodeBuild:
cd frontend
yarn install --frozen-lockfile
yarn build
```

### Check 3: View detailed logs
1. CodeBuild → Build history → Click build ID
2. Click "Build logs" tab
3. Look for red error messages
4. Search for "Error:" or "FATAL:"

### Check 4: Enable CloudWatch Logs
1. CodeBuild → Edit → Logs
2. Enable CloudWatch logs
3. Set log group name
4. Rebuild and check CloudWatch

---

## ✅ Pre-Build Checklist

Before starting AWS CodeBuild:

- [ ] `buildspec.yml` exists in repository root
- [ ] Uses `yarn install` (not npm)
- [ ] Node.js 20 specified in runtime-versions
- [ ] All VITE_* environment variables configured
- [ ] Artifacts base-directory set to `frontend/dist`
- [ ] yarn.lock committed to repository
- [ ] No package-lock.json in repository
- [ ] .env files NOT committed (use environment variables)
- [ ] Timeout set appropriately (30 minutes recommended)
- [ ] Caching enabled for node_modules
- [ ] IAM role has necessary permissions

---

## 🆘 Still Having Issues?

### Run diagnostic script locally:
```bash
/app/scripts/test-aws-codebuild.sh
```

### Enable verbose logging in buildspec.yml:
```yaml
phases:
  build:
    commands:
      - set -x  # Enable verbose mode
      - yarn build
```

### Check AWS CodeBuild documentation:
- [Buildspec reference](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)
- [Troubleshooting](https://docs.aws.amazon.com/codebuild/latest/userguide/troubleshooting.html)

---

**Last Updated:** 2025-03-26  
**Tested With:** AWS CodeBuild Standard 7.0, Node.js 20, Yarn 1.22.22
