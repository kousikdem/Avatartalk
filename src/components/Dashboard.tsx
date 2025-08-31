
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
      <div className="min-h-[calc(100vh-12rem)] sm:min-h-[calc(100vh-16rem)] page-gradient flex items-center justify-center">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-gradient-to-r from-blue-400/60 to-purple-400/60 mx-auto"></div>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] sm:min-h-[calc(100vh-16rem)] page-gradient">
      {/* Header Section with Share Button */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center justify-end mb-4 sm:mb-6">
          <Button 
            onClick={() => setIsShareOpen(true)}
            variant="default"
            size={window.innerWidth < 640 ? "sm" : "default"}
            className="bg-gradient-to-r from-blue-500/90 to-purple-500/90 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-xs sm:text-sm"
          >
            <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Share Profile</span>
            <span className="xs:hidden">Share</span>
          </Button>
        </div>
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
