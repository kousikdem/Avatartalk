import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import PricingPage from '@/components/PricingPage';
import VisitorAuth from '@/components/VisitorAuth';

const EnhancedAvatarStudio = lazy(() => import('@/components/EnhancedAvatarStudio'));

export type IndexMode = 'public' | 'authed';

const Index: React.FC<{ mode?: IndexMode }> = ({ mode }) => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const authParam = searchParams.get('auth');
  const [showVisitorAuth, setShowVisitorAuth] = useState(false);

  // If user was redirected here from a protected route (?auth=login),
  // open the auth modal straight away.
  useEffect(() => {
    if (mode === 'public' && authParam === 'login') {
      setShowVisitorAuth(true);
      localStorage.setItem('hasSeenVisitorAuth', 'true');
    }
  }, [authParam, mode]);

  // Public-only visitor auth popup (first visit)
  useEffect(() => {
    if (mode !== 'public') return;
    if (authParam === 'login') return; // already handled above
    if (localStorage.getItem('hasSeenVisitorAuth')) return;

    const t = setTimeout(() => {
      setShowVisitorAuth(true);
      localStorage.setItem('hasSeenVisitorAuth', 'true');
    }, 2000);

    return () => clearTimeout(t);
  }, [mode, authParam]);

  // Authenticated mode: never re-check session here (App already decided).
  if (mode === 'authed') {
    if (view === 'avatar') return <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}><EnhancedAvatarStudio /></Suspense>;
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
