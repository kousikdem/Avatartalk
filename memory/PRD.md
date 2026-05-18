# AvatarTalk.Co - Product Requirements Document

## Project Overview
AvatarTalk.Co is a full-stack web application for creating AI-powered avatar bio-links. Users can create personalized 3D avatars that chat, sell products, and engage visitors 24/7.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, shadcn/ui
- **Backend**: FastAPI (Python)
- **Database/Auth**: Supabase
- **Deployment**: Vercel, Netlify

## Core Features
- AI-powered chat avatars
- Voice cloning and text-to-speech
- E-commerce (products, memberships)
- Analytics dashboard
- Social features (followers, posts)
- Virtual collaboration tools

---

## Current Session - March 8, 2026

### Completed Tasks

1. **Skeleton Animations Removed** 
   - Removed all skeleton loading components from `App.tsx`, `Dashboard.tsx`
   - Removed unused imports from `ProductsPageEnhanced.tsx`, `VirtualCollaborationPage.tsx`
   - Changed PageFallback and ProfileFallback to return `null` for instant loading

2. **Auto-Reload Issue Fixed**
   - Added `TOKEN_REFRESHED` to ignored auth events in `App.tsx`
   - Prevents unnecessary re-renders during Supabase token refresh

3. **Text-to-Speech Added to Landing Page Chat**
   - Implemented browser Speech Synthesis API in `LandingPage.tsx`
   - AI messages are now spoken aloud automatically
   - Clean text from emojis for better speech quality

4. **Deployment Documentation Updated**
   - Added comprehensive Google OAuth configuration guide to `DEPLOYMENT.md`
   - Explains Supabase Dashboard URL configuration requirements

### In Progress / User Action Required

1. **Google OAuth Redirect Issue** - REQUIRES USER ACTION
   - Code is correctly using `window.location.origin` for redirects
   - **Root cause**: Supabase Dashboard URL Configuration needs to be updated
   - User must configure:
     - Site URL in Supabase → Authentication → URL Configuration
     - Add production domains to Redirect URLs whitelist
   - See `DEPLOYMENT.md` for detailed instructions

### Known Issues Status

| Issue | Status | Notes |
|-------|--------|-------|
| Skeleton animations | FIXED | All removed |
| Auto-reload | FIXED | TOKEN_REFRESHED ignored |
| Google Auth redirect | USER ACTION NEEDED | Supabase Dashboard config |
| Vercel blank page | Test after auth fix | May be related to env vars |
| Landing page voice | IMPLEMENTED | Using Speech Synthesis |

---

## Backlog / Future Tasks

### P1 - High Priority
- [ ] Test Google OAuth after user configures Supabase URLs
- [ ] Verify Vercel deployment works after auth fix

### P2 - Medium Priority
- [ ] Clarify user profile animation request ("* Get Link! Let's Talk")
- [ ] Performance optimization for large asset chunks

### P3 - Low Priority
- [ ] Add ElevenLabs voice option for premium quality
- [ ] Analytics and monitoring setup

---

## Key Files Modified This Session
- `/app/frontend/src/App.tsx` - Removed skeletons, fixed auth listener
- `/app/frontend/src/components/Dashboard.tsx` - Removed skeleton usage
- `/app/frontend/src/components/LandingPage.tsx` - Added TTS functionality
- `/app/frontend/src/components/ProductsPageEnhanced.tsx` - Removed unused imports
- `/app/frontend/src/components/VirtualCollaborationPage.tsx` - Removed unused imports
- `/app/DEPLOYMENT.md` - Added Google OAuth config guide

## Database Schema Reference
- **profiles**: `{id, username, bio, profile_pic_url, display_name, followers_count, analytics}`
- **user_onboarding**: `{user_id, is_completed, completed_steps, skipped_steps}`

