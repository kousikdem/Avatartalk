import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import {
  Twitter, Linkedin, Facebook, Instagram, Youtube, Globe, Github, Twitch, MessageCircle, Music,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SocialLinksStepProps {
  onComplete: () => void;
}

const ALL_PLATFORMS = [
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, placeholder: 'username', color: 'from-sky-400 to-blue-600' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, placeholder: 'username', color: 'from-blue-600 to-indigo-700' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, placeholder: 'username', color: 'from-blue-500 to-blue-700' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, placeholder: 'username', color: 'from-pink-500 via-red-500 to-orange-500' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, placeholder: '@channel', color: 'from-red-500 to-red-700' },
  { id: 'tiktok', name: 'TikTok', icon: Music, placeholder: '@username', color: 'from-gray-900 to-black' },
  { id: 'github', name: 'GitHub', icon: Github, placeholder: 'username', color: 'from-gray-700 to-gray-900' },
  { id: 'twitch', name: 'Twitch', icon: Twitch, placeholder: 'channel', color: 'from-purple-600 to-purple-800' },
  { id: 'discord', name: 'Discord', icon: MessageCircle, placeholder: 'invite-code', color: 'from-indigo-600 to-purple-700' },
  { id: 'website', name: 'Website', icon: Globe, placeholder: 'https://...', color: 'from-slate-600 to-slate-800' },
];

const DEFAULT_VISIBLE = ['twitter', 'linkedin', 'instagram', 'youtube'];

const SocialLinksStep: React.FC<SocialLinksStepProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [visiblePlatforms, setVisiblePlatforms] = useState<string[]>(DEFAULT_VISIBLE);

  useEffect(() => {
    const loadLinks = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data } = await supabase
          .from('social_links')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          const links: Record<string, string> = {};
          const visible = [...DEFAULT_VISIBLE];
          ALL_PLATFORMS.forEach(p => {
            if (data[p.id]) {
              links[p.id] = data[p.id];
              if (!visible.includes(p.id)) visible.push(p.id);
            }
          });
          setSocialLinks(links);
          setVisiblePlatforms(visible);
        }
      } catch (err) {
        console.error('Error loading links:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLinks();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates: any = { user_id: user.id };
      ALL_PLATFORMS.forEach(p => {
        updates[p.id] = socialLinks[p.id] || null;
      });
      const { error } = await supabase
        .from('social_links')
        .upsert(updates, { onConflict: 'user_id' });
      if (error) throw error;
      toast({ title: 'Social links saved!' });
      onComplete();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addNewLink = (platformId: string) => {
    if (!visiblePlatforms.includes(platformId)) {
      setVisiblePlatforms([...visiblePlatforms, platformId]);
    }
  };

  const removeLink = (platformId: string) => {
    setVisiblePlatforms(visiblePlatforms.filter(id => id !== platformId));
    const updated = { ...socialLinks };
    delete updated[platformId];
    setSocialLinks(updated);
  };

  const availableToAdd = ALL_PLATFORMS.filter(p => !visiblePlatforms.includes(p.id));
  const filledCount = Object.values(socialLinks).filter(Boolean).length;

  if (loading) {
    return (
      <Card className="border border-border/50 shadow-xl bg-white">
        <CardContent className="p-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <p className="text-xs text-muted-foreground text-center">
          Add your social profiles so visitors can find you across the web
        </p>

        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
          {visiblePlatforms.map((platformId, index) => {
            const platform = ALL_PLATFORMS.find(p => p.id === platformId);
            if (!platform) return null;
            const Icon = platform.icon;
            const hasValue = !!socialLinks[platform.id];
            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                  hasValue ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-sm shrink-0`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1">
                  <Input
                    value={socialLinks[platform.id] || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, [platform.id]: e.target.value })}
                    placeholder={platform.placeholder}
                    className="h-8 text-sm"
                  />
                </div>
                {!DEFAULT_VISIBLE.includes(platform.id) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-red-500"
                    onClick={() => removeLink(platform.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Add new link */}
        {availableToAdd.length > 0 && (
          <div className="flex items-center gap-2">
            <Select onValueChange={addNewLink}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Add another link..." />
              </SelectTrigger>
              <SelectContent>
                {availableToAdd.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      <p.icon className="w-3.5 h-3.5" />
                      {p.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => {
                if (availableToAdd.length > 0) addNewLink(availableToAdd[0].id);
              }}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          </div>
        )}

        {filledCount > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-medium text-blue-600">{filledCount}</span> link{filledCount !== 1 ? 's' : ''} added
          </p>
        )}

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save & Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default SocialLinksStep;
