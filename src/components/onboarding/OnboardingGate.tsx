import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface OnboardingGateProps {
  children: React.ReactNode;
}

const OnboardingGate: React.FC<OnboardingGateProps> = ({ children }) => {
  const { user } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('is_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding:', error);
          // If error, assume onboarding not needed to avoid blocking
          setNeedsOnboarding(false);
        } else if (!data) {
          // No record exists, needs onboarding
          setNeedsOnboarding(true);
        } else {
          // Record exists, check if completed
          setNeedsOnboarding(!data.is_completed);
        }
      } catch (err) {
        console.error('Error in onboarding check:', err);
        setNeedsOnboarding(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default OnboardingGate;
