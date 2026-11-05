import React, { useState } from 'react';
import MainAuth from './MainAuth';
import LandingHeader from './landing/v2/LandingHeader';
import HeroSection from './landing/v2/HeroSection';
import QuickFeatures from './landing/v2/QuickFeatures';
import UseCasesHowItWorks from './landing/v2/UseCasesHowItWorks';
import FeaturesShowcase from './landing/v2/FeaturesShowcase';
import PricingSection from './landing/v2/PricingSection';
import SocialProof from './landing/v2/SocialProof';
import FinalCTA from './landing/v2/FinalCTA';
import LandingFooter from './landing/v2/LandingFooter';
import { scrollToSection } from './landing/v2/assets';

/**
 * AvatarTalk public landing page.
 * Sections: Header · Hero · Quick features · Use cases · How it works ·
 * Features grid (live @kousik profile with indicators) · Pricing (live from
 * Super Admin plans) · Social proof · Final CTA · Footer.
 */
const LandingPage: React.FC = () => {
  const [auth, setAuth] = useState<{ open: boolean; tab: 'signin' | 'signup' }>({ open: false, tab: 'signup' });
  const openAuth = (tab: 'signin' | 'signup') => setAuth({ open: true, tab });
  const signUp = () => openAuth('signup');

  return (
    <div
      data-testid="landing-page"
      className="min-h-screen bg-[#F7F5FF] text-slate-900 antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      <LandingHeader onSignIn={() => openAuth('signin')} onSignUp={signUp} />
      <main>
        <HeroSection onCreate={signUp} onDemo={() => scrollToSection('live-preview')} />
        <QuickFeatures />
        <UseCasesHowItWorks />
        <FeaturesShowcase onCreate={signUp} />
        <PricingSection onSelectPlan={signUp} />
        <SocialProof />
        <FinalCTA onCreate={signUp} />
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
