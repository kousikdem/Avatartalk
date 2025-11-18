
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Users, MessageSquare, BarChart3, Calendar, LogOut, Settings, Home, ShoppingBag } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import ShareModal from './ShareModal';
import ChangeableAvatarPreview from './ChangeableAvatarPreview';
import RealtimeFollowWidget from './RealtimeFollowWidget';
import { useFollows } from '@/hooks/useFollows';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { profileData, loading } = useUserProfile();
  const { following, refetch } = useFollows(profileData?.id);
  const { toast } = useToast();

  // Realtime follows updates for stats - refetch profile data
  React.useEffect(() => {
    if (!profileData?.id) return;

    const channel = supabase
      .channel('dashboard-follows-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profileData.id}`
        },
        () => {
          // Profile data will auto-refresh from useUserProfile
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileData?.id, refetch]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
      
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto bg-white p-6">
      {/* Header Section with Share and Logout Buttons */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Manage your AI avatar and track your interactions</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsShareOpen(true)}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Share Profile</span>
            <span className="sm:hidden">Share</span>
          </Button>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{profileData?.followers_count || 0}</div>
            <p className="text-xs text-gray-600">+20% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(profileData?.analytics?.total_chats_sent || 0) + (profileData?.analytics?.total_chats_received || 0)}
            </div>
            <p className="text-xs text-gray-600">
              {profileData?.analytics?.total_chats_sent || 0} sent • {profileData?.analytics?.total_chats_received || 0} received
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">89%</div>
            <p className="text-xs text-gray-600">+5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Events</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-xs text-gray-600">3 upcoming</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white border-0"
                  onClick={() => window.location.href = '/avatar'}
                >
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Setup Avatar</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white border-0"
                  onClick={() => window.location.href = '/products'}
                >
                  <div className="text-center">
                    <ShoppingBag className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Products</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 hover:from-green-600 hover:via-teal-600 hover:to-blue-600 text-white border-0"
                  onClick={() => window.location.href = '/calendar'}
                >
                  <div className="text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Calendar</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white border-0"
                  onClick={() => window.location.href = '/feed'}
                >
                  <div className="text-center">
                    <Home className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Feed</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 text-white border-0"
                  onClick={() => window.location.href = '/settings'}
                >
                  <div className="text-center">
                    <Settings className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Settings</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white border-0"
                  onClick={() => window.location.href = '/'}
                >
                  <div className="text-center">
                    <MessageSquare className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Messages</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white border-0"
                  onClick={() => window.location.href = '/analytics'}
                >
                  <div className="text-center">
                    <BarChart3 className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Analytics</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 text-white border-0"
                  onClick={() => setIsShareOpen(true)}
                >
                  <div className="text-center">
                    <Share2 className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-sm">Share</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Changeable Avatar Preview and Social Activity */}
        <div className="lg:col-span-1 space-y-6">
          {/* Changeable Avatar with Real-time Features */}
          <ChangeableAvatarPreview
            userId={profileData?.id}
            isLarge={true}
            showControls={true}
            enableVoice={true}
            isInteractive={true}
            onAvatarClick={() => window.location.href = '/avatar'}
          />
          
          {/* Real-time Social Activity Widget */}
          <RealtimeFollowWidget currentUserId={profileData?.id} />
        </div>
      </div>

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
