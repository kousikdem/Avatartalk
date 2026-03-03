# AvatarTalk.Co - AI Avatar Platform

## Project Overview

AvatarTalk.Co is an AI-powered avatar platform that allows users to create intelligent, talking AI avatars for their bio-link pages. The platform includes e-commerce, social features, analytics, and live collaboration tools.

## Technology Stack

This project is built with:

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: TanStack Query (React Query)
- **3D Graphics**: Three.js + React Three Fiber
- **Voice**: ElevenLabs + Coqui TTS
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 18+ and yarn
- Supabase account and project

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd avatar-talk

# Install dependencies
cd frontend
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
yarn dev
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

## Development

```bash
# Start dev server (port 3000)
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Run linter
yarn lint
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # Supabase integration
│   ├── lib/            # Utility functions
│   └── App.tsx         # Main app component
├── public/             # Static assets
└── supabase/           # Supabase migrations
```

## Deployment

### Netlify

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy

Configuration is already set in `netlify.toml`

### Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

Configuration is already set in `vercel.json`

## Features

- 🎙️ AI Talking Avatars
- 🧠 Personalized AI Responses
- 🛒 E-Commerce Integration
- 💰 Membership & Subscriptions
- 📊 Analytics Dashboard
- 👥 Social Features (Posts, Following, Feed)
- 🎥 Virtual Collaboration
- 📱 Fully Responsive

## Documentation

- [Deployment Guide](../DEPLOYMENT.md)
- [Supabase Setup](../SUPABASE_SETUP_COMPLETE.md)
- [Instant Load Optimizations](../INSTANT_LOAD_FIX.md)

## Support

For issues or questions, please check the documentation files in the root directory.

## License

Proprietary - All rights reserved
