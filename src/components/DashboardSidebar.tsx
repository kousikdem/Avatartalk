
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Users, 
  MessageSquare, 
  Settings, 
  BarChart3,
  Bell,
  Calendar,
  Brain,
  User,
  ChevronLeft,
  ChevronRight,
  Package,
  Share2,
  Shield
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from './Logo';

interface DashboardSidebarProps {
  onCreatePost: () => void;
}

const navigationItems = [
  { title: "Dashboard", icon: Home, url: "/settings/dashboard" },
  { title: "Products", icon: Package, url: "/settings/products" },
  { title: "Virtual Collaboration", icon: Calendar, url: "/settings/virtual-collaboration" },
  { title: "Feed", icon: MessageSquare, url: "/settings/feed" },
  { title: "Avatar", icon: User, url: "/settings/avatar" },
  { title: "AI Training", icon: Brain, url: "/settings/ai-training" },
  { title: "Social Links", icon: Share2, url: "/settings/social-links" },
  { title: "Analytics", icon: BarChart3, url: "/settings/analytics" },
  { title: "Followers", icon: Users, url: "/settings/followers" },
  { title: "Notifications", icon: Bell, url: "/settings/notifications" },
  { title: "Settings", icon: Settings, url: "/settings/account" },
];

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onCreatePost }) => {
  const { state, setOpen, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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

  const handleLogoClick = () => {
    window.location.href = '/settings/dashboard';
  };

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  const allNavItems = isSuperAdmin 
    ? [...navigationItems, { title: "Super Admin", icon: Shield, url: "/settings/super-admin" }]
    : navigationItems;

  return (
    <Sidebar 
      className="border-r border-gray-200 bg-white shadow-sm"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all duration-300 flex-1 min-w-0"
            onClick={handleLogoClick}
          >
            <Logo size="md" className="flex-shrink-0 shadow-md" />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate text-base">AvatarTalk.Co</h2>
                <p className="text-xs text-gray-600 truncate">Dashboard</p>
              </div>
            )}
          </div>
          
          {!isMobile && (
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="h-10 w-10 p-2 hover:bg-gray-100 transition-colors flex-shrink-0 text-gray-700 bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-6 w-6" />
              ) : (
                <ChevronLeft className="h-6 w-6" />
              )}
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="mb-4">
              <Button
                onClick={onCreatePost}
                className={`w-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white border-0 ${
                  isCollapsed ? 'px-2 py-2' : 'px-4 py-2.5'
                }`}
                size={isCollapsed ? "icon" : "default"}
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="ml-2 text-sm font-medium">Create Post</span>}
              </Button>
            </div>

            <SidebarMenu className="space-y-2">
              {allNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 text-gray-700 hover:text-gray-900 w-full transition-all duration-200 rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md backdrop-blur-sm ${
                      item.title === 'Super Admin' ? 'border-primary/30 bg-primary/5' : ''
                    }`}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <a 
                      href={item.url} 
                      className={`flex items-center w-full ${
                        isCollapsed ? 'justify-center p-3' : 'gap-3 p-3'
                      }`}
                      onClick={handleMenuItemClick}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${item.title === 'Super Admin' ? 'text-primary' : 'text-gray-600'}`} />
                      {!isCollapsed && (
                        <span className={`truncate text-sm font-medium ${item.title === 'Super Admin' ? 'text-primary' : 'text-gray-700'}`}>{item.title}</span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
