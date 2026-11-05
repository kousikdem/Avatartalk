import React, { useState } from 'react';
import MainAuth from './MainAuth';
import LandingHeader from './landing/v2/LandingHeader';
import HeroSection from './landing/v2/HeroSection';
import QuickFeatures from './landing/v2/QuickFeatures';
import UseCasesHowItWorks from './landing/v2/UseCasesHowItWorks';
import FeaturesGrid from './landing/v2/FeaturesGrid';
import LiveProfilePreview from './landing/v2/LiveProfilePreview';
import PricingSection from './landing/v2/PricingSection';
import SocialProof from './landing/v2/SocialProof';
import SeeInAction from './landing/v2/SeeInAction';
import FinalCTA from './landing/v2/FinalCTA';
import LandingFooter from './landing/v2/LandingFooter';
import { scrollToSection, WRAP } from './landing/v2/assets';

/**
 * AvatarTalk public landing page — bento layout that mirrors the design mockup.
 *  Row 1: Hero · Quick features
 *  Row 2: Use cases · How it works
 *  Row 3: Features grid + Pricing (left) · Live @kousik profile + Social proof (right)
 *  Row 4: Final CTA · Footer
 * On mobile/tablet every block stacks in reading order.
 */
const LandingPage: React.FC = () => {
  const [auth, setAuth] = useState<{ open: boolean; tab: 'signin' | 'signup' }>({ open: false, tab: 'signup' });
  const openAuth = (tab: 'signin' | 'signup') => setAuth({ open: true, tab });
  const signUp = () => openAuth('signup');

  return (
    <div
      data-testid="landing-page"
      className="relative min-h-screen overflow-x-hidden bg-[#F6F3FF] text-slate-900 antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* soft page glows */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[900px] bg-[radial-gradient(60%_50%_at_20%_0%,#E9DFFF_0%,transparent_70%),radial-gradient(40%_40%_at_90%_10%,#F3D9FF_0%,transparent_70%)]" />

      <LandingHeader onSignIn={() => openAuth('signin')} onSignUp={signUp} />

      <main className="relative space-y-4 pt-[76px] sm:space-y-5">
        {/* 2 — Hero */}
        <div className={WRAP}>
          <HeroSection onCreate={signUp} onDemo={() => scrollToSection('live-preview')} />
        </div>

        {/* 3 — Quick features bar */}
        <div className={WRAP}>
          <QuickFeatures />
        </div>

        {/* 4 + 5 — Use cases · How it works */}
        <div className={WRAP}>
          <UseCasesHowItWorks />
        </div>

        {/* 6 — Features grid · See it in action */}
        <div className={WRAP}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-5">
            <FeaturesGrid />
            <SeeInAction onWatch={() => scrollToSection('live-preview')} />
          </div>
        </div>

        {/* 7 — Live profile preview (@kousik) */}
        <div className={WRAP}>
          <LiveProfilePreview onCreate={signUp} />
        </div>

        {/* 8 + 9 — Pricing · Social proof */}
        <div className={WRAP}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-5">
            <PricingSection onSelectPlan={signUp} />
            <SocialProof />
          </div>
        </div>

        {/* 10 — Final CTA */}
        <div className={WRAP}>
          <FinalCTA onCreate={signUp} />
        </div>
      </main>

      <LandingFooter />

      <MainAuth
        key={auth.tab}
        isOpen={auth.open}
        defaultTab={auth.tab}
        onClose={() => setAuth((a) => ({ ...a, open: false }))}
      />
    </div>
  );
};

export default LandingPage;
