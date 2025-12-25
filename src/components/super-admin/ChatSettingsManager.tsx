import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Gift, 
  Users, 
  RefreshCw, 
  Save,
  Coins,
  Settings2
} from 'lucide-react';
import { useSuperAdmin, AILimit } from '@/hooks/useSuperAdmin';
import { useToast } from '@/hooks/use-toast';

const ChatSettingsManager: React.FC = () => {
  const { aiLimits, updateAILimit, refetch } = useSuperAdmin();
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  const findLimit = (key: string): AILimit | undefined => {
    return aiLimits.find(l => l.limit_key === key);
  };

  const updateLimit = async (key: string, value: Record<string, any>) => {
    const limit = findLimit(key);
    if (!limit) return;
    
    setSaving(key);
    await updateAILimit(limit.id, value);
    setSaving(null);
  };

  const freeMessagesLimit = findLimit('default_free_messages_per_day');
  const giftPopupLimit = findLimit('gift_popup_after_messages');
  const oneOnOneFreeLimit = findLimit('enable_one_on_one_chat_free');
  const minRetainTokensLimit = findLimit('visitor_gift_minimum_tokens');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            Platform Chat Settings
          </h2>
          <p className="text-muted-foreground">
            Configure global chat and token settings for all users
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch.aiLimits()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Free Messages Per Day */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Daily Free Messages
          </CardTitle>
          <CardDescription>
            Default number of free messages visitors get per day before being prompted to gift tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              className="w-32"
              value={freeMessagesLimit?.limit_value?.limit || 5}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 5;
                updateLimit('default_free_messages_per_day', { limit: value });
              }}
              min={1}
              max={100}
            />
            <span className="text-muted-foreground">messages per visitor per day</span>
            {saving === 'default_free_messages_per_day' && (
              <Badge variant="secondary">Saving...</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gift Popup Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-500" />
            Gift Popup Trigger
          </CardTitle>
          <CardDescription>
            Show gift token popup after this many messages for first-time visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              className="w-32"
              value={giftPopupLimit?.limit_value?.limit || 3}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 3;
                updateLimit('gift_popup_after_messages', { limit: value });
              }}
              min={1}
              max={20}
            />
            <span className="text-muted-foreground">messages before gift popup</span>
            {saving === 'gift_popup_after_messages' && (
              <Badge variant="secondary">Saving...</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* One-on-One Chat Free */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            Free One-on-One Chat
          </CardTitle>
          <CardDescription>
            Make all user-to-user direct chats free (no token cost) platform-wide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Free Direct Chat</p>
              <p className="text-sm text-muted-foreground">
                When enabled, direct messages between users won't consume tokens
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={oneOnOneFreeLimit?.limit_value?.enabled || false}
                onCheckedChange={(checked) => {
                  updateLimit('enable_one_on_one_chat_free', { enabled: checked });
                }}
              />
              {saving === 'enable_one_on_one_chat_free' && (
                <Badge variant="secondary">Saving...</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Minimum Tokens to Retain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            Gift Token Limits
          </CardTitle>
          <CardDescription>
            Minimum tokens users must retain after gifting from their own balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              className="w-40"
              value={minRetainTokensLimit?.limit_value?.limit || 15000}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 15000;
                updateLimit('visitor_gift_minimum_tokens', { limit: value });
              }}
              min={0}
              max={1000000}
              step={1000}
            />
            <span className="text-muted-foreground">minimum tokens to retain after gifting</span>
            {saving === 'visitor_gift_minimum_tokens' && (
              <Badge variant="secondary">Saving...</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Users can only gift from their own tokens if they'll have at least this many tokens remaining
          </p>
        </CardContent>
      </Card>

      {/* Additional AI Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-gray-500" />
            All AI System Limits
          </CardTitle>
          <CardDescription>
            View and modify all platform-wide AI configuration settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiLimits.map((limit) => (
            <div key={limit.id} className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {limit.limit_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <Badge variant="secondary">
                  {JSON.stringify(limit.limit_value.limit || limit.limit_value.enabled || limit.limit_value)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{limit.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatSettingsManager;
