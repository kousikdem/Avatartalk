
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
  onSignInClick?: () => void;
}

const VisitorAuth: React.FC<VisitorAuthProps> = ({ isOpen, onClose, onSignInClick }) => {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const { toast } = useToast();

  const handleGuestLogin = async () => {
    if (!guestName.trim() || !guestEmail.trim()) {
      toast({
        title: "Information Required",
        description: "Please enter your name and email to continue as a visitor.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create visitor session with enhanced data
      const visitorId = `visitor_${Date.now()}`;
      // Track visitor analytics only - no localStorage auth bypass

      // Enhanced database integration - record visitor entry  
      const currentUrl = window.location.href;
      const username = currentUrl.split('/').pop(); // Extract username from URL
      
      if (username && username !== '') {
        try {
          // First, get the profile ID from username
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .maybeSingle();
          
          if (profileData?.id) {
            // Record visitor entry in database with proper profile ID
            await supabase.from('profile_visitors').insert({
              visitor_id: null, // Visitor not authenticated
          visited_profile_id: profileData.id,
          is_anonymous: true
            });
          }
        } catch (error) {
          // Don't block visitor login if this fails, but log for debugging
          console.log('Could not record visitor analytics:', error);
        }
      }
      
      toast({
        title: "Visit Recorded",
        description: `Welcome, ${guestName}! Sign up to unlock all features.`,
      });
      
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
      toast({
        title: "Demo Mode",
        description: "Sign up to unlock all features and interactions.",
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
            🚀 Join the Experience!  
          </DialogTitle>
          <p className="text-center text-blue-200 text-sm">
            Enter as a visitor to follow profiles, chat with AI avatars, and explore content
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

            <div className="space-y-2">
              <Label htmlFor="guest-email" className="text-blue-200">Your Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  id="guest-email"
                  type="email"
                  placeholder="Enter your email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400"
                />
              </div>
            </div>

            <Button 
              onClick={handleGuestLogin}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
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
            className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 py-3 rounded-xl font-semibold"
            onClick={handleDemoLogin}
          >
            <Play className="mr-2 h-4 w-4" />
            Try Demo Mode
          </Button>

          {onSignInClick && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-blue-500/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-2 text-blue-300">Already have an account?</span>
                </div>
              </div>

              <Button 
                variant="outline"
                className="w-full border-blue-500/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400 py-3 rounded-xl font-semibold"
                onClick={onSignInClick}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisitorAuth;
