import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AvatarCreationHub from '@/components/AvatarCreationHub';
import ManualAvatarCreator from '@/components/ManualAvatarCreator';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AvatarTalk.Bio - Realistic 3D Avatar Creator
          </h1>
          <p className="text-muted-foreground text-lg">
            Create hyper-realistic avatars using AI • Image Upload • Text Prompts • Manual Controls
          </p>
        </div>

        <AvatarCreationHub onAvatarCreated={(config) => {
          console.log('Avatar created:', config);
        }} />
      </div>
    </div>
  );
};

export default AvatarBuilderPage;