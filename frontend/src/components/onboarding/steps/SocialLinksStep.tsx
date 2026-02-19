import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Plus, Trash2, Save, Check, ArrowUp, ArrowDown, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import {
  Twitter, Linkedin, Facebook, Instagram, Youtube, Github, Twitch, MessageCircle, Music, Globe,
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

interface CustomLink {
  id: string;
  name: string;
  url: string;
  icon_url?: string;
}

const SocialLinksStep: React.FC<SocialLinksStepProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [platformOrder, setPlatformOrder] = useState<string[]>(ALL_PLATFORMS.map(p => p.id));
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    const loadLinks = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data } = await supabase.from('social_links').select('*').eq('user_id', user.id).maybeSingle();
        if (data) {
          const links: Record<string, string> = {};
          ALL_PLATFORMS.forEach(p => { if ((data as any)[p.id]) links[p.id] = (data as any)[p.id]; });
          setSocialLinks(links);

          // Restore order: filled first, then empty
          const filled = ALL_PLATFORMS.filter(p => links[p.id]).map(p => p.id);
          const empty = ALL_PLATFORMS.filter(p => !links[p.id]).map(p => p.id);
          setPlatformOrder([...filled, ...empty]);

          const rawCustom = (data as any).custom_links;
          if (rawCustom) {
            try { setCustomLinks(JSON.parse(rawCustom) || []); } catch { /* */ }
          }
        }
      } catch (err) {
        console.error('Error loading links:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLinks();
  }, [user]);

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  };

  const handleAddCustomLink = () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;
    const faviconUrl = getFaviconUrl(newLinkUrl);
    setCustomLinks(prev => [...prev, { id: Date.now().toString(), name: newLinkName, url: newLinkUrl, icon_url: faviconUrl }]);
    setNewLinkName('');
    setNewLinkUrl('');
    setShowAddCustom(false);
    setSaved(false);
  };

  const handleRemoveCustomLink = (id: string) => {
    setCustomLinks(prev => prev.filter(l => l.id !== id));
    setSaved(false);
  };

  const movePlatformUp = (index: number) => {
    if (index === 0) return;
    setPlatformOrder(prev => {
      const newOrder = [...prev];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      return newOrder;
    });
    setSaved(false);
  };

  const movePlatformDown = (index: number) => {
    setPlatformOrder(prev => {
      if (index >= prev.length - 1) return prev;
      const newOrder = [...prev];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      return newOrder;
    });
    setSaved(false);
  };

  const moveCustomUp = (index: number) => {
    if (index === 0) return;
    setCustomLinks(prev => {
      const newList = [...prev];
      [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
      return newList;
    });
    setSaved(false);
  };

  const moveCustomDown = (index: number) => {
    setCustomLinks(prev => {
      if (index >= prev.length - 1) return prev;
      const newList = [...prev];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      return newList;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates: any = { user_id: user.id, custom_links: JSON.stringify(customLinks) };
      ALL_PLATFORMS.forEach(p => { updates[p.id] = socialLinks[p.id] || null; });
      const { error } = await supabase.from('social_links').upsert(updates, { onConflict: 'user_id' });
      if (error) throw error;
      setSaved(true);
      toast({ title: 'Social links saved!' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const filledCount = Object.values(socialLinks).filter(Boolean).length + customLinks.length;

  if (loading) {
    return (
      <Card className="border border-border/50 shadow-xl bg-white">
        <CardContent className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 shadow-xl bg-white">
      <CardContent className="p-4 sm:p-6 space-y-3">
        <p className="text-xs text-muted-foreground text-center">Add your social profiles — full URLs or usernames. Reorder with arrows.</p>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {platformOrder.map((platformId, index) => {
            const platform = ALL_PLATFORMS.find(p => p.id === platformId);
            if (!platform) return null;
            const Icon = platform.icon;
            const hasValue = !!socialLinks[platform.id];
            return (
              <motion.div key={platform.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.02 }}
                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${hasValue ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-sm shrink-0`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    {platform.prefix && <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:inline">{platform.prefix}</span>}
                    <Input value={socialLinks[platform.id] || ''} onChange={(e) => { setSocialLinks({ ...socialLinks, [platform.id]: e.target.value }); setSaved(false); }}
                      placeholder={platform.placeholder} className="h-7 text-xs border-0 bg-transparent focus-visible:ring-1 px-1" />
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-slate-700" disabled={index === 0} onClick={() => movePlatformUp(index)}>
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-slate-700" disabled={index === platformOrder.length - 1} onClick={() => movePlatformDown(index)}>
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                </div>
                <span className="text-[9px] text-muted-foreground shrink-0 hidden sm:inline">{platform.name}</span>
              </motion.div>
            );
          })}

          {/* Custom links */}
          {customLinks.map((link, index) => (
            <div key={link.id} className="flex items-center gap-2 p-2 rounded-xl border border-green-200 bg-green-50/30">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                {link.icon_url ? <img src={link.icon_url} alt="" className="w-5 h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <Link2 className="w-3.5 h-3.5 text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{link.name}</p>
                <p className="text-[9px] text-muted-foreground truncate">{link.url}</p>
              </div>
              <div className="flex flex-col gap-0.5 shrink-0">
                <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-slate-700" disabled={index === 0} onClick={() => moveCustomUp(index)}>
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-slate-700" disabled={index === customLinks.length - 1} onClick={() => moveCustomDown(index)}>
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-slate-400 hover:text-red-500" onClick={() => handleRemoveCustomLink(link.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add Custom Link */}
        {showAddCustom ? (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
            <Label className="text-xs font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add Custom Link</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Link Name" value={newLinkName} onChange={(e) => setNewLinkName(e.target.value)} className="h-7 text-xs" />
              <Input placeholder="https://..." value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="h-7 text-xs" />
            </div>
            {newLinkUrl && getFaviconUrl(newLinkUrl) && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <img src={getFaviconUrl(newLinkUrl)} alt="" className="w-4 h-4" /> Auto-detected favicon
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleAddCustomLink} disabled={!newLinkName.trim() || !newLinkUrl.trim()} size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white flex-1">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
              <Button onClick={() => setShowAddCustom(false)} variant="outline" size="sm" className="h-7 text-xs">Cancel</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 h-8 text-xs" onClick={() => setShowAddCustom(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Custom Link
          </Button>
        )}

        {filledCount > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-medium text-blue-600">{filledCount}</span> link{filledCount !== 1 ? 's' : ''} added
          </p>
        )}

        <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg"
          onClick={async () => { await handleSave(); onComplete(); }} disabled={saving}>
          {saving ? 'Saving...' : saved ? <><Check className="w-4 h-4 mr-2" /> Links Saved — Continue</> : <><Save className="w-4 h-4 mr-2" /> Save Links & Continue</>}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SocialLinksStep;
