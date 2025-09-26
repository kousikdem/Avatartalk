
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Play, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VisitorAuthProps {
  isOpen: boolean;
  onClose: () => void;
}

const VisitorAuth: React.FC<VisitorAuthProps> = ({ isOpen, onClose }) => {
  const [guestName, setGuestName] = useState('');
  const { toast } = useToast();

  const handleGuestLogin = async () => {
    if (!guestName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue as a visitor.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create visitor session with enhanced data
      const visitorId = `visitor_${Date.now()}`;
      const visitorData = {
        name: guestName,
        isVisitor: true,
        loginTime: new Date().toISOString(),
        id: visitorId,
        sessionId: visitorId
      };

      // Store in localStorage
      localStorage.setItem('visitorUser', JSON.stringify(visitorData));

      // Enhanced database integration - record visitor entry
      const currentUrl = window.location.href;
      const profileId = currentUrl.split('/').pop(); // Extract profile ID from URL
      
      if (profileId && profileId !== '') {
        try {
          // Record visitor entry in database
          await supabase.from('profile_visitors').insert({
            visitor_id: null, // Visitor not authenticated
            visited_profile_id: profileId,
            ip_address: null, // Could be populated server-side
            user_agent: navigator.userAgent
          });
        } catch (error) {
          // Don't block visitor login if this fails, but log for debugging
          console.log('Could not record visitor analytics:', error);
        }
      }
      
      toast({
        title: "Welcome Visitor!",
        description: `Welcome ${guestName}! You can now explore and follow profiles.`,
      });
      
      // Reload the page to refresh authentication state
      window.location.reload();
      
      onClose();
    } catch (error) {
      console.error('Error during visitor login:', error);
      toast({
        title: "Error",
        description: "Failed to complete visitor login. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDemoLogin = async () => {
    try {
      const demoVisitorData = {
        name: 'Demo Visitor',
        isVisitor: true,
        isDemo: true,
        loginTime: new Date().toISOString(),
        id: `demo_visitor_${Date.now()}`
      };

      localStorage.setItem('visitorUser', JSON.stringify(demoVisitorData));
      
      toast({
        title: "Demo Mode Activated",
        description: "Welcome Demo Visitor! You can now explore profiles.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error during demo login:', error);
      toast({
        title: "Error", 
        description: "Failed to activate demo mode. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border border-blue-500/30 backdrop-blur-xl text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-2xl mb-2">
            Visit Profile
          </DialogTitle>
          <p className="text-center text-blue-200 text-sm">
            Enter as a visitor to explore AI avatars and chat
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guest-name" className="text-blue-200">Your Name</Label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  id="guest-name"
                  type="text"
                  placeholder="Enter your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400"
                />
              </div>
            </div>

            <Button 
              onClick={handleGuestLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Continue as Visitor
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-blue-500/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-2 text-blue-300">Or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400"
            onClick={handleDemoLogin}
          >
            <Play className="mr-2 h-4 w-4" />
            Try Demo Mode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisitorAuth;
