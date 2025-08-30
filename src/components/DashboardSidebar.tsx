
import {
  BarChart3,
  Bookmark,
  Brain,
  Calendar,
  Globe,
  Home,
  LayoutDashboard,
  Settings,
  User,
  Users,
  Bell,
  ChevronLeft,
  Menu,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"

interface DashboardSidebarProps {
  onCreatePost: () => void
}

export function DashboardSidebar({ onCreatePost }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const isCollapsed = state === "collapsed";

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Avatar",
      icon: User,
      href: "/avatar",
      subItems: [
        {
          title: "Manage Avatars",
          href: "/avatar",
        },
        {
          title: "Create New",
          href: "/avatar/create",
        }
      ]
    },
    {
      title: "Calendar",
      icon: Calendar,
      href: "/calendar",
    },
    {
      title: "Notifications",
      icon: Bell,
      href: "/notifications",
      badge: 3,
    },
    {
      title: "Followers",
      icon: Users,
      href: "/followers",
    },
    {
      title: "Browse Profiles",
      icon: Globe,
      href: "/profiles",
    },
    {
      title: "Feed",
      icon: Home,
      href: "/feed",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/analytics",
    },
    {
      title: "Bookmarks",
      icon: Bookmark,
      href: "/bookmarks",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
    {
      title: "AI Training",
      icon: Brain,
      href: "/ai-training",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/avatar") {
      return location.pathname === href || location.pathname.startsWith("/avatar");
    }
    return location.pathname === href;
  };

  return (
    <Sidebar 
      variant="inset" 
      className="border-r border-gray-200 transition-all duration-300 ease-in-out"
      collapsible="icon"
    >
      <SidebarHeader className={`pb-4 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <div className="flex items-center justify-between w-full">
          <Button 
            variant="ghost" 
            className={`justify-start transition-all duration-300 ${isCollapsed ? 'w-10 h-10 p-0' : 'w-full px-4'}`}
          >
            <Avatar className={`${isCollapsed ? 'h-6 w-6' : 'mr-2 h-8 w-8'}`}>
              <AvatarImage src="/avatars/01.png" alt="Avatar" />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="space-y-0.5">
                <p className="text-sm font-medium">FosiK</p>
                <p className="text-xs text-gray-500">admin</p>
              </div>
            )}
          </Button>
          
          {/* Minimize/Expand Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={`h-8 w-8 transition-all duration-300 ${isCollapsed ? 'rotate-180' : ''} ${isMobile ? 'md:flex' : 'flex'}`}
            title={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.href)}
                    className="relative"
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <button
                      onClick={() => navigate(item.href)}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center">
                        <item.icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
                        {!isCollapsed && <span>{item.title}</span>}
                      </div>
                      {item.badge && !isCollapsed && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  </SidebarMenuButton>
                  
                  {/* Avatar Sub-menu - Only show when expanded */}
                  {item.subItems && isActive(item.href) && !isCollapsed && (
                    <SidebarMenu className="ml-6 mt-2">
                      {item.subItems.map((subItem) => (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton 
                            asChild
                            size="sm"
                            isActive={location.pathname === subItem.href}
                          >
                            <button
                              onClick={() => navigate(subItem.href)}
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              {subItem.title}
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Button 
              variant="secondary" 
              className={`w-full transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`} 
              onClick={onCreatePost}
              title={isCollapsed ? "Create Post" : undefined}
            >
              {isCollapsed ? <span className="text-lg">+</span> : "Create Post"}
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
        <Button 
          variant="link" 
          className={`justify-start transition-all duration-300 ${isCollapsed ? 'w-10 h-10 p-0' : 'w-full px-4'}`}
          title={isCollapsed ? "Log out" : undefined}
        >
          {isCollapsed ? (
            <span className="text-sm">⏻</span>
          ) : (
            "Log out"
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default DashboardSidebar;
