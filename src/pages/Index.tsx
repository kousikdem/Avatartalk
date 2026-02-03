import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import PricingPage from '@/components/PricingPage';
import EnhancedAvatarStudio from '@/components/EnhancedAvatarStudio';
import VisitorAuth from '@/components/VisitorAuth';

export type IndexMode = 'public' | 'authed';

const Index: React.FC<{ mode?: IndexMode }> = ({ mode }) => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const [showVisitorAuth, setShowVisitorAuth] = useState(false);

  // Public-only visitor auth popup (first visit)
  useEffect(() => {
    if (mode !== 'public') return;
    if (localStorage.getItem('hasSeenVisitorAuth')) return;

    const t = setTimeout(() => {
      setShowVisitorAuth(true);
      localStorage.setItem('hasSeenVisitorAuth', 'true');
    }, 2000);

    return () => clearTimeout(t);
  }, [mode]);

  // Authenticated mode: never re-check session here (App already decided).
  if (mode === 'authed') {
    if (view === 'avatar') return <EnhancedAvatarStudio />;
    return <Dashboard />;
  }

  // Public mode: show pricing page via query param
  if (view === 'pricing') {
    return (
      <>
        <Navbar showAuth={true} />
        <PricingPage />
      </>
    );
  }

  // Default landing page (only for non-authenticated users)
  return (
    <>
      <Navbar showAuth={true} />
      <LandingPage />
      
      {/* Auto Pop-up Visitor Auth Modal */}
      <VisitorAuth 
        isOpen={showVisitorAuth} 
        onClose={() => setShowVisitorAuth(false)} 
      />
    </>
  );
};

export default Index;
