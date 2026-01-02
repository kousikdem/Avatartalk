import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Share2, User, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import CurrencySelector from './CurrencySelector';
import TokenDisplay from './TokenDisplay';
import PlanBadge from './PlanBadge';
import Logo from './Logo';
import ShareModal from './ShareModal';
import { useSidebar } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DashboardHeaderStrip: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  const [showShareModal, setShowShareModal] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    username: string | null;
    display_name: string | null;
    profile_pic_url: string | null;
    email: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username, display_name, profile_pic_url')
          .eq('id', user.id)
          .single();
        
        setUserProfile({
          ...data,
          email: user.email || null
        });
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    } else {
      navigate('/');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const profileUrl = userProfile?.username 
    ? `${window.location.origin}/${userProfile.username}`
    : window.location.origin;

  const displayName = userProfile?.display_name || userProfile?.username || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <div className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-4 py-2.5 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* Left section - Logo and Menu Toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-9 w-9 text-white hover:bg-white/20"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => navigate('/settings/dashboard')}
            >
              <Logo size="sm" className="shadow-md" />
              <span className="text-white font-semibold text-lg hidden sm:block">
                AvatarTalk.Co
              </span>
            </div>
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <CurrencySelector compact />
            </div>
            
            <TokenDisplay compact />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 h-8 px-3 text-white hover:bg-white/20"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-xs">Share</span>
            </Button>

            {/* Plan Badge */}
            <div className="hidden sm:block">
              <PlanBadge size="sm" showIcon />
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 h-9 px-2 text-white hover:bg-white/20"
                >
                  <Avatar className="h-7 w-7 border-2 border-white/50">
                    <AvatarImage src={userProfile?.profile_pic_url || ''} alt={displayName} />
                    <AvatarFallback className="bg-white/20 text-white text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3.5 w-3.5 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile?.email}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate('/settings/account')}>
                  <User className="w-4 h-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <div className="sm:hidden px-2 py-1.5">
                  <PlanBadge size="sm" showIcon />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profileUrl={profileUrl}
        username={userProfile?.username || 'user'}
      />
    </>
  );
};

export default DashboardHeaderStrip;
