
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import MainAuth from '@/components/MainAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <MainAuth 
          isOpen={true} 
          onClose={() => {}} 
          defaultTab="signin"
        />
      </div>
    );
  }

  return <>{children}</>;
};
