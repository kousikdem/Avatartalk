import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Gift, 
  Bot, 
  Volume2, 
  Settings2, 
  Users,
  Pause,
  Play,
  Clock,
  Loader2
} from 'lucide-react';
import { useUserChatSettings } from '@/hooks/useUserChatSettings';

interface UserChatSettingsPanelProps {
  userId: string;
}

const UserChatSettingsPanel: React.FC<UserChatSettingsPanelProps> = ({ userId }) => {
  const { settings, loading, saving, updateSettings } = useUserChatSettings(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Unable to load settings. Please try again.</p>
      </div>
    );
  }

  const isPaused = settings.pause_ai_until && new Date(settings.pause_ai_until) > new Date();

  return (
    <div className="space-y-6">
      {/* Daily Chat Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Daily Chat Limits
          </CardTitle>
          <CardDescription>
            Control how many free messages visitors can send per day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Daily Limit</Label>
              <p className="text-sm text-muted-foreground">
                Limit free messages per visitor per day
              </p>
            </div>
            <Switch
              checked={settings.enable_daily_limit}
              onCheckedChange={(checked) => updateSettings({ enable_daily_limit: checked })}
              disabled={saving}
            />
          </div>

          {settings.enable_daily_limit && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Free Messages Per Day</Label>
                <Badge variant="secondary">{settings.free_messages_per_day} messages</Badge>
              </div>
              <Slider
                value={[settings.free_messages_per_day]}
                onValueChange={([value]) => updateSettings({ free_messages_per_day: value })}
                min={1}
                max={50}
                step={1}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                After this limit, visitors will be prompted to gift tokens
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gift Token Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-500" />
            Gift Token Requests
          </CardTitle>
          <CardDescription>
            Configure when and how to ask visitors to gift tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show Gift Button</Label>
              <p className="text-sm text-muted-foreground">
                Display gift button on your profile
              </p>
            </div>
            <Switch
              checked={settings.show_gift_button}
              onCheckedChange={(checked) => updateSettings({ show_gift_button: checked })}
              disabled={saving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Gift Popup</Label>
              <p className="text-sm text-muted-foreground">
                Show popup asking first-time visitors to gift tokens
              </p>
            </div>
            <Switch
              checked={settings.enable_gift_popup}
              onCheckedChange={(checked) => updateSettings({ enable_gift_popup: checked })}
              disabled={saving}
            />
          </div>

          {settings.enable_gift_popup && (
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Show Popup After</Label>
                  <Badge variant="secondary">{settings.gift_popup_after_messages} messages</Badge>
                </div>
                <Slider
                  value={[settings.gift_popup_after_messages]}
                  onValueChange={([value]) => updateSettings({ gift_popup_after_messages: value })}
                  min={1}
                  max={10}
                  step={1}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>Popup Message</Label>
                <Textarea
                  value={settings.gift_popup_message}
                  onChange={(e) => updateSettings({ gift_popup_message: e.target.value })}
                  placeholder="Enter your gift request message..."
                  rows={3}
                  disabled={saving}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* AI Response Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-500" />
            AI Response Controls
          </CardTitle>
          <CardDescription>
            Manage your AI assistant's behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>AI Responses Enabled</Label>
              <p className="text-sm text-muted-foreground">
                Allow AI to respond to visitor messages
              </p>
            </div>
            <Switch
              checked={settings.ai_responses_enabled}
              onCheckedChange={(checked) => updateSettings({ ai_responses_enabled: checked })}
              disabled={saving}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  {isPaused ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-green-500" />}
                  Pause AI Responses
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isPaused 
                    ? `AI is paused until ${new Date(settings.pause_ai_until!).toLocaleString()}`
                    : 'Temporarily stop AI from responding'
                  }
                </p>
              </div>
              {isPaused ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSettings({ pause_ai_until: null })}
                  disabled={saving}
                >
                  Resume AI
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const pauseUntil = new Date();
                      pauseUntil.setHours(pauseUntil.getHours() + 1);
                      updateSettings({ pause_ai_until: pauseUntil.toISOString() });
                    }}
                    disabled={saving}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    1 Hour
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const pauseUntil = new Date();
                      pauseUntil.setHours(pauseUntil.getHours() + 24);
                      updateSettings({ pause_ai_until: pauseUntil.toISOString() });
                    }}
                    disabled={saving}
                  >
                    24 Hours
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* One-on-One Chat Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            Direct Chat Settings
          </CardTitle>
          <CardDescription>
            Configure one-on-one chat options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Allow Direct Chat</Label>
              <p className="text-sm text-muted-foreground">
                Enable visitors to chat with you directly
              </p>
            </div>
            <Switch
              checked={settings.allow_direct_chat}
              onCheckedChange={(checked) => updateSettings({ allow_direct_chat: checked })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Free Direct Chat</Label>
              <p className="text-sm text-muted-foreground">
                Make one-on-one user chats free (no token cost)
              </p>
            </div>
            <Switch
              checked={settings.direct_chat_free}
              onCheckedChange={(checked) => updateSettings({ direct_chat_free: checked })}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-gray-500" />
            Advanced Settings
          </CardTitle>
          <CardDescription>
            Fine-tune chat behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Max Message Length</Label>
              <Badge variant="secondary">{settings.max_message_length} chars</Badge>
            </div>
            <Slider
              value={[settings.max_message_length]}
              onValueChange={([value]) => updateSettings({ max_message_length: value })}
              min={100}
              max={5000}
              step={100}
              disabled={saving}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Voice Responses
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable AI voice synthesis for responses
              </p>
            </div>
            <Switch
              checked={settings.enable_voice_responses}
              onCheckedChange={(checked) => updateSettings({ enable_voice_responses: checked })}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Rich Responses</Label>
              <p className="text-sm text-muted-foreground">
                Enable buttons, links, and formatted content in responses
              </p>
            </div>
            <Switch
              checked={settings.enable_rich_responses}
              onCheckedChange={(checked) => updateSettings({ enable_rich_responses: checked })}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserChatSettingsPanel;
