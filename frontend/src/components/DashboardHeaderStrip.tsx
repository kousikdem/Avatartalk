import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Share2, User, ChevronDown, Menu, Copy, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import CurrencySelector from './CurrencySelector';
import TokenDisplay from './TokenDisplay';
import PlanBadge from './PlanBadge';
import Logo from './Logo';
import ShareModal from './ShareModal';
import NotificationBell from './NotificationBell';
import { useSidebar } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth';
import OnboardingFlow from './onboarding/OnboardingFlow';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import OnboardingProgressButton from './onboarding/OnboardingProgressButton';

const DashboardHeaderStrip: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    username: string | null;
    display_name: string | null;
    profile_pic_url: string | null;
    email: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('username, display_name, profile_pic_url').eq('id', user.id).single();
      if (data) {
        setUserProfile({ ...data, email: user.email || null });
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    } else {
      navigate('/');
    }
  };

  const profileUrl = userProfile?.username
    ? `${window.location.origin}/${userProfile.username}`
    : window.location.origin;

  const displayName = userProfile?.display_name || userProfile?.username || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  // Copy profile URL via the Clipboard API with an execCommand
  // fallback for older mobile WebViews where `navigator.clipboard`
  // isn't available.
  const handleCopyProfileUrl = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = profileUrl;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast({
        title: 'Link copied',
        description: profileUrl,
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Long-press the link to copy manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-3 py-2 flex items-center justify-between gap-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 text-gray-700 hover:bg-gray-100">
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate('/settings/dashboard')}>
              <Logo size="sm" className="shadow-md" />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent font-semibold text-base hidden sm:block">
                AvatarTalk.Co
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <OnboardingProgressButton onOpenOnboarding={() => setShowOnboarding(true)} />
            <div className="hidden sm:block"><CurrencySelector compact /></div>
            <TokenDisplay compact />
            <NotificationBell variant="light" compact />
            <Button variant="ghost" size="sm" onClick={() => setShowShareModal(true)} className="gap-1 h-7 px-2 text-gray-700 hover:bg-gray-100">
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-xs">Share</span>
            </Button>
            <div className="hidden sm:block cursor-pointer" onClick={() => navigate('/pricing')}>
              <PlanBadge size="sm" showIcon />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1.5 h-8 px-1.5 text-gray-700 hover:bg-gray-100">
                  <Avatar className="h-6 w-6 border border-gray-300">
                    <AvatarImage src={userProfile?.profile_pic_url || ''} alt={displayName} />
                    <AvatarFallback className="bg-gray-100 text-gray-700 text-xs font-medium">{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3 w-3 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile?.email}</p>
                </div>
                <DropdownMenuItem onClick={() => navigate('/settings/account')}>
                  <User className="w-4 h-4 mr-2" /> Account Settings
                </DropdownMenuItem>
                <div className="sm:hidden px-2 py-1.5" onClick={() => navigate('/pricing')}>
                  <PlanBadge size="sm" showIcon />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ── Share Smart Link-In-Bio strip ──
            Sits flush under the main header on every dashboard page.
            Left: label + the live profile URL (clickable, opens in a
            new tab). Right: Copy + Share actions. Both buttons work
            on mobile (Web Share API where available, falls back to
            the ShareModal otherwise). */}
        <div
          className="border-t border-gray-100 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 px-3 py-1.5"
          data-testid="share-bio-strip"
        >
          <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <LinkIcon className="h-3.5 w-3.5 text-purple-600 shrink-0" />
              <span className="text-xs font-semibold text-gray-800 shrink-0">
                Share Smart Link-In-Bio
              </span>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-700 hover:text-purple-900 hover:underline truncate hidden sm:inline-block"
                data-testid="share-bio-url"
                title={profileUrl}
              >
                {profileUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyProfileUrl}
                className="h-7 px-2 gap-1 text-xs bg-white hover:bg-purple-50 border-purple-200 text-purple-700"
                data-testid="share-bio-copy-button"
              >
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowShareModal(true)}
                className="h-7 px-2 gap-1 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                data-testid="share-bio-share-button"
              >
                <Share2 className="h-3 w-3" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} profileUrl={profileUrl} username={userProfile?.username || 'user'} displayName={userProfile?.display_name || undefined} />

      {showOnboarding && (
        <OnboardingFlow isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} isModal />
      )}
    </>
  );
};

export default DashboardHeaderStrip;
