
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
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 pt-20 pb-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gradient-to-r from-blue-400 to-purple-400 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 p-6">
      {/* Header Section with Share Button */}
      <div className="mb-8">
        <div className="flex items-center justify-end mb-6">
          <Button 
            onClick={() => setIsShareOpen(true)}
            variant="default"
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
