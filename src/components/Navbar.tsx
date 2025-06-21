
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserCircle, Settings, Home } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/d6afa97d-dc19-4ce0-9426-ba291ed29f50.png" 
              alt="AvatarTalk.bio" 
              className="h-8 w-auto"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AvatarTalk.bio
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <UserCircle className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
