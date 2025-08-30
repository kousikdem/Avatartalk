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
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardSidebarProps {
  onCreatePost: () => void
}

export function DashboardSidebar({ onCreatePost }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

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
    <Sidebar variant="inset" className="border-r border-gray-200">
      <SidebarHeader className="pb-4">
        <Button variant="ghost" className="w-full justify-start px-4">
          <Avatar className="mr-2 h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt="Avatar" />
            <AvatarFallback>OM</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">FosiK</p>
            <p className="text-xs text-gray-500">admin</p>
          </div>
        </Button>
      </SidebarHeader>
      
      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.href)}
                    className="relative"
                  >
                    <button
                      onClick={() => navigate(item.href)}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  </SidebarMenuButton>
                  
                  {/* Avatar Sub-menu */}
                  {item.subItems && isActive(item.href) && (
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
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <Button variant="secondary" className="w-full" onClick={onCreatePost}>
              Create Post
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button variant="link" className="w-full justify-start px-4">
          Log out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default DashboardSidebar;
