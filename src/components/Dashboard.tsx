
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
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 pt-20 pb-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gradient-to-r from-blue-400/60 to-purple-400/60 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 p-6">
      {/* Header Section with Share Button */}
      <div className="mb-8">
        <div className="flex items-center justify-end mb-6">
          <Button 
            onClick={() => setIsShareOpen(true)}
            variant="default"
            className="bg-gradient-to-r from-blue-400/80 to-purple-400/80 hover:from-blue-500/90 hover:to-purple-500/90 text-white shadow-lg hover:shadow-xl"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
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
