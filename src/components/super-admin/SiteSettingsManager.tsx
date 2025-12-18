import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, Globe, Search, BarChart, Tag, FileText, Plus, Save
} from 'lucide-react';
import { SiteSetting } from '@/hooks/useSuperAdminIntegrations';
import { RefreshCw } from 'lucide-react';

interface Props {
  settings: SiteSetting[];
  onUpdate: (setting: Partial<SiteSetting>) => Promise<boolean>;
  onRefresh: () => void;
}

export const SiteSettingsManager = ({ settings, onUpdate, onRefresh }: Props) => {
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSetting, setNewSetting] = useState<Partial<SiteSetting>>({
    setting_category: 'general',
    setting_key: '',
    setting_value: '',
    description: '',
    is_public: false
  });

  const getSettingsByCategory = (category: string) => {
    return settings.filter(s => s.setting_category === category);
  };

  const handleSave = async (setting: SiteSetting) => {
    const editedValue = editedSettings[setting.id];
    if (editedValue !== undefined) {
      await onUpdate({
        id: setting.id,
        setting_value: typeof editedValue === 'string' ? JSON.parse(editedValue) : editedValue
      });
      setEditedSettings(prev => {
        const next = { ...prev };
        delete next[setting.id];
        return next;
      });
    }
  };

  const handleAddSetting = async () => {
    if (newSetting.setting_key && newSetting.setting_value !== undefined) {
      const success = await onUpdate({
        setting_category: newSetting.setting_category,
        setting_key: newSetting.setting_key,
        setting_value: typeof newSetting.setting_value === 'string' 
          ? JSON.parse(newSetting.setting_value) 
          : newSetting.setting_value,
        description: newSetting.description,
        is_public: newSetting.is_public
      });
      if (success) {
        setNewSetting({
          setting_category: 'general',
          setting_key: '',
          setting_value: '',
          description: '',
          is_public: false
        });
        setIsAddDialogOpen(false);
      }
    }
  };

  const renderSettingInput = (setting: SiteSetting) => {
    const value = editedSettings[setting.id] !== undefined 
      ? editedSettings[setting.id] 
      : JSON.stringify(setting.setting_value, null, 2);
    
    const isChanged = editedSettings[setting.id] !== undefined;

    return (
      <div className="space-y-2 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">
              {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Label>
            {setting.description && (
              <p className="text-sm text-muted-foreground">{setting.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={setting.is_public ? 'default' : 'secondary'}>
              {setting.is_public ? 'Public' : 'Private'}
            </Badge>
            {isChanged && (
              <Button size="sm" onClick={() => handleSave(setting)}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>
        {typeof setting.setting_value === 'object' ? (
          <Textarea
            value={value}
            onChange={(e) => setEditedSettings(prev => ({ ...prev, [setting.id]: e.target.value }))}
            className="font-mono text-sm"
            rows={4}
          />
        ) : (
          <Input
            value={value.replace(/^"|"$/g, '')}
            onChange={(e) => setEditedSettings(prev => ({ ...prev, [setting.id]: `"${e.target.value}"` }))}
          />
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Site Settings
          </CardTitle>
          <CardDescription>Configure SEO, analytics, and general site settings</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Setting
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Setting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={newSetting.setting_category || ''}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, setting_category: e.target.value }))}
                  placeholder="e.g., seo, analytics, general"
                />
              </div>
              <div className="space-y-2">
                <Label>Key</Label>
                <Input
                  value={newSetting.setting_key || ''}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, setting_key: e.target.value }))}
                  placeholder="e.g., meta_title"
                />
              </div>
              <div className="space-y-2">
                <Label>Value (JSON)</Label>
                <Textarea
                  value={newSetting.setting_value as string || ''}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, setting_value: e.target.value }))}
                  placeholder='"Your value here" or {"key": "value"}'
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newSetting.description || ''}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What this setting does..."
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Public (visible to frontend)</Label>
                <Switch
                  checked={newSetting.is_public || false}
                  onCheckedChange={(checked) => setNewSetting(prev => ({ ...prev, is_public: checked }))}
                />
              </div>
              <Button className="w-full" onClick={handleAddSetting}>
                Add Setting
              </Button>
            </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="seo" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Other
            </TabsTrigger>
          </TabsList>

          {/* SEO Settings */}
          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SEO & Meta Settings</CardTitle>
                <CardDescription>Configure meta tags, keywords, and social sharing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory('seo').map(setting => (
                  <div key={setting.id}>
                    {renderSettingInput(setting)}
                  </div>
                ))}
                {getSettingsByCategory('seo').length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No SEO settings configured</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Settings */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analytics & Tracking</CardTitle>
                <CardDescription>Configure Google Analytics, Search Console, and other tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory('analytics').map(setting => (
                  <div key={setting.id}>
                    {renderSettingInput(setting)}
                  </div>
                ))}
                {getSettingsByCategory('analytics').length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No analytics settings configured</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">General Settings</CardTitle>
                <CardDescription>Configure site name, support email, and other general settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory('general').map(setting => (
                  <div key={setting.id}>
                    {renderSettingInput(setting)}
                  </div>
                ))}
                {getSettingsByCategory('general').length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No general settings configured</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Settings */}
          <TabsContent value="other" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Other Settings</CardTitle>
                <CardDescription>Miscellaneous platform settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings
                  .filter(s => !['seo', 'analytics', 'general'].includes(s.setting_category))
                  .map(setting => (
                    <div key={setting.id}>
                      {renderSettingInput(setting)}
                    </div>
                  ))}
                {settings.filter(s => !['seo', 'analytics', 'general'].includes(s.setting_category)).length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No other settings configured</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
