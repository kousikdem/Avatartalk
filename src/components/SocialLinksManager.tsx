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
  Loader2,
  Plus,
  Trash2,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialLink {
  id: string;
  platform: string;
  icon: any;
  url: string;
  enabled: boolean;
  position: number;
  color: string;
}

interface CustomLink {
  id: string;
  name: string;
  url: string;
  logo: string;
}

const SOCIAL_PLATFORMS = [
  { id: 'twitter', name: 'Twitter', icon: Twitter, placeholder: 'username', color: 'from-sky-400 to-blue-600' },
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

const SocialLinksManager: React.FC = () => {
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [linkOrder, setLinkOrder] = useState<string[]>([]);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomLink, setNewCustomLink] = useState({ name: '', url: '', logo: '' });
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

  const addCustomLink = () => {
    if (!newCustomLink.name || !newCustomLink.url) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    setCustomLinks([...customLinks, { ...newCustomLink, id: Date.now().toString() }]);
    setNewCustomLink({ name: '', url: '', logo: '' });
    setShowAddCustom(false);
    toast({
      title: 'Success',
      description: 'Custom link added',
    });
  };

  const removeCustomLink = (id: string) => {
    setCustomLinks(customLinks.filter(link => link.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 shadow-2xl backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Social Links Manager
              </CardTitle>
              <p className="text-sm text-slate-400 mt-2">
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
                        className={`flex items-center gap-4 p-4 bg-gradient-to-r ${
                          hasValue ? 'from-slate-800/80 to-slate-700/80' : 'from-slate-800/40 to-slate-700/40'
                        } rounded-xl border ${
                          hasValue ? 'border-slate-600/50' : 'border-slate-700/30'
                        } shadow-lg hover:shadow-xl hover:border-slate-500/50 transition-all duration-300`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={platformId} className="text-sm font-semibold text-slate-200 mb-2 block">
                              {platform.name}
                            </Label>
                            <Input
                              id={platformId}
                              value={socialLinks[platformId] || ''}
                              onChange={(e) => updateLink(platformId, e.target.value)}
                              placeholder={platform.placeholder}
                              className="bg-slate-900/50 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="h-9 w-9 bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500/50 disabled:opacity-30 text-slate-400 hover:text-white"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => moveDown(index)}
                            disabled={index === linkOrder.length - 1}
                            className="h-9 w-9 bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500/50 disabled:opacity-30 text-slate-400 hover:text-white"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Custom Links Section */}
              <div className="space-y-3 pt-6 border-t border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-200">Custom Links</h3>
                  <Button
                    onClick={() => setShowAddCustom(!showAddCustom)}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Link
                  </Button>
                </div>

                <AnimatePresence>
                  {showAddCustom && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                    >
                      <div className="space-y-3">
                        <div>
                          <Label className="text-slate-300 text-sm mb-2 block">Link Name</Label>
                          <Input
                            value={newCustomLink.name}
                            onChange={(e) => setNewCustomLink({ ...newCustomLink, name: e.target.value })}
                            placeholder="e.g., My Portfolio"
                            className="bg-slate-900/50 border-slate-600/50 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300 text-sm mb-2 block">URL</Label>
                          <Input
                            value={newCustomLink.url}
                            onChange={(e) => setNewCustomLink({ ...newCustomLink, url: e.target.value })}
                            placeholder="https://..."
                            className="bg-slate-900/50 border-slate-600/50 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300 text-sm mb-2 block">Logo URL (optional)</Label>
                          <div className="flex gap-2">
                            <Input
                              value={newCustomLink.logo}
                              onChange={(e) => setNewCustomLink({ ...newCustomLink, logo: e.target.value })}
                              placeholder="https://..."
                              className="bg-slate-900/50 border-slate-600/50 text-white flex-1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50"
                            >
                              <Upload className="h-4 w-4 text-slate-400" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setShowAddCustom(false)}
                            className="bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50 text-slate-300"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={addCustomLink}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          >
                            Add Link
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {customLinks.map((link, index) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-xl border border-slate-600/50 shadow-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {link.logo ? (
                          <img src={link.logo} alt={link.name} className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                            <Globe className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-200">{link.name}</p>
                          <p className="text-xs text-slate-400 truncate">{link.url}</p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => removeCustomLink(link.id)}
                        className="h-9 w-9 bg-red-900/20 border-red-600/50 hover:bg-red-900/40 hover:border-red-500/50 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <Button
                onClick={saveSocialLinks}
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save All Changes
                  </>
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
