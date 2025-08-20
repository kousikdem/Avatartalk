
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/components/AuthGuard';
import { ProfileSetup } from '@/components/ProfileSetup';
import Dashboard from '@/components/Dashboard';
import ProfilePage from '@/components/ProfilePage';
import { NotFound } from '@/pages/NotFound';
import { useUserProfile } from '@/hooks/useUserProfile';

export const AppRouter = () => {
  const { profileData, loading } = useUserProfile();
  const [profileSetupComplete, setProfileSetupComplete] = useState(false);

  useEffect(() => {
    if (profileData && profileData.username) {
      setProfileSetupComplete(true);
    }
  }, [profileData]);

  return (
    <Router>
      <AuthGuard>
        {loading ? (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
        ) : !profileSetupComplete ? (
          <ProfileSetup onComplete={() => setProfileSetupComplete(true)} />
        ) : (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Navigate to={`/${profileData?.username}`} replace />} />
            <Route path="/:username" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </AuthGuard>
    </Router>
  );
};
