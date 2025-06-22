
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserCircle, Settings, Home, LogIn } from 'lucide-react';
import AuthModal from './AuthModal';

interface NavbarProps {
  showAuth?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showAuth = false }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                AvatarTalk.bio
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {showAuth ? (
                <>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white" onClick={() => setIsAuthModalOpen(true)}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </>
              ) : null}
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => setIsAuthModalOpen(true)}>
                <UserCircle className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
