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
VITE_SUPABASE_URL=https://hnxnvdzrwbtmcohdptfq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_uaL-zelOHdGlOlvaWuIa1A_wtL7mx3p
VITE_SUPABASE_PROJECT_ID=hnxnvdzrwbtmcohdptfq
```

---

*Last Updated: March 8, 2026*
