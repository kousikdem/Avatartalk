
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Share2, Users, MessageSquare, BarChart3, LogOut, 
  Home, ShoppingBag, PlusCircle, Menu, Brain, Video,
  Coins, Calendar, UserCircle, Link, Bell, Settings
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import ShareModal from './ShareModal';
import ChangeableAvatarPreview from './ChangeableAvatarPreview';
import RealtimeFollowWidget from './RealtimeFollowWidget';
import DashboardPlanUpgrade from './DashboardPlanUpgrade';
import { useFollows } from '@/hooks/useFollows';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TokenDisplay from './TokenDisplay';
import CurrencySelector from './CurrencySelector';
import EnhancedCreatePostModal from './EnhancedCreatePostModal';
import DashboardSidebar from './DashboardSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [upcomingCollabs, setUpcomingCollabs] = useState(0);
  const [upcomingMeetings, setUpcomingMeetings] = useState(0);
  const { profileData, loading } = useUserProfile();
  const { following, refetch } = useFollows(profileData?.id);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Fetch upcoming collaborations and meetings
  useEffect(() => {
    const fetchUpcomingCounts = async () => {
      if (!profileData?.id) return;
      
      const now = new Date().toISOString();
      
      // Fetch upcoming events (collabs)
      const { data: collabs } = await supabase
        .from('collaborations')
        .select('id')
        .eq('user_id', profileData.id)
        .eq('status', 'active');
      
      // Fetch upcoming calendar events (meetings)
      const { data: meetings } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('user_id', profileData.id)
        .gte('start_time', now);
      
      setUpcomingCollabs(collabs?.length || 0);
      setUpcomingMeetings(meetings?.length || 0);
    };
    
    fetchUpcomingCounts();
  }, [profileData?.id]);

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

  const mobileNavItems = [
    { title: "Dashboard", icon: Home, url: "/settings/dashboard" },
    { title: "Products", icon: ShoppingBag, url: "/settings/products" },
    { title: "Virtual Collaboration", icon: Video, url: "/settings/virtual-collaboration" },
    { title: "Feed", icon: MessageSquare, url: "/settings/feed" },
    { title: "Avatar", icon: UserCircle, url: "/settings/avatar" },
    { title: "AI Training", icon: Brain, url: "/settings/ai-training" },
    { title: "Social Links", icon: Link, url: "/settings/social-links" },
    { title: "Analytics", icon: BarChart3, url: "/settings/analytics" },
    { title: "Followers", icon: Users, url: "/settings/followers" },
    { title: "Notifications", icon: Bell, url: "/settings/notifications" },
    { title: "Settings", icon: Settings, url: "/settings/account" },
    { title: "Buy Tokens", icon: Coins, url: "/settings/buy-tokens" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto bg-white p-3 sm:p-6">
      {/* Header Section with Mobile Menu, Token Display, Share and Logout Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AvatarTalk.Co
                  </h2>
                  <p className="text-xs text-gray-500">Dashboard Menu</p>
                </div>
                <div className="p-3 space-y-1">
                  <Button
                    onClick={() => {
                      setIsCreatePostOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mb-3 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                  {mobileNavItems.map((item) => (
                    <a
                      key={item.title}
                      href={item.url}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{item.title}</span>
                    </a>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          )}
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">Welcome Back!</h1>
            <p className="text-gray-600 text-xs sm:text-base truncate">Manage your AI avatar</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto justify-end">
          <CurrencySelector compact />
          <TokenDisplay compact />
          
          <Button 
            onClick={() => setIsShareOpen(true)}
            size={isMobile ? "icon" : "default"}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white"
          >
            <Share2 className="w-4 h-4" />
            {!isMobile && <span className="ml-2">Share Profile</span>}
          </Button>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            size={isMobile ? "icon" : "default"}
            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
          >
            <LogOut className="w-4 h-4" />
            {!isMobile && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Followers</CardTitle>
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{profileData?.followers_count || 0}</div>
            <p className="text-xs text-gray-600 hidden sm:block">+20% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Messages</CardTitle>
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {(profileData?.analytics?.total_chats_sent || 0) + (profileData?.analytics?.total_chats_received || 0)}
            </div>
            <p className="text-xs text-gray-600 hidden sm:block">
              {profileData?.analytics?.total_chats_sent || 0} sent • {profileData?.analytics?.total_chats_received || 0} received
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Collabs</CardTitle>
            <Video className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{upcomingCollabs}</div>
            <p className="text-xs text-gray-600 hidden sm:block">Upcoming collaborations</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">Meetings</CardTitle>
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{upcomingMeetings}</div>
            <p className="text-xs text-gray-600 hidden sm:block">Scheduled meetings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200">
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-gray-900 text-base sm:text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
                {/* Create Post */}
                <Button 
                  variant="outline" 
                  className="h-14 sm:h-20 bg-white hover:bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2"
                  onClick={() => setIsCreatePostOpen(true)}
                >
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
                    <PlusCircle className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-700 font-medium truncate w-full text-center">Post</span>
                </Button>
                
                {/* Avatar */}
                <Button 
                  variant="outline" 
                  className="h-14 sm:h-20 bg-white hover:bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2"
                  onClick={() => window.location.href = '/settings/avatar'}
                >
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500">
                    <UserCircle className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-700 font-medium truncate w-full text-center">Avatar</span>
                </Button>
                
                {/* Products */}
                <Button 
                  variant="outline" 
                  className="h-14 sm:h-20 bg-white hover:bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2"
                  onClick={() => window.location.href = '/settings/products'}
                >
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500">
                    <ShoppingBag className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-700 font-medium truncate w-full text-center">Products</span>
                </Button>
                
                {/* Virtual Collab */}
                <Button 
                  variant="outline" 
                  className="h-14 sm:h-20 bg-white hover:bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2"
                  onClick={() => window.location.href = '/settings/virtual-collaboration'}
                >
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500">
                    <Video className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-700 font-medium truncate w-full text-center">Collab</span>
                </Button>
                
                {/* Feed */}
                <Button 
                  variant="outline" 
                  className="h-14 sm:h-20 bg-white hover:bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2"
                  onClick={() => window.location.href = '/settings/feed'}
                >
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-orange-400 to-red-500">
                    <Home className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-700 font-medium truncate w-full text-center">Feed</span>
                </Button>
                
                {/* AI Training */}
                <Button 
                  variant="outline" 
                  className="h-14 sm:h-20 bg-white hover:bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2"
                  onClick={() => window.location.href = '/settings/ai-training'}
                >
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500">
                    <Brain className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-700 font-medium truncate w-full text-center">AI</span>
                </Button>
                
                {/* Buy Tokens */}
                <Button 
                  variant="outline" 
                  className="h-14 sm:h-20 bg-white hover:bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2"
                  onClick={() => window.location.href = '/settings/buy-tokens'}
                >
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                    <Coins className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-700 font-medium truncate w-full text-center">Tokens</span>
                </Button>
                
                {/* Analytics */}
                <Button 
                  variant="outline" 
                  className="h-14 sm:h-20 bg-white hover:bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2"
                  onClick={() => window.location.href = '/settings/analytics'}
                >
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500">
                    <BarChart3 className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-700 font-medium truncate w-full text-center">Analytics</span>
                </Button>
                
                {/* Settings */}
                <Button 
                  variant="outline" 
                  className="h-14 sm:h-20 bg-white hover:bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2"
                  onClick={() => window.location.href = '/settings/account'}
                >
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-slate-400 to-gray-600">
                    <Settings className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-700 font-medium truncate w-full text-center">Settings</span>
                </Button>
                
                {/* Share */}
                <Button 
                  variant="outline" 
                  className="h-14 sm:h-20 bg-white hover:bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2"
                  onClick={() => setIsShareOpen(true)}
                >
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500">
                    <Share2 className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-700 font-medium truncate w-full text-center">Share</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Changeable Avatar Preview and Social Activity */}
        <div className="lg:col-span-1 space-y-6">
          {/* Plan Upgrade Card */}
          <DashboardPlanUpgrade />
          
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

      {/* Create Post Modal */}
      <EnhancedCreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={() => {
          setIsCreatePostOpen(false);
        }}
      />
    </div>
  );
};

export default Dashboard;
