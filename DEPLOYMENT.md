# 🚀 Deployment Guide

## ✅ Pre-Deployment Checklist

Before deploying to any environment (Vercel, Railway, AWS, etc.), run:

```bash
/app/scripts/validate-deployment.sh
```

This script checks for:
- ❌ No `package-lock.json` files (npm conflicts)
- ❌ No `.npmrc` files
- ✅ `yarn.lock` exists
- ✅ Build succeeds
- ✅ Dependencies installed
- ✅ Environment files present

---

## 📦 Package Manager: YARN ONLY

**⛔ NEVER USE NPM**

- ✅ Use `yarn install` (not npm install)
- ✅ Use `yarn add <package>` (not npm install)
- ✅ Use `yarn remove <package>` (not npm uninstall)
- ✅ Use `yarn build` (not npm run build)

### Why Yarn?
- This project uses `yarn.lock` for deterministic builds
- npm causes lockfile conflicts and deployment failures
- Supervisor is configured to use `yarn start`

---

## 🔧 Environment Setup

### Frontend Environment (`/app/frontend/.env`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SITE_URL=your_production_url
```

### Backend Environment (`/app/backend/.env`)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=avatartalk
```

---

## 🌐 Deployment Platforms

### Vercel (Frontend)

**GitHub Actions Workflow:** `.github/workflows/vercel-deploy.yml`

The workflow automatically:
1. Installs Vercel CLI globally (uses npm for CLI only)
2. Pulls Vercel environment
3. Builds using `vercel build --prod` (uses yarn internally)
4. Deploys to production

**Manual Deploy:**
```bash
cd /app/frontend
yarn build
vercel --prod
```

### Railway / AWS / Other

Update build commands:
- **Install:** `yarn install`
- **Build:** `yarn build`
- **Start:** `yarn start` (dev) or serve `dist` (production)

---

## 🧪 Testing Before Deploy

### 1. Build Test
```bash
cd /app/frontend
yarn build
```

### 2. Local Preview
```bash
yarn preview
```

### 3. Full Validation
```bash
/app/scripts/validate-deployment.sh
```

---

## 🐛 Common Issues

### Issue: "Command npm install exited with 1"
**Solution:**
```bash
rm -f /app/frontend/package-lock.json /app/package-lock.json /app/frontend/.npmrc
cd /app/frontend && yarn install
```

### Issue: Dependencies out of sync
**Solution:**
```bash
cd /app/frontend
rm -rf node_modules
yarn install
```

### Issue: Build fails
**Solution:**
```bash
cd /app/frontend
yarn cache clean
yarn install
yarn build
```

---

## 📝 Quick Reference

| Action | Command |
|--------|---------|
| Install dependencies | `yarn install` |
| Add package | `yarn add <package>` |
| Remove package | `yarn remove <package>` |
| Build for production | `yarn build` |
| Start dev server | `yarn dev` |
| Preview build | `yarn preview` |
| Validate deployment | `/app/scripts/validate-deployment.sh` |

---

## ⚙️ Supervisor Services

Current services running in Kubernetes pod:

- **Frontend:** Port 3000 (uses `yarn start`)
- **Backend:** Port 8001 (uses uvicorn)
- **MongoDB:** Port 27017

Check status:
```bash
sudo supervisorctl status
```

Restart services:
```bash
sudo supervisorctl restart frontend
sudo supervisorctl restart backend
```

---

## 🔒 Security Notes

- Never commit `.env` files
- `package-lock.json` and `.npmrc` are gitignored
- Use environment variables for all secrets
- Production URLs configured in Vercel dashboard

---

**Last Updated:** 2025-03-26  
**Build System:** Vite + React + TypeScript  
**Package Manager:** Yarn 1.22.22  
**Node Version:** 20.x
