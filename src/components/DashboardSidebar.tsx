
import React from 'react';
import { 
  Home, 
  Plus, 
  Users, 
  MessageSquare, 
  Settings, 
  BarChart3,
  Bell,
  Bookmark,
  Calendar
} from 'lucide-react';
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

interface DashboardSidebarProps {
  onCreatePost: () => void;
}

const navigationItems = [
  { title: "Dashboard", icon: Home, url: "/dashboard" },
  { title: "Feed", icon: MessageSquare, url: "/feed" },
  { title: "Analytics", icon: BarChart3, url: "/analytics" },
  { title: "Followers", icon: Users, url: "/followers" },
  { title: "Profiles", icon: Users, url: "/profiles" },
  { title: "Notifications", icon: Bell, url: "/notifications" },
  { title: "Bookmarks", icon: Bookmark, url: "/bookmarks" },
  { title: "Calendar", icon: Calendar, url: "/calendar" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onCreatePost }) => {
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();

  const handleLogoClick = () => {
    // For logged-in users, navigate to dashboard
    window.location.href = '/dashboard';
  };

  const handleMenuItemClick = () => {
    // Close sidebar on mobile after clicking a menu item
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <Sidebar 
      className="border-r border-slate-200/40 bg-gradient-to-b from-white via-blue-50/40 to-purple-50/30 backdrop-blur-lg shadow-sm"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-slate-200/30 bg-gradient-to-r from-white/95 via-blue-50/60 to-purple-50/40">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all duration-300"
          onClick={handleLogoClick}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400/80 via-purple-400/80 to-indigo-400/80 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent truncate text-sm md:text-base">AvatarTalk.bio</h2>
              <p className="text-xs text-slate-500 truncate">Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 bg-gradient-to-b from-transparent via-blue-50/20 to-purple-50/20">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="mb-4">
              <Button
                onClick={onCreatePost}
                className={`w-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-blue-400/80 to-purple-400/80 hover:from-blue-500/90 hover:to-purple-500/90 text-white ${
                  isCollapsed ? 'px-2 py-2' : 'px-4 py-2'
                }`}
                size={isCollapsed ? "icon" : "default"}
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="ml-2 text-sm md:text-base">Create Post</span>}
              </Button>
            </div>

            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="bg-gradient-to-r from-white/80 via-blue-50/60 to-purple-50/40 hover:from-blue-100/80 hover:via-purple-50/70 hover:to-indigo-50/60 text-slate-700 hover:text-slate-900 w-full transition-all duration-300 rounded-lg border border-slate-200/40 hover:border-blue-200/60 shadow-sm hover:shadow-md backdrop-blur-sm"
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <a 
                      href={item.url} 
                      className={`flex items-center w-full ${
                        isCollapsed ? 'justify-center p-3' : 'gap-3 p-3'
                      }`}
                      onClick={handleMenuItemClick}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0 text-slate-600" />
                      {!isCollapsed && (
                        <span className="truncate text-sm md:text-base font-medium text-slate-700">{item.title}</span>
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
