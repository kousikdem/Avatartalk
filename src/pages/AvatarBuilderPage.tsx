import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import RealisticAvatarBuilder from '@/components/RealisticAvatarBuilder';

const AvatarBuilderPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Redirect to login if not authenticated
      if (!session?.user) {
        window.location.href = '/';
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        window.location.href = '/';
      }
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

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <RealisticAvatarBuilder />;
};

export default AvatarBuilderPage;