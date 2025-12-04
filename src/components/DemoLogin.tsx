
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DemoLoginProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoLogin: React.FC<DemoLoginProps> = ({ isOpen, onClose }) => {
  const [demoName, setDemoName] = useState('');
  const { toast } = useToast();

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name for the demo",
        variant: "destructive",
      });
      return;
    }

    // Simulate demo login
    toast({
      title: "Demo Mode Activated",
      description: `Welcome ${demoName}! You're now in demo mode.`,
    });
    
    // Store demo user data in localStorage
    localStorage.setItem('demoUser', JSON.stringify({
      name: demoName,
      isDemo: true,
      loginTime: new Date().toISOString()
    }));
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-2xl mb-2">
            Try Demo Mode
          </DialogTitle>
          <p className="text-center text-gray-400 text-sm">
            Experience AvatarTalk.Co features without creating an account
          </p>
        </DialogHeader>

        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-3">
            <Play className="w-5 h-5 text-blue-400 mr-2" />
            <h3 className="text-white font-medium">Demo Features</h3>
          </div>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Full avatar customization</li>
            <li>• AI conversation testing</li>
            <li>• Profile page preview</li>
            <li>• Limited to 24 hours</li>
          </ul>
        </div>

        <form onSubmit={handleDemoLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-name" className="text-gray-300">Your Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="demo-name"
                name="name"
                type="text"
                placeholder="Enter your name for the demo"
                value={demoName}
                onChange={(e) => setDemoName(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Demo Experience
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Demo mode gives you full access to explore our features. 
          <br />
          Create an account to save your avatar permanently.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default DemoLogin;
