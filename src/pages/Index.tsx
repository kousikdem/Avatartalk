import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import PricingPage from '@/components/PricingPage';
import EnhancedAvatarStudio from '@/components/EnhancedAvatarStudio';
import VisitorAuth from '@/components/VisitorAuth';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const [showVisitorAuth, setShowVisitorAuth] = useState(false);
  const [user, setUser] = useState<any>(undefined); // undefined = checking, null = no user

  // Single fast check - no loading state needed since App.tsx already handles initial auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      // Show visitor auth popup for first-time visitors only
      if (!session?.user && !localStorage.getItem('hasSeenVisitorAuth')) {
        setTimeout(() => {
          setShowVisitorAuth(true);
          localStorage.setItem('hasSeenVisitorAuth', 'true');
        }, 2000);
      }
    });
  }, []);

  // Show nothing briefly while checking - App.tsx handles the main loading
  if (user === undefined) {
    return null;
  }

  // Show Enhanced Avatar Studio if authenticated and view is 'avatar'
  if (user) {
    if (view === 'avatar') {
      return <EnhancedAvatarStudio />;
    }
    // Show dashboard for authenticated users by default
    return <Dashboard />;
  }

  // For non-authenticated users - show pricing page
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
