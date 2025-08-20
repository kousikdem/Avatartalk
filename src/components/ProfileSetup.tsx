
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { User, ArrowRight } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: () => void;
}

export const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const { profileData, updateProfile, loading } = useUserProfile();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    profession: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profileData) {
      setFormData({
        username: profileData.username || '',
        display_name: profileData.display_name || '',
        bio: profileData.bio || '',
        profession: profileData.profession || '',
      });

      // If user already has a username, they've completed setup
      if (profileData.username) {
        onComplete();
      }
    }
  }, [profileData, onComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    try {
      const success = await updateProfile(formData);
      if (success) {
        toast({
          title: "Success",
          description: "Profile setup completed!",
        });
        onComplete();
      }
    } catch (error) {
      console.error('Profile setup error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Set up your profile to get started with your AI avatar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username *
              </label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium mb-2">
                Display Name
              </label>
              <Input
                id="display_name"
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="How should people see your name?"
              />
            </div>
            
            <div>
              <label htmlFor="profession" className="block text-sm font-medium mb-2">
                Profession
              </label>
              <Input
                id="profession"
                type="text"
                value={formData.profession}
                onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                placeholder="What do you do?"
              />
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-2">
                Bio
              </label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell people about yourself..."
                rows={3}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={saving || !formData.username.trim()}
            >
              {saving ? (
                "Setting up..."
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
