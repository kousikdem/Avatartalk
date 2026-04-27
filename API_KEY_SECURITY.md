# API Key Security - Implementation Guide

## ✅ Current Security Status

**Scan Results:**
- ✅ No hardcoded API keys found in codebase
- ✅ Backend uses `os.getenv()` for all secrets
- ✅ Frontend uses `import.meta.env.VITE_*`
- ✅ `.env` files in `.gitignore`

---

## 🔐 Environment Variable Best Practices

### Backend (Python/FastAPI)

**File:** `/app/backend/.env`

```bash
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=avatartalk

# Third-party APIs (Examples)
OPENAI_API_KEY=sk-proj-...
STRIPE_SECRET_KEY=sk_live_...
SUPABASE_SERVICE_KEY=your_service_role_key
AWS_ACCESS_KEY=AKIA...
AWS_SECRET_KEY=...

# WebRTC (Optional)
TURN_SERVER_URL=turn:server.com:3478
TURN_SERVER_USERNAME=username
TURN_SERVER_PASSWORD=password

# Email Service
SENDGRID_API_KEY=SG....
RESEND_API_KEY=re_...

# SMS Service
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
```

**Usage in Code:**

```python
import os
from fastapi import HTTPException

# Always use os.getenv() with validation
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set")

# Use in API calls
import openai
openai.api_key = OPENAI_API_KEY

# OR with default fallback (for non-critical keys)
DEBUG_MODE = os.getenv("DEBUG_MODE", "false").lower() == "true"
```

---

### Frontend (React/Vite)

**File:** `/app/frontend/.env`

```bash
# Supabase (Public keys - safe to expose)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SUPABASE_PROJECT_ID=your_project_id

# Site Configuration
VITE_SITE_URL=https://your-domain.com

# Stripe (Public key - safe to expose)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Analytics (Public - safe to expose)
VITE_GOOGLE_ANALYTICS_ID=G-...
VITE_MIXPANEL_TOKEN=...

# ⚠️ NEVER put secret keys in frontend .env
# ❌ WRONG: VITE_STRIPE_SECRET_KEY=sk_live_...
# ❌ WRONG: VITE_OPENAI_API_KEY=sk-proj-...
```

**Usage in Code:**

```typescript
// Access Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validation
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase configuration missing');
}

// Use in initialization
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

## 🔒 Naming Conventions

### Backend Environment Variables

**Pattern:** `[SERVICE]_[TYPE]_[DESCRIPTOR]`

```bash
# Service Provider
OPENAI_API_KEY=...
STRIPE_SECRET_KEY=...
TWILIO_AUTH_TOKEN=...

# Database
MONGO_URL=...
POSTGRES_CONNECTION_STRING=...
REDIS_URL=...

# AWS
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_NAME=...

# Auth
JWT_SECRET_KEY=...
SESSION_SECRET=...
ENCRYPTION_KEY=...
```

### Frontend Environment Variables

**Pattern:** `VITE_[SERVICE]_[TYPE]`

```bash
# All frontend vars MUST start with VITE_
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_STRIPE_PUBLISHABLE_KEY=...
VITE_API_BASE_URL=...
```

---

## 🚫 What NOT to Do

### ❌ NEVER Hardcode Keys

```python
# ❌ WRONG - Hardcoded secret
API_KEY = "sk_live_abc123xyz456789"

# ❌ WRONG - Hardcoded in function
def get_data():
    headers = {"Authorization": "Bearer sk-proj-abc123"}
    ...

# ✅ CORRECT
API_KEY = os.getenv("MY_SERVICE_API_KEY")
```

### ❌ NEVER Commit .env Files

```bash
# .gitignore should have:
.env
.env.local
.env.production
.env.development
*.env

# ✅ CORRECT: Commit .env.example instead
.env.example  # Template with dummy values
```

### ❌ NEVER Put Secret Keys in Frontend

```typescript
// ❌ WRONG - Secret key exposed to browser
const STRIPE_SECRET = import.meta.env.VITE_STRIPE_SECRET_KEY;

// ✅ CORRECT - Only public keys
const STRIPE_PUBLIC = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
```

---

## 📝 .env.example Template

Create this file for team members:

**Backend: `/app/backend/.env.example`**

```bash
# Copy this file to .env and fill in your values
# DO NOT commit .env to git

# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=avatartalk

# OpenAI (Get from: https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-your_key_here

# Stripe (Get from: https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Supabase (Get from: https://supabase.com/dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Email (Optional - Resend.com)
RESEND_API_KEY=re_your_key_here

