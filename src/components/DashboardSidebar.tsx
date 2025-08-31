
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
  Brain,
  User,
  ChevronLeft,
  ChevronRight
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
  { title: "Avatar", icon: User, url: "/avatar" },
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
  const { state, setOpen, toggleSidebar } = useSidebar();
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
      className="border-r border-border bg-card/50 backdrop-blur-sm shadow-sm"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all duration-300 flex-1 min-w-0"
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate text-base">AvatarTalk.bio</h2>
                <p className="text-xs text-muted-foreground truncate">Dashboard</p>
              </div>
            )}
          </div>
          
          {/* Minimize/Maximize Button - Hide on mobile */}
          {!isMobile && (
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-1.5 hover:bg-accent transition-colors flex-shrink-0"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 bg-card/30">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="mb-4">
              <Button
                onClick={onCreatePost}
                className={`w-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] bg-primary hover:bg-primary/90 text-primary-foreground border-0 ${
                  isCollapsed ? 'px-2 py-2' : 'px-4 py-2.5'
                }`}
                size={isCollapsed ? "icon" : "default"}
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="ml-2 text-sm font-medium">Create Post</span>}
              </Button>
            </div>

            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="bg-card/80 hover:bg-accent/80 text-foreground hover:text-accent-foreground w-full transition-all duration-200 rounded-lg border border-border/50 hover:border-accent/50 shadow-sm hover:shadow-md backdrop-blur-sm"
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <a 
                      href={item.url} 
                      className={`flex items-center w-full ${
                        isCollapsed ? 'justify-center p-3' : 'gap-3 p-3'
                      }`}
                      onClick={handleMenuItemClick}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                      {!isCollapsed && (
                        <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
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
