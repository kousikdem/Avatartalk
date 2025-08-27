
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
  Calendar,
  Brain
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
  { title: "AI Training", icon: Brain, url: "/ai-training" },
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
    window.location.href = '/dashboard';
  };

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <Sidebar 
      className="border-r border-slate-200/40 bg-gradient-to-b from-white/95 via-blue-50/30 to-purple-50/20 backdrop-blur-lg shadow-sm"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-slate-200/30 bg-gradient-to-r from-white/90 to-blue-50/50">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all duration-300"
          onClick={handleLogoClick}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate text-sm md:text-base">AvatarTalk.bio</h2>
              <p className="text-xs text-slate-500 truncate">Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 bg-gradient-to-b from-white/80 via-blue-50/20 to-purple-50/10">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="mb-4">
              <Button
                onClick={onCreatePost}
                className={`w-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white ${
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
                    className="bg-gradient-to-r from-white/90 via-blue-50/40 to-purple-50/30 hover:from-blue-100/60 hover:via-purple-50/50 hover:to-pink-50/40 text-slate-700 hover:text-slate-900 w-full transition-all duration-300 rounded-lg border border-slate-200/40 hover:border-slate-300/60 shadow-sm hover:shadow-md backdrop-blur-sm"
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
