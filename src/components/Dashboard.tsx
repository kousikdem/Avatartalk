
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useProfile } from '@/hooks/useProfile';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CalendarPage from './CalendarPage';
import ProfilePage from './ProfilePage';
import CreatePostModal from './CreatePostModal';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { profile, loading: profileLoading } = useProfile();
  const { profileData, loading: userProfileLoading } = useUserProfile();

  const { toast } = useToast();

  useEffect(() => {
    if (!profileLoading && profile) {
      toast({
        title: `Welcome, ${profile.display_name || profile.full_name || 'User'}!`,
        description: "You've successfully logged in.",
      })
    }
  }, [profile, profileLoading, toast]);

  const loading = profileLoading || userProfileLoading;

  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="lg:ml-64">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'profile' && 'My Profile'}
                {activeTab === 'calendar' && 'Calendar'}
                {activeTab === 'notifications' && 'Notifications'}
                {activeTab === 'followers' && 'Followers'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleCreatePost}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Open notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" alt="Avatar" />
                        <AvatarFallback>JF</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">Jane Doe liked your post</p>
                        <p className="text-sm text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.profile_pic_url} alt={profile?.full_name} />
                      <AvatarFallback>{profile?.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium leading-none">{profile?.full_name}</span>
                      <span className="text-xs leading-none text-muted-foreground">
                        {profile?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <main className="p-6">
          {activeTab === 'dashboard' && (
            <div>
              Dashboard Content
            </div>
          )}
          {activeTab === 'profile' && (
            <ProfilePage />
          )}
          {activeTab === 'calendar' && (
            <CalendarPage />
          )}
          {activeTab === 'notifications' && (
            <div>
              Notifications Content
            </div>
          )}
           {activeTab === 'followers' && (
            <div>
              Followers Content
            </div>
          )}
          {activeTab === 'settings' && (
            <div>
              Settings Content
            </div>
          )}
        </main>
      </div>

      <CreatePostModal 
        isOpen={showCreatePost} 
        onClose={() => setShowCreatePost(false)} 
      />
    </div>
  );
};

export default Dashboard;
