import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Trash2, Activity } from 'lucide-react';
import { Integration } from '@/hooks/useIntegrations';

interface IntegrationSettingsProps {
  provider: {
    id: string;
    name: string;
  };
  integration: Integration;
  onUpdateSettings: (integrationId: string, settings: any) => Promise<void>;
  onDisconnect: () => Promise<void>;
  loading: boolean;
}

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({
  provider,
  integration,
  onUpdateSettings,
  onDisconnect,
  loading,
}) => {
  const [settings, setSettings] = useState(integration.settings?.settings_json || {});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateSettings(integration.id, settings);
    } finally {
      setSaving(false);
    }
  };

  const renderProviderSettings = () => {
    switch (provider.id) {
      case 'zoom':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="meeting-duration">Default Meeting Duration (minutes)</Label>
              <Input
                id="meeting-duration"
                type="number"
                value={settings.meetingDuration || 30}
                onChange={(e) => setSettings({ ...settings, meetingDuration: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="passcode">Require Passcode</Label>
              <Switch
                id="passcode"
                checked={settings.requirePasscode || false}
                onCheckedChange={(checked) => setSettings({ ...settings, requirePasscode: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="waiting-room">Enable Waiting Room</Label>
              <Switch
                id="waiting-room"
                checked={settings.waitingRoom || false}
                onCheckedChange={(checked) => setSettings({ ...settings, waitingRoom: checked })}
              />
            </div>
          </div>
        );

      case 'google_meet':
      case 'microsoft_teams':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="calendar">Default Calendar</Label>
              <Input
                id="calendar"
                value={settings.defaultCalendar || ''}
                onChange={(e) => setSettings({ ...settings, defaultCalendar: e.target.value })}
                placeholder="primary"
              />
            </div>
            <div>
              <Label htmlFor="duration">Default Meeting Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={settings.duration || 30}
                onChange={(e) => setSettings({ ...settings, duration: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={settings.timezone || 'UTC'}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              />
            </div>
          </div>
        );

      case 'calendly':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="event-types">Event Types to Display</Label>
              <Textarea
                id="event-types"
                value={settings.eventTypes || ''}
                onChange={(e) => setSettings({ ...settings, eventTypes: e.target.value })}
                placeholder="Enter event type IDs (comma-separated)"
              />
            </div>
            <div>
              <Label htmlFor="intro-message">Default Intro Message</Label>
              <Textarea
                id="intro-message"
                value={settings.introMessage || ''}
                onChange={(e) => setSettings({ ...settings, introMessage: e.target.value })}
                placeholder="Enter a message for visitors booking a meeting"
              />
            </div>
          </div>
        );

      case 'google_drive':
      case 'dropbox':
      case 'onedrive':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder">Folder Path</Label>
              <Input
                id="folder"
                value={settings.folderPath || ''}
                onChange={(e) => setSettings({ ...settings, folderPath: e.target.value })}
                placeholder="/My Folder"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-show">Show on Public Profile</Label>
              <Switch
                id="auto-show"
                checked={settings.showOnProfile || false}
                onCheckedChange={(checked) => setSettings({ ...settings, showOnProfile: checked })}
              />
            </div>
            <div>
              <Label htmlFor="file-types">Allowed File Types</Label>
              <Textarea
                id="file-types"
                value={settings.allowedTypes?.join(', ') || ''}
                onChange={(e) => setSettings({ ...settings, allowedTypes: e.target.value.split(',').map(t => t.trim()) })}
                placeholder="image, pdf, video, audio"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sync">Auto-sync Changes</Label>
              <Switch
                id="sync"
                checked={settings.autoSync || false}
                onCheckedChange={(checked) => setSettings({ ...settings, autoSync: checked })}
              />
            </div>
          </div>
        );

      case 'shopify':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="shop-domain">Shop Domain</Label>
              <Input
                id="shop-domain"
                value={settings.shopDomain || ''}
                onChange={(e) => setSettings({ ...settings, shopDomain: e.target.value })}
                placeholder="your-store.myshopify.com"
              />
            </div>
            <div>
              <Label htmlFor="collections">Collections to Display</Label>
              <Textarea
                id="collections"
                value={settings.collections?.join(', ') || ''}
                onChange={(e) => setSettings({ ...settings, collections: e.target.value.split(',').map(c => c.trim()) })}
                placeholder="Collection IDs or handles (comma-separated)"
              />
            </div>
            <div>
              <Label htmlFor="product-tags">Product Tags</Label>
              <Input
                id="product-tags"
                value={settings.productTags?.join(', ') || ''}
                onChange={(e) => setSettings({ ...settings, productTags: e.target.value.split(',').map(t => t.trim()) })}
                placeholder="featured, sale"
              />
            </div>
            <div>
              <Label htmlFor="display-type">Display Type</Label>
              <Select
                value={settings.displayType || 'cart'}
                onValueChange={(value) => setSettings({ ...settings, displayType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cart">Add to Cart</SelectItem>
                  <SelectItem value="redirect">Redirect to Store</SelectItem>
                  <SelectItem value="embed">Embed Storefront</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={settings.currency || 'USD'}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            No additional settings available for this integration.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Connection Status
        </h3>
        <div className="text-sm text-muted-foreground">
          <p>Connected: {integration.connected ? 'Yes' : 'No'}</p>
          {integration.updated_at && (
            <p>Last updated: {new Date(integration.updated_at).toLocaleString()}</p>
          )}
          {integration.expires_at && (
            <p>Token expires: {new Date(integration.expires_at).toLocaleString()}</p>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Integration Settings</h3>
        {renderProviderSettings()}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Label htmlFor="enable-profile">Enable on Public Profile</Label>
        <Switch
          id="enable-profile"
          checked={settings.enableOnProfile || false}
          onCheckedChange={(checked) => setSettings({ ...settings, enableOnProfile: checked })}
        />
      </div>

      <Separator />

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Settings
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              <Trash2 className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect {provider.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the integration and delete all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDisconnect} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default IntegrationSettings;
