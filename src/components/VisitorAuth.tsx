import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const signUpSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const guestSignUpSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface VisitorAuthProps {
  isOpen: boolean;
  onClose: () => void;
}

const VisitorAuth: React.FC<VisitorAuthProps> = ({ 
  isOpen, 
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const validatedData = signInSchema.parse({
        email: formData.email.trim(),
        password: formData.password
      });

      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        });
        onClose();
        window.location.reload();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const validatedData = signUpSchema.parse({
        name: formData.name,
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.name,
          },
          emailRedirectTo: `${window.location.origin}${window.location.pathname}`
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Record visitor entry
        const currentUrl = window.location.href;
        const username = currentUrl.split('/').pop();
        
        if (username && username !== '') {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id')
              .eq('username', username)
              .maybeSingle();
            
            if (profileData?.id) {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await supabase.from('profile_visitors').insert({
                  visitor_id: user.id,
                  visited_profile_id: profileData.id,
                  is_anonymous: false
                });
              }
            }
          } catch (error) {
            console.log('Could not record visitor analytics:', error);
          }
        }
        
        toast({
          title: "Success",
          description: `Welcome, ${validatedData.name}! Account created successfully.`,
        });
        onClose();
        window.location.reload();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create account. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const validatedData = guestSignUpSchema.parse({
        name: formData.name,
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      // Sign up the guest user
      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.name,
          },
          emailRedirectTo: `${window.location.origin}${window.location.pathname}`
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Record visitor entry
        const currentUrl = window.location.href;
        const username = currentUrl.split('/').pop();
        
        if (username && username !== '') {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id')
              .eq('username', username)
              .maybeSingle();
            
            if (profileData?.id) {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await supabase.from('profile_visitors').insert({
                  visitor_id: user.id,
                  visited_profile_id: profileData.id,
                  is_anonymous: false
                });
              }
            }
          } catch (error) {
            console.log('Could not record visitor analytics:', error);
          }
        }
        
        toast({
          title: "Success",
          description: `Welcome, ${validatedData.name}! Account created successfully.`,
        });
        
        onClose();
        window.location.reload();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create account. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}`,
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border border-blue-500/30 backdrop-blur-xl text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-2xl mb-2">
            {showGuestForm ? 'Create Guest Account' : 'AvatarTalk.bio'}
          </DialogTitle>
          <p className="text-center text-blue-200 text-sm">
            {showGuestForm ? 'Sign up to access all features' : 'Create your AI avatar and start engaging'}
          </p>
        </DialogHeader>

        {!showGuestForm ? (
          <>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-blue-500/30">
                <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-blue-200">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-blue-200">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-blue-200">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-blue-200">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-blue-200">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-blue-200">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-blue-200">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-blue-200">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                      <Input
                        id="signup-confirm"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-blue-500/30" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-2 text-blue-300">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full bg-gradient-to-r from-white/10 to-white/5 border-2 border-blue-400/50 text-white hover:bg-white/20 hover:border-blue-400 flex items-center justify-center gap-2 py-3 font-semibold shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? "Connecting..." : "Continue with Google"}
            </Button>

            <Button 
              onClick={() => setShowGuestForm(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white flex items-center justify-center gap-2 mt-2"
              disabled={loading}
            >
              <UserPlus className="w-4 h-4" />
              Continue as Guest
            </Button>
          </>
        ) : (
          <form onSubmit={handleGuestSignUp} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="guest-name" className="text-blue-200">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  id="guest-name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10 bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-email" className="text-blue-200">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  id="guest-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-password" className="text-blue-200">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  id="guest-password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-confirm" className="text-blue-200">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  id="guest-confirm"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 bg-slate-800/50 border-blue-500/30 text-white placeholder-blue-300 focus:border-blue-400"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setShowGuestForm(false)}
                className="flex-1 bg-slate-800/50 border-blue-500/30 text-blue-200 hover:bg-slate-700/50"
                disabled={loading}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VisitorAuth;