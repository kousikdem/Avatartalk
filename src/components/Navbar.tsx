
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserCircle, Settings, Home, LogIn, Users } from 'lucide-react';
import MainAuth from './MainAuth';
import VisitorAuth from './VisitorAuth';
import Logo from './Logo';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  showAuth?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showAuth = false }) => {
  const [isMainAuthOpen, setIsMainAuthOpen] = useState(false);
  const [isVisitorAuthOpen, setIsVisitorAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    };
    getCurrentUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const handleProfileClick = () => {
    if (currentUser) {
      // User is logged in, navigate to dashboard
      navigate('/settings/dashboard');
    } else {
      // User is not logged in, prompt to login
      setIsMainAuthOpen(true);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900/90 via-blue-900/90 to-slate-900/90 backdrop-blur-lg border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo size="sm" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AvatarTalk.Co
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {showAuth ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-200 hover:text-white hover:bg-blue-800/50"
                    onClick={() => handleNavigation('/')}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-200 hover:text-white hover:bg-blue-800/50"
                    onClick={() => handleNavigation('/?view=pricing')}
                  >
                    Pricing
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
                    onClick={() => setIsVisitorAuthOpen(true)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Visit Profile
                  </Button>
                </>
              )}
              
              {!currentUser && (
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white" 
                  onClick={() => setIsMainAuthOpen(true)}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <MainAuth 
        isOpen={isMainAuthOpen} 
        onClose={() => setIsMainAuthOpen(false)} 
      />

      <VisitorAuth 
        isOpen={isVisitorAuthOpen} 
        onClose={() => setIsVisitorAuthOpen(false)} 
      />
    </>
  );
};

export default Navbar;
