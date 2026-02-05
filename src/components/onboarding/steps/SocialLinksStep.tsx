import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Instagram, Twitter, Youtube, Linkedin, Globe, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

interface SocialLinksStepProps {
  onComplete: () => void;
}

const socialPlatforms = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username', color: 'from-pink-500 to-purple-500' },
  { key: 'twitter', label: 'Twitter/X', icon: Twitter, placeholder: 'https://twitter.com/username', color: 'from-blue-400 to-blue-600' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@channel', color: 'from-red-500 to-red-600' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username', color: 'from-blue-600 to-blue-800' },
  { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com', color: 'from-gray-500 to-gray-700' },
];

const SocialLinksStep: React.FC<SocialLinksStepProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<Record<string, string>>({
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    website: '',
  });

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('social_links')
        .upsert({
          user_id: user.id,
          instagram_url: links.instagram || null,
          twitter_url: links.twitter || null,
          youtube_url: links.youtube || null,
          linkedin_url: links.linkedin || null,
          website_url: links.website || null,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: 'Social links saved!',
        description: 'Your social profiles have been connected.',
      });
      onComplete();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save social links.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filledCount = Object.values(links).filter(Boolean).length;

  return (
    <Card className="border-0 shadow-xl bg-card/50 backdrop-blur">
      <CardHeader className="text-center pb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"
        >
          <Link2 className="w-8 h-8 text-white" />
        </motion.div>
        <CardTitle className="text-2xl">Connect your social profiles</CardTitle>
        <CardDescription>
          Let visitors find you across the web
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div key={platform.key} className="space-y-2">
                <Label htmlFor={platform.key} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  {platform.label}
                </Label>
                <Input
                  id={platform.key}
                  type="url"
                  placeholder={platform.placeholder}
                  value={links[platform.key]}
                  onChange={(e) => setLinks({ ...links, [platform.key]: e.target.value })}
                />
              </div>
            );
          })}
        </div>

        {filledCount > 0 && (
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filledCount}</span> social link{filledCount !== 1 ? 's' : ''} added
            </p>
          </div>
        )}

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-primary/80"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default SocialLinksStep;
