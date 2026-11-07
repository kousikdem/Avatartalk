import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, SquarePen, Package, Video, MessageSquareText, Bot, BrainCircuit, Share2,
  BarChart3, CircleDollarSign, Users, Settings, Shield, ChevronDown, Menu, Crown, ArrowRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePlanFeatures } from '@/hooks/usePlanFeatures';
import Logo from './Logo';

interface DashboardSidebarProps {
  onCreatePost: () => void;
}

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  url?: string;
  action?: 'create-post';
  children?: { title: string; url: string }[];
}

const NAV: NavItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, url: '/settings/dashboard' },
  { title: 'Create Post', icon: SquarePen, action: 'create-post' },
  { title: 'Products', icon: Package, url: '/settings/products', children: [
    { title: 'All Products', url: '/settings/products' },
    { title: 'Promo Codes', url: '/settings/promo' },
  ] },
  { title: 'Virtual Collaboration', icon: Video, url: '/settings/virtual-collaboration', children: [
    { title: 'Meetings & Bookings', url: '/settings/virtual-collaboration' },
    { title: 'Subscriptions', url: '/settings/subscriptions' },
  ] },
  { title: 'Feed', icon: MessageSquareText, url: '/settings/feed' },
  { title: 'Avatar Studio', icon: Bot, url: '/settings/avatar' },
  { title: 'AI Training', icon: BrainCircuit, url: '/settings/ai-training' },
  { title: 'Social Links', icon: Share2, url: '/settings/social-links' },
  { title: 'Analytics', icon: BarChart3, url: '/settings/analytics' },
  { title: 'Earnings', icon: CircleDollarSign, url: '/settings/earnings' },
  { title: 'Followers', icon: Users, url: '/settings/followers' },
  { title: 'Settings', icon: Settings, url: '/settings/account' },
];

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onCreatePost }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state, setOpen, setOpenMobile, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  const isMobile = useIsMobile();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { effectivePlanKey } = usePlanFeatures();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
      setIsSuperAdmin(data?.role === 'super_admin');
    })();
  }, []);

  const close = () => { if (isMobile) { setOpenMobile?.(false); setOpen(false); } };
  const items: NavItem[] = isSuperAdmin ? [...NAV, { title: 'Super Admin', icon: Shield, url: '/settings/super-admin' }] : NAV;
  const nextPlan = effectivePlanKey === 'free' ? 'Creator' : effectivePlanKey === 'creator' ? 'Pro' : effectivePlanKey === 'pro' ? 'Business' : null;
  const isActive = (it: NavItem) => !!it.url && (pathname === it.url || it.children?.some((c) => c.url === pathname));

  return (
    <Sidebar className="border-r border-slate-100 bg-white" collapsible="icon">
      <SidebarHeader className="px-4 pt-5 pb-3 bg-white">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <button type="button" onClick={() => navigate('/settings/dashboard')} className="flex items-center gap-2" data-testid="sidebar-logo">
            <Logo size="sm" className="shadow-md" />
            {!collapsed && <span className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">AvatarTalk.co</span>}
          </button>
          {!collapsed && (
            <button type="button" onClick={toggleSidebar} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100" data-testid="sidebar-collapse">
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2 bg-white">
        <nav className="space-y-1" data-testid="sidebar-nav">
          {items.map((it) => {
            const active = isActive(it);
            const open = expanded === it.title || (active && !!it.children && expanded !== `!${it.title}`);
            const cls = `group flex items-center w-full rounded-xl transition-all ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'} ${active
              ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-200'
              : 'text-slate-700 hover:bg-violet-50 hover:text-violet-700'}`;
            const inner = (
              <>
                <it.icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-600 group-hover:text-violet-600'}`} />
                {!collapsed && <span className="flex-1 text-left text-[15px] font-medium truncate">{it.title}</span>}
                {!collapsed && it.children && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(open ? `!${it.title}` : it.title); }}
                  />
                )}
              </>
            );
            const testId = `nav-${it.title.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <div key={it.title}>
                {it.action === 'create-post' ? (
                  <button type="button" className={cls} onClick={() => { onCreatePost(); close(); }} data-testid={testId} title={it.title}>{inner}</button>
                ) : (
                  <Link to={it.url!} className={cls} onClick={close} data-testid={testId} title={it.title}>{inner}</Link>
                )}
                {!collapsed && it.children && open && (
                  <div className="ml-11 mt-1 mb-1 space-y-0.5 border-l border-violet-100 pl-3">
                    {it.children.map((c) => (
                      <Link key={c.url + c.title} to={c.url} onClick={close} data-testid={`subnav-${c.title.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                        className={`block text-sm py-1.5 ${pathname === c.url ? 'text-violet-700 font-semibold' : 'text-slate-500 hover:text-violet-700'}`}>{c.title}</Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="p-3 bg-white">
        {collapsed ? (
          <button type="button" onClick={() => navigate('/pricing')} className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center" data-testid="sidebar-upgrade-icon">
            <Crown className="w-4 h-4" />
          </button>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-4" data-testid="sidebar-upgrade-card">
            <p className="flex items-center gap-2 font-bold text-violet-700"><Crown className="w-4 h-4 text-amber-500" /> {nextPlan ? `Upgrade to ${nextPlan}` : 'You are on Business'}</p>
            <p className="text-xs text-slate-500 mt-1">{nextPlan ? 'Unlock all features & earn more' : 'All features unlocked'}</p>
            <button type="button" onClick={() => { navigate('/pricing'); close(); }} data-testid="sidebar-upgrade-btn"
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md">
              {nextPlan ? 'Upgrade Now' : 'View Plans'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
