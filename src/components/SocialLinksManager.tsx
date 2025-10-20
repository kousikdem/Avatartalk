import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Github,
  Twitch,
  MessageCircle,
  Music,
  ArrowUp,
  ArrowDown,
  Save,
  Loader2
} from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  icon: any;
  url: string;
  enabled: boolean;
  position: number;
}

const SOCIAL_PLATFORMS = [
  { id: 'twitter', name: 'Twitter', icon: Twitter, placeholder: 'username' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, placeholder: 'username' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, placeholder: 'username' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, placeholder: 'username' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, placeholder: '@channel' },
  { id: 'tiktok', name: 'TikTok', icon: Music, placeholder: '@username' },
  { id: 'github', name: 'GitHub', icon: Github, placeholder: 'username' },
  { id: 'twitch', name: 'Twitch', icon: Twitch, placeholder: 'channel' },
  { id: 'discord', name: 'Discord', icon: MessageCircle, placeholder: 'invite-code' },
  { id: 'website', name: 'Website', icon: Globe, placeholder: 'https://...' },
];

const SocialLinksManager: React.FC = () => {
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [linkOrder, setLinkOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const links: Record<string, string> = {};
        SOCIAL_PLATFORMS.forEach(platform => {
          if (data[platform.id]) {
            links[platform.id] = data[platform.id];
          }
        });
        setSocialLinks(links);
        
        // Set initial order based on which links are filled
        const filledLinks = SOCIAL_PLATFORMS
          .filter(p => links[p.id])
          .map(p => p.id);
        const emptyLinks = SOCIAL_PLATFORMS
          .filter(p => !links[p.id])
          .map(p => p.id);
        setLinkOrder([...filledLinks, ...emptyLinks]);
      } else {
        setLinkOrder(SOCIAL_PLATFORMS.map(p => p.id));
      }
    } catch (error) {
      console.error('Error loading social links:', error);
      toast({
        title: 'Error',
        description: 'Failed to load social links',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSocialLinks = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates: any = { user_id: user.id };
      SOCIAL_PLATFORMS.forEach(platform => {
        updates[platform.id] = socialLinks[platform.id] || null;
      });

      const { error } = await supabase
        .from('social_links')
        .upsert(updates, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Social links saved successfully',
      });
    } catch (error) {
      console.error('Error saving social links:', error);
      toast({
        title: 'Error',
        description: 'Failed to save social links',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateLink = (platform: string, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...linkOrder];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setLinkOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === linkOrder.length - 1) return;
    const newOrder = [...linkOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setLinkOrder(newOrder);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-white to-gray-50/30 border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Social Links Manager
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Add your social media links and customize their display order
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {linkOrder.map((platformId, index) => {
              const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
              if (!platform) return null;

              const Icon = platform.icon;
              return (
                <div
                  key={platformId}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={platformId} className="text-sm font-medium text-gray-700">
                        {platform.name}
                      </Label>
                      <Input
                        id={platformId}
                        value={socialLinks[platformId] || ''}
                        onChange={(e) => updateLink(platformId, e.target.value)}
                        placeholder={platform.placeholder}
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="h-8 w-8 border-gray-300 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => moveDown(index)}
                      disabled={index === linkOrder.length - 1}
                      className="h-8 w-8 border-gray-300 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            <Button
              onClick={saveSocialLinks}
              disabled={saving}
              className="w-full gradient-button"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Social Links
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialLinksManager;
