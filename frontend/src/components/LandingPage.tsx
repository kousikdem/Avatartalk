import React, { useState } from 'react';
import MainAuth from './MainAuth';
import LandingHeader from './landing/v2/LandingHeader';
import HeroSection from './landing/v2/HeroSection';
import QuickFeatures from './landing/v2/QuickFeatures';
import UseCasesHowItWorks from './landing/v2/UseCasesHowItWorks';
import FeaturesGrid from './landing/v2/FeaturesGrid';
import LiveProfilePreview from './landing/v2/LiveProfilePreview';
import PricingSection from './landing/v2/PricingSection';
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
        {/* Row 1 — Hero + Quick features */}
        <div className={WRAP}>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_460px] xl:gap-5">
            <HeroSection onCreate={signUp} onDemo={() => scrollToSection('live-preview')} />
            <QuickFeatures />
          </div>
        </div>

        {/* Row 2 — Use cases + How it works */}
        <div className={WRAP}>
          <UseCasesHowItWorks />
        </div>

        {/* Row 3 — Features grid / Pricing  +  Live profile / Social proof */}
        <div className={WRAP}>
          <div className="grid gap-4 xl:grid-cols-12 xl:gap-5">
            <div className="xl:col-span-5 xl:row-start-1">
              <FeaturesGrid />
            </div>
            <div className="xl:col-span-7 xl:col-start-6 xl:row-span-2 xl:row-start-1">
              <LiveProfilePreview onCreate={signUp} />
            </div>
            <div className="xl:col-span-5 xl:row-start-2">
              <PricingSection onSelectPlan={signUp} />
            </div>
          </div>
        </div>

        {/* Row 4 — Final CTA */}
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
