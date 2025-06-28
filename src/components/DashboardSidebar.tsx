
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
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';

interface DashboardSidebarProps {
  onCreatePost: () => void;
}

const navigationItems = [
  { title: "Dashboard", icon: Home, url: "/dashboard" },
  { title: "Feed", icon: MessageSquare, url: "/feed" },
  { title: "Analytics", icon: BarChart3, url: "/analytics" },
  { title: "Followers", icon: Users, url: "/followers" },
  { title: "Notifications", icon: Bell, url: "/notifications" },
  { title: "Bookmarks", icon: Bookmark, url: "/bookmarks" },
  { title: "Calendar", icon: Calendar, url: "/calendar" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onCreatePost }) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogoClick = () => {
    // Check if user is logged in (you might want to implement proper auth check)
    const isLoggedIn = localStorage.getItem('supabase.auth.token') || false;
    
    if (isLoggedIn) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/';
    }
  };

  return (
    <Sidebar 
      className="border-r border-gray-200 bg-white"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-gray-100">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">AvatarTalk.bio</h2>
              <p className="text-xs text-gray-500 truncate">Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="mb-4">
              <Button
                onClick={onCreatePost}
                className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white ${
                  isCollapsed ? 'px-2' : 'px-4'
                }`}
                size={isCollapsed ? "icon" : "default"}
              >
                <Plus className="w-4 h-4" />
                {!isCollapsed && <span className="ml-2">Create Post</span>}
              </Button>
            </div>

            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-gray-100 text-gray-700 hover:text-gray-900 w-full"
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <a href={item.url} className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
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
