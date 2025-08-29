
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  Bell, 
  Users, 
  Settings, 
  Brain,
  User,
  Palette
} from 'lucide-react';

const DashboardSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/?view=dashboard' },
    { icon: User, label: 'Create Avatar', path: '/avatar', isNew: true },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: Brain, label: 'AI Training', path: '/training' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Users, label: 'Followers', path: '/followers' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/?view=dashboard') {
      return currentPath === '/' && new URLSearchParams(window.location.search).get('view') === 'dashboard';
    }
    return currentPath === path;
  };

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 border-r border-gray-200 shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AvatarTalk
            </h1>
            <p className="text-xs text-gray-600">Bio Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    active
                      ? 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 text-blue-700 shadow-sm border border-blue-200/30'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${
                    active ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  
                  {item.isNew && (
                    <span className="ml-auto px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                      NEW
                    </span>
                  )}
                  
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200/50">
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-white/60 to-gray-50/60 rounded-xl border border-white/20">
          <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">Your Profile</p>
            <p className="text-xs text-gray-600">Manage account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
