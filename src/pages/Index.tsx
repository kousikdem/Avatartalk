
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import PricingPage from '@/components/PricingPage';
import EnhancedAvatarStudio from '@/components/EnhancedAvatarStudio';
import VisitorAuth from '@/components/VisitorAuth';
import VoiceTextChat from '@/components/VoiceTextChat';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const Index = () => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVisitorAuth, setShowVisitorAuth] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Show visitor auth popup for first-time visitors
      if (!session?.user && !localStorage.getItem('hasSeenVisitorAuth')) {
        setTimeout(() => {
          setShowVisitorAuth(true);
          localStorage.setItem('hasSeenVisitorAuth', 'true');
        }, 2000);
      }
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

  // Show Enhanced Avatar Studio if authenticated and view is 'avatar'
  if (user) {
    if (view === 'avatar') {
      return <EnhancedAvatarStudio />;
    }
    if (view === 'chat') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline"
                className="mb-2"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <VoiceTextChat 
              avatarName="Mistral AI"
              profileId={user.id}
            />
          </div>
        </div>
      );
    }
    // Show dashboard for authenticated users by default
    return <Dashboard />;
  }

  // For non-authenticated users
  // Show pricing page
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
