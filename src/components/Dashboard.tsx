
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import ShareModal from './ShareModal';
import EnhancedDashboard from './EnhancedDashboard';

const Dashboard = () => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { profileData, loading } = useUserProfile();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header Section with Share Button */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Welcome Back!</h1>
          <p className="text-muted-foreground">Manage your AI avatar and track your interactions</p>
        </div>
        
        <Button 
          onClick={() => setIsShareOpen(true)}
          variant="default"
          size="default"
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          <Share2 className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Share Profile</span>
          <span className="sm:hidden">Share</span>
        </Button>
      </div>

      <EnhancedDashboard />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        profileUrl={profileData?.public_link || `${window.location.origin}/profile`}
        username={profileData?.username || 'user'}
      />
    </div>
  );
};

export default Dashboard;
