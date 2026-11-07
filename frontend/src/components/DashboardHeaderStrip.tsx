import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Share2, User, ChevronDown, Menu, Plus, Search, SquarePen, Package, Video, BrainCircuit, Coins, Crown, Compass, ExternalLink,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ShareModal from './ShareModal';
import NotificationBell from './NotificationBell';
import CurrencySelector from './CurrencySelector';
import { useSidebar } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useProfileAvatar } from '@/hooks/useProfileAvatar';
import Logo from './Logo';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const SEARCH_INDEX = [
  { label: 'Dashboard', url: '/settings/dashboard', k: 'home overview' },
  { label: 'Products', url: '/settings/products', k: 'sell digital physical shop store' },
  { label: 'Promo codes', url: '/settings/promo', k: 'discount coupon' },
  { label: 'Virtual Collaboration', url: '/settings/virtual-collaboration', k: 'meeting zoom booking calendar' },
  { label: 'Feed', url: '/settings/feed', k: 'posts timeline' },
  { label: 'Avatar Studio', url: '/settings/avatar', k: 'avatar 3d customize face' },
  { label: 'AI Training', url: '/settings/ai-training', k: 'qa documents web voice train' },
  { label: 'Social Links', url: '/settings/social-links', k: 'instagram youtube linkedin links bio' },
  { label: 'Analytics', url: '/settings/analytics', k: 'views growth stats' },
  { label: 'Earnings', url: '/settings/earnings', k: 'revenue money sales payout' },
  { label: 'Followers', url: '/settings/followers', k: 'community fans' },
  { label: 'Settings', url: '/settings/account', k: 'profile privacy account password' },
  { label: 'Buy Tokens', url: '/settings/buy-tokens', k: 'tokens credits' },
  { label: 'Pricing & Plans', url: '/pricing', k: 'upgrade plan subscription creator pro business' },
];

const formatTokens = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : String(n));

const DashboardHeaderStrip: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();
  const { profile, user } = useProfileAvatar();
  const [showShare, setShowShare] = useState(false);
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(false);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return SEARCH_INDEX.filter((s) => s.label.toLowerCase().includes(t) || s.k.includes(t)).slice(0, 6);
  }, [q]);

  const profileUrl = profile?.username ? `${window.location.origin}/${profile.username}` : window.location.origin;
  const displayName = profile?.display_name || profile?.full_name || profile?.username || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast({ title: 'Error', description: 'Failed to logout', variant: 'destructive' });
    else navigate('/');
  };

  const create = (what: string) => {
    if (what === 'post') window.dispatchEvent(new Event('avatartalk:create-post'));
    else navigate(what);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#f6f5ff]/90 backdrop-blur border-b border-white/60" data-testid="dashboard-header">
        <div className="px-3 sm:px-5 lg:px-6 py-3 flex items-center gap-2 sm:gap-3">
          <button type="button" onClick={toggleSidebar} className="md:hidden p-2 rounded-xl bg-white shadow-sm text-slate-700" data-testid="header-menu-btn">
            <Menu className="w-5 h-5" />
          </button>
          <button type="button" className="md:hidden" onClick={() => navigate('/settings/dashboard')}><Logo size="sm" /></button>

          <div className="relative flex-1 max-w-xl hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
              onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) { navigate(results[0].url); setQ(''); } }}
              placeholder="Search for features, products, posts, users..." data-testid="header-search"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-100 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
            {focus && results.length > 0 && (
              <div className="absolute mt-2 w-full bg-white rounded-xl border border-slate-100 shadow-lg py-1 z-50">
                {results.map((r) => (
                  <button key={r.url} type="button" onMouseDown={() => { navigate(r.url); setQ(''); }} data-testid={`search-result-${r.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-violet-50 flex items-center gap-2"><Compass className="w-4 h-4 text-violet-500" />{r.label}</button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="inline-flex items-center gap-1.5 h-10 px-3 sm:px-5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-200" data-testid="header-create-btn">
                  <Plus className="w-4 h-4" /><span className="hidden sm:inline">Create</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => create('post')} data-testid="create-post-item"><SquarePen className="w-4 h-4 mr-2" />Create Post</DropdownMenuItem>
                <DropdownMenuItem onClick={() => create('/settings/products')}><Package className="w-4 h-4 mr-2" />Add Product</DropdownMenuItem>
                <DropdownMenuItem onClick={() => create('/settings/virtual-collaboration')}><Video className="w-4 h-4 mr-2" />Start Meeting</DropdownMenuItem>
                <DropdownMenuItem onClick={() => create('/settings/ai-training')}><BrainCircuit className="w-4 h-4 mr-2" />Train AI</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button type="button" onClick={() => navigate('/settings/buy-tokens')} data-testid="header-tokens"
              className="hidden sm:inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-white border border-amber-100 shadow-sm text-sm font-semibold text-slate-800">
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center"><Coins className="w-3.5 h-3.5 text-white" /></span>
              {formatTokens(profile?.token_balance || 0)} Tokens
            </button>

            <div className="hidden lg:block"><CurrencySelector compact /></div>
            <NotificationBell variant="light" compact />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center gap-2 pl-1 pr-1.5 sm:pr-2 h-11 rounded-xl hover:bg-white" data-testid="header-user-menu">
                  <Avatar className="h-9 w-9 border-2 border-white shadow">
                    <AvatarImage src={profile?.avatar || ''} alt={displayName} className="object-cover" />
                    <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-left leading-tight">
                    <span className="block text-sm font-semibold text-slate-900 max-w-[120px] truncate">{displayName}</span>
                    <span className="block text-xs text-slate-500 max-w-[120px] truncate">@{profile?.username || 'username'}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-500 hidden md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem onClick={() => window.open(profileUrl, '_blank')}><ExternalLink className="w-4 h-4 mr-2" />View Public Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowShare(true)} data-testid="header-share-item"><Share2 className="w-4 h-4 mr-2" />Share Profile Link</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings/account')}><User className="w-4 h-4 mr-2" />Account Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.dispatchEvent(new Event('avatartalk:open-onboarding'))} data-testid="header-setup-guide"><Compass className="w-4 h-4 mr-2" />Setup Guide</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings/buy-tokens')} className="sm:hidden"><Coins className="w-4 h-4 mr-2" />{formatTokens(profile?.token_balance || 0)} Tokens</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/pricing')}><Crown className="w-4 h-4 mr-2" />Plans & Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive" data-testid="header-logout"><LogOut className="w-4 h-4 mr-2" />Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} profileUrl={profileUrl} username={profile?.username || 'user'} displayName={profile?.display_name || undefined} />
    </>
  );
};

export default DashboardHeaderStrip;
