import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AvatarStudioLayout from '@/components/avatar-studio/AvatarStudioLayout';

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

  // No loading skeleton - instant render
  if (loading) {
    return null;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <AvatarStudioLayout />;
};

export default AvatarBuilderPage;