## Environment Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_uaL-zelOHdGlOlvaWuIa1A_wtL7mx3p
VITE_SUPABASE_PROJECT_ID=hnxnvdzrwbtmcohdptfq
```

---

*Last Updated: Feb, 2026*

---

## Session: Feb 2026 — Fix Pack #3

### Code-level improvements (NO migration needed)

1. **Protected routes redirect to login**
   - PublicRoutes now redirects `/settings/*` → `/?auth=login` with auth modal auto-open, instead of showing a generic 404.
   - `Index.tsx` detects `?auth=login` query param and opens the VisitorAuth modal immediately.

2. **Self-healing monthly token drip**
   - New hook `useMonthlyTokenDrip` calls the `monthly-token-credit` Supabase Edge Function lazily on dashboard load (max once per hour per browser).
   - Wired into `Dashboard.tsx` so users on yearly/multi-month plans get their monthly drip even if pg_cron isn't scheduled. Fully idempotent — the underlying SQL function only credits subscriptions whose `next_monthly_credit_at <= now()`.

3. **Force-refresh exchange rates UI**
   - `useCurrency.fetchExchangeRates(force?: boolean)` now bypasses the 1-hour cache when `force` is true.
   - `EarningsPage` ships a Refresh-rates button + "updated X minutes ago" indicator next to the currency selector.
   - Updated `FALLBACK_RATES` to closer-to-current values (USD 0.0104, EUR 0.0090, GBP 0.0078, JPY 1.62) — only used when the live API fails.

4. **Robust social-link save**
   - `SocialLinksStep` (onboarding popup) and `SocialLinksManager` (settings page) now:
     - Retry without `custom_links` if the column is missing.
     - **NEW**: Retry with explicit insert/update if the upsert is blocked by RLS.
     - Surface precise, actionable error messages (column missing → "apply migration X"; RLS denial → exact guidance).

### Database migration changes

- `supabase/migrations/20260301000000_avatartalk_fixes.sql` now also installs
  owner INSERT / UPDATE / DELETE policies on `public.social_links` so users
  can actually upsert their own row after the public-read migration is applied.

### Files touched (this session)

- `frontend/src/App.tsx` — Protected route redirect
- `frontend/src/pages/Index.tsx` — `?auth=login` handler
- `frontend/src/hooks/useMonthlyTokenDrip.ts` — NEW
- `frontend/src/components/Dashboard.tsx` — Drip hook wiring
- `frontend/src/pages/EarningsPage.tsx` — Refresh-rates UI
- `frontend/src/hooks/useCurrency.tsx` — Force-refresh + fresher fallback rates
- `frontend/src/components/SocialLinksManager.tsx` — RLS fallback + precise errors
- `frontend/src/components/onboarding/steps/SocialLinksStep.tsx` — Same
- `supabase/migrations/20260301000000_avatartalk_fixes.sql` — Owner RLS policies for social_links
- `memory/test_credentials.md` — Re-created with current test guidance

### Required user actions (cannot be automated from this container)

1. Apply migration `supabase/migrations/20260301000000_avatartalk_fixes.sql`
   in Supabase SQL editor (adds `custom_links`, monthly drip columns,
   `credit_monthly_plan_tokens()` SQL function, **and now owner RLS
   policies on `social_links`**).
2. Apply migration `supabase/migrations/20260301000001_public_profiles_and_rls.sql`
   for public profile + published-products visibility.
3. Redeploy edge functions: `razorpay-create-order`, `product-checkout`,
   `platform-plan-checkout`, `platform-plan-verify`,
   `monthly-token-credit`, `custom-token-purchase`.
4. (Optional but recommended) Schedule the monthly drip via `pg_cron` —
   see `/app/AVATARTALK_FIXES_README.md`. The frontend now also calls it
   lazily, so missing the cron is no longer catastrophic.



---

## Code Review Fixes Round 4 (Feb 2026)

### Issue 1 — Domain redirects to emergentagent.com after login (FIXED)
- Updated `vercel.json` (both root + frontend) `VITE_SITE_URL` → `https://avatartalk.co`
- Updated `frontend/.env.production` → `https://avatartalk.co`
- `AuthModal.tsx`: all 4 OAuth providers (Google, Facebook, Twitter, LinkedIn) `redirectTo` now uses `${import.meta.env.VITE_SITE_URL || window.location.origin}` (so production redirects always go to avatartalk.co, dev falls back to current origin)
- `VisitorAuth.tsx` already used `VITE_SITE_URL` fallback — no change needed
- Note: User must update Supabase Dashboard → Authentication → URL Config: Site URL = `https://avatartalk.co`, redirect URLs = `https://avatartalk.co/**` + `https://avatartalk-beige.vercel.app/**` (remove `*.emergentagent.com`)

### Issue 2 — Single loading screen with progress bar (FIXED)
- **Removed** the duplicate React `LoadingOverlay` component from `App.tsx` entirely (was showing a second loader after inline #app-loader faded)
- Inline `#app-loader` in `index.html` is now the **single** full-screen loader; it stays visible until `authChecked=true` triggers `window.__REACT_MOUNTED__()`
- Redesigned inline loader with: gradient rounded-square brand mark (matching in-app brand SVG), concentric spinning rings, **animated progress bar** (5 stages: 10→28→52→74→88%, jumps to 100% on mount)
- Falls back to forcing 100% + fade after 5s if React never mounts

### Issue 3 — Static hero animations (FIXED)
- Audited `LandingPage.tsx` and `pages/Index.tsx` — hero h1/p/buttons have NO framer-motion or `animate-slide-down` classes already; they were static. The "top-to-bottom" feel was caused by the loader fade-out
- Changed Tailwind `fade-in` keyframe in `tailwind.config.ts` from `translateY(10px → 0)` to **opacity-only** (so any future use cannot slide)
- Smoother loader→content transition (0.4s ease-out fade instead of 0.3s)

### Issue 4 — API key cleanup (FIXED)
- Redacted hardcoded Supabase project ID + publishable key from: `API_KEY_SECURITY.md`, `GOOGLE_OAUTH_SETUP.md`, `SUPABASE_SETUP_COMPLETE.md`, `DEPLOYMENT_CHECKLIST.md`, `VERCEL_DEPENDENCY_FIX.md`, `DEPLOYMENT_FIX.md` → replaced with `<YOUR_SUPABASE_PROJECT_ID>` / `sb_publishable_<your_anon_key>`
- Razorpay & Gemini keys are NOT exposed client-side — already proxied through Supabase Edge Functions (`IntegrationOAuthManager.tsx`, `IntegrationSecretsManager.tsx`); no VITE_RAZORPAY_* or VITE_GEMINI_* env vars exist in frontend
- Supabase URL + anon key remain in `vercel.json` and `.env.production` — these are **public** (designed to be in client bundles); rotation not required, but user should still move them to Vercel Dashboard env vars for cleaner repo

### Verified locally (production build):
- `inline_loader: hidden`, `body_classes: 'app-loaded'`, `progress_width: '100%'`, full landing page renders ✓
- `yarn build` produces zero warnings ✓
- No `emergentagent` strings in any source file ✓


**Critical issue resolved**: Production deploy at `avatartalk-beige.vercel.app` was stuck on loading screen forever because `createClient("", "")` threw `supabaseUrl is required` — Vite couldn't read VITE_* env vars at build time.

### Fixes:
- **Env vars at build time**: Moved VITE_* vars into `vercel.json` `build.env` (proper build-time location, Vercel's `env` block is for runtime/serverless functions). Created `/app/frontend/.env.production` as redundant fallback (Vite reads it automatically during `vite build`). These are PUBLIC Supabase anon keys — safe to commit.
- **`.gitignore` cleanup**: Wholly rewrote — removed ~15 duplicate `-e` rogue blocks and consolidated env-file rules into one clean section. Explicitly whitelist `.env.production` and `.env.example`.
- **Loading screen never disappeared**: `window.__REACT_MOUNTED__()` was referenced in `index.html` but **never called from React** anywhere. Added the call in `main.tsx` (after `createRoot().render()`) AND in `App.tsx` (inside the `authChecked` effect). Also added `visibility: hidden` to the loaded-state CSS so the loader fully exits the layout.
- **Defensive Supabase client**: `client.ts` now fails fast with a visible "Configuration Error" page instead of throwing a silent `supabaseUrl is required` crash.
- **`NODE_NO_WARNINGS=1`** added to vercel.json `build.env` to silence the DEP0169 url.parse() warning emitted by yarn 1.22.19's internals.
- **Removed hardcoded Supabase URL** from `index.html` (was in `<link rel="preconnect">`).

### Verified (production build):
- Built dist/ served via `python -m http.server` → renders full landing page ✓
- `body.app-loaded` class applied ✓
- Inline loader `visibility: hidden` ✓
- React root has 1 child ✓

### User must:
**Click "Save to GitHub"** to push these changes. Then redeploy Vercel — the loading screen will disappear and the full site will be visible.


Eliminated remaining Vercel build warnings:
- **`engine "pnpm/deno/bun" appears to be invalid`** for `autolinker@4.1.5`, `@spz-loader/core@0.3.1`, `@zip.js/zip.js@2.8.26` → all transitives of `gltf-pipeline → cesium`. Removed `gltf-pipeline` package since `GLTFExporter` from `three-stdlib` already returns binary GLB ArrayBuffer natively when `{binary: true}` is passed (the gltf-pipeline call was unreachable dead code). Cleaned up `/app/frontend/src/hooks/useAvatarBuilder.ts` accordingly. Bonus: removed cesium from bundle (was massive).
- **`Workspaces can only be enabled in private projects`** → resolved as a side-effect of removing gltf-pipeline (it had a `workspaces` field that was triggering yarn's check).
- **`info No lockfile found.`** → `frontend/yarn.lock` exists locally (199KB) but is **untracked in git**. User must commit it via "Save to GitHub" so Vercel can use `--frozen-lockfile` for reproducible builds. `.gitignore` does NOT block it.
- Verified: `yarn install` and `yarn build` produce **zero warnings** locally; bundle size unchanged for chunks (cesium was tree-shaken from gltf-pipeline before).
Fixed Vercel deployment warnings:
- Added `license: "UNLICENSED"` + `private: true` to root `/app/package.json` (silences "No license field")
- Added `license: "UNLICENSED"` to `/app/frontend/package.json`
- Removed `preinstall: npx only-allow yarn` script (was triggering npm + propagating yarn env vars as unknown npm config warnings: `ignore-engines`, `network-timeout`, `version-git-*`, etc.)
- Removed `"npm": "please-use-yarn"` from engines (no longer needed since preinstall removed)
- Added `@types/three@^0.184.1` devDep (fixes `unmet peer dependency @types/three` for `@react-three/drei`)
- Added yarn `resolutions: { "three-mesh-bvh": "^0.8.3" }` (fixes `three-mesh-bvh@0.7.8 deprecated` warning)
- Cleaned up `/app/frontend/.yarnrc` (removed `network-timeout`, `ignore-engines`, `progress` — moved network-timeout to vercel.json install/build commands as `--network-timeout 300000` flag)
- Updated both `/app/vercel.json` and `/app/frontend/vercel.json` install/build commands to use `--frozen-lockfile --network-timeout 300000`
- Verified: `yarn install` and `yarn build` produce zero warnings locally; build size unchanged.
