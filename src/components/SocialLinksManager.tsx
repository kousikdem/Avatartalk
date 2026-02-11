import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Twitter, Linkedin, Facebook, Instagram, Youtube, Globe, Github, Twitch, MessageCircle, Music,
  ArrowUp, ArrowDown, Save, Loader2, Plus, Trash2, Upload, Link2, Image,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomLink {
  id: string;
  name: string;
  url: string;
  icon_url?: string;
}

const SOCIAL_PLATFORMS = [
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

const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return '';
  }
};

const SocialLinksManager: React.FC = () => {
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [linkOrder, setLinkOrder] = useState<string[]>(SOCIAL_PLATFORMS.map(p => p.id));
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomLink, setNewCustomLink] = useState({ name: '', url: '', icon_url: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
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
          if ((data as any)[platform.id]) {
            links[platform.id] = (data as any)[platform.id];
          }
        });
        setSocialLinks(links);

        const filledLinks = SOCIAL_PLATFORMS.filter(p => links[p.id]).map(p => p.id);
        const emptyLinks = SOCIAL_PLATFORMS.filter(p => !links[p.id]).map(p => p.id);
        setLinkOrder([...filledLinks, ...emptyLinks]);

        // Load custom links from DB
        const rawCustom = (data as any).custom_links;
        if (rawCustom) {
          try {
            setCustomLinks(JSON.parse(rawCustom) || []);
          } catch { /* */ }
        }
      } else {
        setLinkOrder(SOCIAL_PLATFORMS.map(p => p.id));
      }
    } catch (error) {
      console.error('Error loading social links:', error);
      toast({ title: 'Error', description: 'Failed to load social links', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const saveSocialLinks = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates: any = {
        user_id: user.id,
        custom_links: JSON.stringify(customLinks),
      };
      SOCIAL_PLATFORMS.forEach(platform => {
        updates[platform.id] = socialLinks[platform.id] || null;
      });

      const { error } = await supabase
        .from('social_links')
        .upsert(updates, { onConflict: 'user_id' });

      if (error) throw error;

      toast({ title: 'Success', description: 'Social links saved successfully' });
    } catch (error) {
      console.error('Error saving social links:', error);
      toast({ title: 'Error', description: 'Failed to save social links', variant: 'destructive' });
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

  const moveCustomUp = (index: number) => {
    if (index === 0) return;
    setCustomLinks(prev => {
      const newList = [...prev];
      [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
      return newList;
    });
  };

  const moveCustomDown = (index: number) => {
    setCustomLinks(prev => {
      if (index >= prev.length - 1) return prev;
      const newList = [...prev];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      return newList;
    });
  };

  // Auto-fetch favicon when URL changes
  const handleCustomUrlChange = (url: string) => {
    setNewCustomLink(prev => ({
      ...prev,
      url,
      icon_url: prev.icon_url || getFaviconUrl(url), // Only auto-set if not manually uploaded
    }));
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/custom-link-icons/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(filePath);

      setNewCustomLink(prev => ({ ...prev, icon_url: urlData.publicUrl }));
      toast({ title: 'Icon uploaded!' });
    } catch (err) {
      console.error('Upload error:', err);
      toast({ title: 'Upload failed', variant: 'destructive' });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addCustomLink = () => {
    if (!newCustomLink.name || !newCustomLink.url) {
      toast({ title: 'Error', description: 'Please fill in name and URL', variant: 'destructive' });
      return;
    }
    const iconUrl = newCustomLink.icon_url || getFaviconUrl(newCustomLink.url);
    setCustomLinks(prev => [...prev, { ...newCustomLink, icon_url: iconUrl, id: Date.now().toString() }]);
    setNewCustomLink({ name: '', url: '', icon_url: '' });
    setShowAddCustom(false);
    toast({ title: 'Custom link added' });
  };

  const removeCustomLink = (id: string) => {
    setCustomLinks(prev => prev.filter(link => link.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="bg-white border-gray-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Social Links Manager
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Manage your social media links and customize their display order on your profile
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Social Platforms */}
              <div className="space-y-3">
                <AnimatePresence>
                  {linkOrder.map((platformId, index) => {
                    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
                    if (!platform) return null;
                    const Icon = platform.icon;
                    const hasValue = socialLinks[platformId];

                    return (
                      <motion.div
                        key={platformId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-4 bg-gradient-to-r ${hasValue ? 'from-gray-50 to-white' : 'from-white to-gray-50/50'} rounded-xl border ${hasValue ? 'border-gray-300' : 'border-gray-200'} shadow-md hover:shadow-lg hover:border-gray-400 transition-all duration-300`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={platformId} className="text-sm font-semibold text-gray-800 mb-2 block">
                              {platform.name}
                            </Label>
                            <Input
                              id={platformId}
                              value={socialLinks[platformId] || ''}
                              onChange={(e) => updateLink(platformId, e.target.value)}
                              placeholder={platform.placeholder}
                              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="icon" variant="outline" onClick={() => moveUp(index)} disabled={index === 0}
                            className="h-9 w-9 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-30 text-gray-600 hover:text-gray-900">
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => moveDown(index)} disabled={index === linkOrder.length - 1}
                            className="h-9 w-9 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-30 text-gray-600 hover:text-gray-900">
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Custom Links Section */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Custom Links</h3>
                  <Button onClick={() => setShowAddCustom(!showAddCustom)} size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" /> Add Custom Link
                  </Button>
                </div>

                <AnimatePresence>
                  {showAddCustom && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-gray-700 text-sm mb-2 block">Link Name</Label>
                          <Input value={newCustomLink.name} onChange={(e) => setNewCustomLink({ ...newCustomLink, name: e.target.value })}
                            placeholder="e.g., My Portfolio" className="bg-white border-gray-300 text-gray-900" />
                        </div>
                        <div>
                          <Label className="text-gray-700 text-sm mb-2 block">URL</Label>
                          <Input value={newCustomLink.url} onChange={(e) => handleCustomUrlChange(e.target.value)}
                            placeholder="https://..." className="bg-white border-gray-300 text-gray-900" />
                        </div>
                        <div>
                          <Label className="text-gray-700 text-sm mb-2 block">Logo Icon</Label>
                          <div className="flex gap-2 items-center">
                            {newCustomLink.icon_url && (
                              <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden bg-white shrink-0">
                                <img src={newCustomLink.icon_url} alt="" className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              </div>
                            )}
                            <Input value={newCustomLink.icon_url} onChange={(e) => setNewCustomLink({ ...newCustomLink, icon_url: e.target.value })}
                              placeholder="Auto-fetched or paste URL" className="bg-white border-gray-300 text-gray-900 flex-1 text-sm" />
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                            <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}
                              className="bg-white border-gray-300 hover:bg-gray-50 shrink-0" title="Upload custom icon">
                              <Upload className="h-4 w-4 text-gray-600" />
                            </Button>
                          </div>
                          {newCustomLink.url && !newCustomLink.icon_url && (
                            <p className="text-[11px] text-muted-foreground mt-1">Favicon will be auto-fetched from URL</p>
                          )}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => { setShowAddCustom(false); setNewCustomLink({ name: '', url: '', icon_url: '' }); }}
                            className="bg-white border-gray-300 hover:bg-gray-50 text-gray-700">Cancel</Button>
                          <Button onClick={addCustomLink}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Add Link</Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {customLinks.map((link, index) => (
                    <motion.div key={link.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-300 shadow-md">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {link.icon_url ? (
                            <img src={link.icon_url} alt={link.name} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <Link2 className="h-6 w-6 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{link.name}</p>
                          <p className="text-xs text-gray-600 truncate">{link.url}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="icon" variant="outline" onClick={() => moveCustomUp(index)} disabled={index === 0}
                          className="h-9 w-9 bg-white border-gray-300 hover:bg-gray-50 disabled:opacity-30 text-gray-600">
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => moveCustomDown(index)} disabled={index === customLinks.length - 1}
                          className="h-9 w-9 bg-white border-gray-300 hover:bg-gray-50 disabled:opacity-30 text-gray-600">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button size="icon" variant="outline" onClick={() => removeCustomLink(link.id)}
                        className="h-9 w-9 bg-red-50 border-red-300 hover:bg-red-100 hover:border-red-400 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <Button onClick={saveSocialLinks} disabled={saving}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
                {saving ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving Changes...</>
                ) : (
                  <><Save className="mr-2 h-5 w-5" /> Save All Changes</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SocialLinksManager;
