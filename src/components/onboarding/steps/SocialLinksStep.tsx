import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Plus, Trash2, Save, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import {
  Twitter, Linkedin, Facebook, Instagram, Youtube, Globe, Github, Twitch, MessageCircle, Music,
} from 'lucide-react';

interface SocialLinksStepProps {
  onComplete: () => void;
}

const ALL_PLATFORMS = [
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, prefix: 'https://x.com/', placeholder: 'username', color: 'from-sky-400 to-blue-600' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, prefix: 'https://linkedin.com/in/', placeholder: 'username', color: 'from-blue-600 to-indigo-700' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, prefix: 'https://facebook.com/', placeholder: 'username', color: 'from-blue-500 to-blue-700' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, prefix: 'https://instagram.com/', placeholder: 'username', color: 'from-pink-500 via-red-500 to-orange-500' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, prefix: 'https://youtube.com/@', placeholder: '@channel', color: 'from-red-500 to-red-700' },
  { id: 'tiktok', name: 'TikTok', icon: Music, prefix: 'https://tiktok.com/@', placeholder: '@username', color: 'from-gray-900 to-black' },
  { id: 'github', name: 'GitHub', icon: Github, prefix: 'https://github.com/', placeholder: 'username', color: 'from-gray-700 to-gray-900' },
  { id: 'twitch', name: 'Twitch', icon: Twitch, prefix: 'https://twitch.tv/', placeholder: 'channel', color: 'from-purple-600 to-purple-800' },
  { id: 'discord', name: 'Discord', icon: MessageCircle, prefix: 'https://discord.gg/', placeholder: 'invite-code', color: 'from-indigo-600 to-purple-700' },
  { id: 'website', name: 'Website', icon: Globe, prefix: '', placeholder: 'https://yoursite.com', color: 'from-slate-600 to-slate-800' },
];

const SocialLinksStep: React.FC<SocialLinksStepProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});

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
          ALL_PLATFORMS.forEach(p => {
            if (data[p.id]) links[p.id] = data[p.id];
          });
          setSocialLinks(links);
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
      setSaved(true);
      toast({ title: 'Social links saved!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

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
      <CardContent className="p-4 sm:p-6 space-y-3">
        <p className="text-xs text-muted-foreground text-center">
          Add your social profiles — full URLs or usernames accepted
        </p>

        {/* All platforms shown at once for quick access */}
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {ALL_PLATFORMS.map((platform, index) => {
            const Icon = platform.icon;
            const hasValue = !!socialLinks[platform.id];
            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                  hasValue ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-sm shrink-0`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    {platform.prefix && (
                      <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:inline">{platform.prefix}</span>
                    )}
                    <Input
                      value={socialLinks[platform.id] || ''}
                      onChange={(e) => {
                        setSocialLinks({ ...socialLinks, [platform.id]: e.target.value });
                        setSaved(false);
                      }}
                      placeholder={platform.placeholder}
                      className="h-7 text-xs border-0 bg-transparent focus-visible:ring-1 px-1"
                    />
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground shrink-0">{platform.name}</span>
              </motion.div>
            );
          })}
        </div>

        {filledCount > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-medium text-blue-600">{filledCount}</span> link{filledCount !== 1 ? 's' : ''} added
          </p>
        )}

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg"
          onClick={async () => {
            await handleSave();
            onComplete();
          }}
          disabled={saving}
        >
          {saving ? 'Saving...' : saved ? (
            <><Check className="w-4 h-4 mr-2" /> Links Saved — Continue</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Save Links & Continue</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SocialLinksStep;