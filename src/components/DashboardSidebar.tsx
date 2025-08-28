
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  Calendar,
  Bell,
  Users,
  Settings,
  User,
  Home
} from 'lucide-react';

const DashboardSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Avatar', icon: User, path: '/avatar' },
    { name: 'Chat', icon: MessageSquare, path: '/chat' },
    { name: 'AI Training', icon: Brain, path: '/training' },
    { name: 'Calendar', icon: Calendar, path: '/calendar' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Followers', icon: Users, path: '/followers' },
    { name: 'Settings', icon: Settings, path: '/settings' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2">
          <Home className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Avatar Spark</h2>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive(item.path) 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>

        <Separator className="my-6" />

        {/* Quick Actions */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
            Quick Actions
          </h3>
          <Link to="/avatar">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <User className="w-4 h-4" />
              Create Avatar
            </Button>
          </Link>
          <Link to="/chat">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <MessageSquare className="w-4 h-4" />
              Start Chat
            </Button>
          </Link>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Avatar Spark v1.0
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