# WebRTC TURN Server (Optional)
TURN_SERVER_URL=turn:server.com:3478
TURN_SERVER_USERNAME=username
TURN_SERVER_PASSWORD=password
```

**Frontend: `/app/frontend/.env.example`**

```bash
# Copy this file to .env and fill in your values
# ONLY VITE_ prefixed variables are exposed to browser

# Supabase Public Keys (Safe to expose)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# Site Configuration
VITE_SITE_URL=http://localhost:3000

# Stripe Public Key (Safe to expose)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

---

## 🔍 Security Audit Script

Create `/app/scripts/check-api-keys.sh`:

```bash
#!/bin/bash
# Check for hardcoded API keys in codebase

echo "🔍 Scanning for hardcoded API keys..."

# Check for common API key patterns
grep -r -i \
  -E "(api[_-]?key|secret[_-]?key|access[_-]?key).*=.*['\"][a-zA-Z0-9]{20,}" \
  --include="*.py" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=dist \
  /app/frontend/src /app/backend || echo "✅ No hardcoded keys found"

# Check for .env files in git
if git ls-files | grep -q "\.env$"; then
  echo "❌ WARNING: .env file tracked in git!"
else
  echo "✅ .env files not tracked in git"
fi

echo "✅ Security audit complete"
```

---

## 🌐 Production Deployment

### Vercel (Frontend)

**Add environment variables in Vercel Dashboard:**
1. Project Settings → Environment Variables
2. Add each VITE_* variable
3. Separate values for Production/Preview/Development

### Railway/Heroku (Backend)

**Set environment variables via CLI:**

```bash
# Railway
railway variables set OPENAI_API_KEY=sk-proj-...

# Heroku
heroku config:set OPENAI_API_KEY=sk-proj-...
```

### AWS/Docker (Backend)

**Use secrets manager:**

```bash
# AWS Secrets Manager
aws secretsmanager create-secret \
  --name /avatartalk/openai-key \
  --secret-string "sk-proj-..."

# Docker Compose
docker-compose run -e OPENAI_API_KEY=sk-proj-... app
```

---

## ✅ Verification Checklist

**Before Deployment:**

- [ ] All API keys moved to `.env` files
- [ ] `.env` files added to `.gitignore`
- [ ] `.env.example` created with dummy values
- [ ] No hardcoded secrets in code (run audit script)
- [ ] Backend uses `os.getenv()` for all secrets
- [ ] Frontend uses `import.meta.env.VITE_*` only
- [ ] Production environment variables configured
- [ ] Secret keys never in frontend
- [ ] Public keys (publishable/anonymous) safe to expose

**Run Security Audit:**

```bash
# Check for hardcoded keys
./scripts/check-api-keys.sh

# Verify .gitignore
git status --ignored | grep .env

# Test environment loading
python -c "import os; print('✅' if os.getenv('OPENAI_API_KEY') else '❌')"
```

---

## 🆘 Emergency: Key Exposed

If you accidentally commit an API key:

1. **Rotate the key immediately:**
   - OpenAI: https://platform.openai.com/api-keys
   - Stripe: https://dashboard.stripe.com/apikeys
   - Supabase: Project Settings → API

2. **Remove from git history:**
```bash
# Remove file from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: destructive)
git push origin --force --all
```

3. **Update key in all environments:**
   - Development: Update `.env`
   - Staging: Update deployment config
   - Production: Update environment variables

4. **Monitor for unauthorized usage**

---

## 📊 API Key Types Reference

| Type | Location | Exposure Risk | Example |
|------|----------|---------------|---------|
| **Secret/Private** | Backend only | HIGH | `sk_live_...`, `sk-proj-...` |
| **Publishable/Public** | Frontend safe | LOW | `pk_live_...`, `sb_publishable_...` |
| **Service Role** | Backend only | CRITICAL | Service keys with admin access |
| **Anonymous** | Frontend safe | NONE | Supabase anon key |

---

## 🎯 Summary

**Current Status:**
- ✅ No hardcoded API keys detected
- ✅ Proper environment variable usage
- ✅ Security best practices followed

**Best Practices:**
1. Always use environment variables
2. Never commit `.env` files
3. Use `.env.example` for templates
4. Validate keys at startup
5. Rotate keys regularly
6. Monitor for unauthorized usage

**Quick Reference:**
- Backend: `os.getenv("SERVICE_API_KEY")`
- Frontend: `import.meta.env.VITE_SERVICE_KEY`
- Never: `const key = "sk_live_abc123"`

---

**Status:** ✅ **Secure**  
**Last Audit:** 2025-03-26  
**Next Review:** Every deployment
