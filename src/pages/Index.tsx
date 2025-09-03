
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import FaceBuilder from '@/components/FaceBuilder';
import PricingPage from '@/components/PricingPage';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const Index = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is authenticated, show appropriate view
  if (user) {
    if (view === 'facebuilder') {
      return <FaceBuilder />;
    }
    return <Dashboard />;
  }

  // For non-authenticated users
  // Show pricing page
  if (view === 'pricing') {
    return <PricingPage />;
  }

  // Default landing page (only for non-authenticated users)
  return (
    <>
      <Navbar />
      <LandingPage />
    </>
  );
};

export default Index;
