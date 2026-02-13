import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  Users, 
  MessageSquare, 
  Settings, 
  BarChart3,
  Calendar,
  Brain,
  User,
  Package,
  Share2,
  Shield,
  ArrowUp,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePlanFeatures, PlanFeatureKey } from '@/hooks/usePlanFeatures';
import Logo from './Logo';

interface DashboardSidebarProps {
  onCreatePost: () => void;
}

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  gradient: string;
  requiredPlan?: 'free' | 'creator' | 'pro' | 'business';
  featureKey?: PlanFeatureKey;
}

const navigationItems: NavItem[] = [
  { title: "Dashboard", icon: Home, url: "/settings/dashboard", gradient: "from-blue-500 to-cyan-500", requiredPlan: 'free' },
  { title: "Products", icon: Package, url: "/settings/products", gradient: "from-emerald-500 to-teal-500", requiredPlan: 'creator', featureKey: 'payments_enabled' },
  { title: "Virtual Collaboration", icon: Calendar, url: "/settings/virtual-collaboration", gradient: "from-violet-500 to-purple-500", requiredPlan: 'pro', featureKey: 'virtual_meetings_enabled' },
  { title: "Feed", icon: MessageSquare, url: "/settings/feed", gradient: "from-pink-500 to-rose-500", requiredPlan: 'free' },
  { title: "Avatar", icon: User, url: "/settings/avatar", gradient: "from-amber-500 to-orange-500", requiredPlan: 'free' },
  { title: "AI Training", icon: Brain, url: "/settings/ai-training", gradient: "from-fuchsia-500 to-pink-500", requiredPlan: 'free' },
  { title: "Social Links", icon: Share2, url: "/settings/social-links", gradient: "from-sky-500 to-blue-500", requiredPlan: 'free' },
  { title: "Analytics", icon: BarChart3, url: "/settings/analytics", gradient: "from-indigo-500 to-violet-500", requiredPlan: 'pro', featureKey: 'advanced_analytics' },
  { title: "Followers", icon: Users, url: "/settings/followers", gradient: "from-green-500 to-emerald-500", requiredPlan: 'free' },
  { title: "Settings", icon: Settings, url: "/settings/account", gradient: "from-slate-500 to-gray-600", requiredPlan: 'free' },
];

const planHierarchy: Record<string, number> = {
  free: 0,
  creator: 1,
  pro: 2,
  business: 3,
};

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onCreatePost }) => {
  const navigate = useNavigate();
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { effectivePlanKey, loading: planLoading } = usePlanFeatures();

  const userPlanLevel = planHierarchy[effectivePlanKey] || 0;

  useEffect(() => {
    const checkSuperAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setIsSuperAdmin(data?.role === 'super_admin');
    };
    checkSuperAdmin();
  }, []);


  const handleMenuItemClick = (e: React.MouseEvent, item: NavItem) => {
    // Navigate to page directly - features are locked on the page itself, not the sidebar
    if (isMobile) {
      setOpen(false);
    }
  };

  // Sidebar menu items are never locked - pages handle their own feature locking
  const isFeatureLocked = (item: NavItem): boolean => {
    return false;
  };

  const allNavItems: NavItem[] = isSuperAdmin 
    ? [...navigationItems, { title: "Super Admin", icon: Shield, url: "/settings/super-admin", gradient: "from-yellow-500 to-amber-500", requiredPlan: 'free' }]
    : navigationItems;

  const nextPlan = effectivePlanKey === 'free' ? 'Creator' 
    : effectivePlanKey === 'creator' ? 'Pro'
    : effectivePlanKey === 'pro' ? 'Business'
    : null;

  return (
    <Sidebar 
      className="border-r border-gray-200 bg-white shadow-sm"
      collapsible="icon"
    >
      <SidebarHeader className="p-3 border-b border-gray-200 bg-white">
        {/* Minimal header - main branding is in the header strip */}
        <div className="flex items-center justify-center">
          {isCollapsed ? (
            <Logo size="sm" className="shadow-md" />
          ) : (
            <p className="text-xs text-gray-500 font-medium">Navigation</p>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="mb-4">
              <Button
                onClick={onCreatePost}
                className={`w-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white border-0 ${
                  isCollapsed ? 'px-3 py-4' : 'px-4 py-3'
                }`}
                size={isCollapsed ? "icon" : "default"}
              >
                <Plus className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={2.5} />
                {!isCollapsed && <span className="ml-2 text-sm font-semibold">Create Post</span>}
              </Button>
            </div>

            <SidebarMenu className="space-y-1.5">
              {allNavItems.map((item) => {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 text-gray-700 hover:text-gray-900 w-full transition-all duration-200 rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md backdrop-blur-sm ${
                        item.title === 'Super Admin' ? 'border-primary/30 bg-primary/5' : ''
                      }`}
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <Link 
                        to={item.url} 
                        className={`flex items-center w-full ${
                          isCollapsed ? 'justify-center p-3' : 'gap-3 p-3'
                        }`}
                        onClick={(e) => handleMenuItemClick(e, item)}
                      >
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.gradient}`}>
                          <item.icon className="w-4 h-4 flex-shrink-0 text-white" />
                        </div>
                        {!isCollapsed && (
                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <span className="truncate text-sm font-medium text-gray-700">
                              {item.title}
                            </span>
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Pricing Plan Button at Bottom */}
      <SidebarFooter className="p-3 border-t border-gray-200 bg-white">
        <Button
          onClick={() => navigate('/pricing')}
          className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all ${
            isCollapsed ? 'px-2 py-2' : 'px-4 py-2.5'
          }`}
          size={isCollapsed ? "icon" : "default"}
        >
          {isCollapsed ? (
            <Sparkles className="w-4 h-4" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                {nextPlan ? `Upgrade to ${nextPlan}` : 'View Plans'}
              </span>
              {nextPlan && <ArrowUp className="w-3.5 h-3.5 ml-1" />}
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
