import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Bell, Send, Users, RefreshCw, Search, 
  Trash2, Calendar, Settings, Link, ExternalLink,
  CheckCircle, XCircle, Megaphone, Clock, Eye,
  MessageSquare, Heart, ShoppingCart, UserPlus, Gift
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface NotificationSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  description: string | null;
  category: string | null;
  is_active: boolean | null;
}

interface PushNotification {
  id: string;
  title: string;
  message: string;
  link_url: string | null;
  link_text: string | null;
  notification_type: string;
  target_audience: string;
  status: string;
  sent_count: number | null;
  read_count: number | null;
  click_count: number | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

const AdvancedNotificationManager = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const [pushForm, setPushForm] = useState({
    title: '',
    message: '',
    link_url: '',
    link_text: '',
    notification_type: 'announcement',
    target_audience: 'all',
    is_scheduled: false,
    scheduled_at: ''
  });

  const notificationTypes = [
    { value: 'announcement', label: 'Announcement', icon: Megaphone },
    { value: 'promotion', label: 'Promotion', icon: Gift },
    { value: 'system', label: 'System Update', icon: Settings },
    { value: 'reminder', label: 'Reminder', icon: Clock },
    { value: 'feature', label: 'New Feature', icon: CheckCircle }
  ];

  const categoryIcons: Record<string, any> = {
    activity: UserPlus,
    sales: ShoppingCart,
    messages: MessageSquare,
    tokens: Gift,
    orders: ShoppingCart,
    milestones: Eye,
    system: Settings,
    marketing: Megaphone
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch notification settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*')
        .order('category');

      if (settingsError) throw settingsError;
      setSettings((settingsData || []) as NotificationSetting[]);

      // Fetch push notifications
      const { data: pushData, error: pushError } = await supabase
        .from('push_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (pushError) throw pushError;
      setPushNotifications((pushData || []) as PushNotification[]);

      // Fetch users for targeting
      const { data: userData } = await supabase
        .from('profiles')
        .select('id, display_name, username')
        .order('display_name');
      
      setUsers(userData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (id: string, newValue: any) => {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update({ setting_value: newValue })
        .eq('id', id);

      if (error) throw error;

      setSettings(prev => prev.map(s => 
        s.id === id ? { ...s, setting_value: newValue } : s
      ));

      toast({ title: 'Setting updated' });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive'
      });
    }
  };

  const handleCreatePushNotification = async () => {
    if (!pushForm.title || !pushForm.message) {
      toast({
        title: 'Validation Error',
        description: 'Title and message are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      const { error } = await supabase
        .from('push_notifications')
        .insert({
          title: pushForm.title,
          message: pushForm.message,
          link_url: pushForm.link_url || null,
          link_text: pushForm.link_text || null,
          notification_type: pushForm.notification_type,
          target_audience: pushForm.target_audience,
          is_scheduled: pushForm.is_scheduled,
          scheduled_at: pushForm.is_scheduled && pushForm.scheduled_at ? pushForm.scheduled_at : null,
          status: pushForm.is_scheduled ? 'scheduled' : 'draft',
          created_by: user?.id
        });

      if (error) throw error;

      toast({ title: 'Push notification created' });
      setCreateDialogOpen(false);
      setPushForm({
        title: '',
        message: '',
        link_url: '',
        link_text: '',
        notification_type: 'announcement',
        target_audience: 'all',
        is_scheduled: false,
        scheduled_at: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating push notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to create push notification',
        variant: 'destructive'
      });
    }
  };

  const handleSendPushNotification = async (id: string) => {
    try {
      const pushNotif = pushNotifications.find(p => p.id === id);
      if (!pushNotif) {
        toast({ title: 'Error', description: 'Push notification not found', variant: 'destructive' });
        return;
      }

      // Fetch ALL user IDs fresh (super admin can see all profiles)
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id');

      if (usersError) throw usersError;

      if (!allUsers || allUsers.length === 0) {
        toast({ title: 'Error', description: 'No users found to send notifications to', variant: 'destructive' });
        return;
      }

      // Map notification_type to valid DB constraint values
      // DB allows: follow, like, comment, mention, system, event
      const validTypes = ['follow', 'like', 'comment', 'mention', 'system', 'event'];
      const dbType = validTypes.includes(pushNotif.notification_type) 
        ? pushNotif.notification_type 
        : 'system';

      // Create notifications for all users in batches of 100
      const notifications = allUsers.map(user => ({
        user_id: user.id,
        type: dbType,
        title: pushNotif.title,
        message: pushNotif.message,
        link_url: pushNotif.link_url,
        link_text: pushNotif.link_text,
        data: { push_notification_id: id, broadcast: true },
        read: false,
        priority: 'high' as const
      }));

      // Insert in batches to avoid payload limits
      const batchSize = 100;
      let totalSent = 0;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);
        const { error: notifError } = await supabase
          .from('notifications')
          .insert(batch);

        if (notifError) throw notifError;
        totalSent += batch.length;
      }

      // Update push notification status
      const { error: updateError } = await supabase
        .from('push_notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: totalSent
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({ title: `Notification sent to ${totalSent} users` });
      fetchData();
    } catch (error: any) {
      console.error('Error sending push notification:', error);
      toast({
        title: 'Error',
        description: `Failed to send: ${error?.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  const handleDeletePushNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('push_notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPushNotifications(prev => prev.filter(p => p.id !== id));
      toast({ title: 'Push notification deleted' });
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete',
        variant: 'destructive'
      });
    }
  };

  // Group settings by category
  const groupedSettings = settings.reduce((acc, setting) => {
    const category = setting.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, NotificationSetting[]>);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Notification Settings
          </TabsTrigger>
          <TabsTrigger value="push" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Push Notifications
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Advanced Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Configure which notifications are enabled and their delivery methods
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                Object.entries(groupedSettings).map(([category, categorySettings]) => {
                  const CategoryIcon = categoryIcons[category] || Bell;
                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold capitalize">{category}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {categorySettings.length}
                        </Badge>
                      </div>
                      <div className="grid gap-3">
                        {categorySettings.map((setting) => (
                          <div 
                            key={setting.id} 
                            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                          >
                            <div className="space-y-1">
                              <p className="font-medium text-sm">
                                {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {setting.description}
                              </p>
                            </div>
                          <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Label className="text-xs">Enabled</Label>
                                <Switch
                                  checked={setting.setting_value?.enabled ?? false}
                                  onCheckedChange={(checked) => 
                                    handleUpdateSetting(setting.id, { ...setting.setting_value, enabled: checked })
                                  }
                                />
                              </div>
                              {setting.setting_value?.realtime !== undefined && (
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs">Realtime</Label>
                                  <Switch
                                    checked={setting.setting_value?.realtime ?? false}
                                    onCheckedChange={(checked) => 
                                      handleUpdateSetting(setting.id, { ...setting.setting_value, realtime: checked })
                                    }
                                  />
                                </div>
                              )}
                              {setting.setting_value?.push !== undefined && (
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs">Push</Label>
                                  <Switch
                                    checked={setting.setting_value?.push ?? false}
                                    onCheckedChange={(checked) => 
                                      handleUpdateSetting(setting.id, { ...setting.setting_value, push: checked })
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Push Notifications Tab */}
        <TabsContent value="push" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    Push Notifications
                  </CardTitle>
                  <CardDescription>
                    Create and send custom push notifications with links
                  </CardDescription>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Create Push Notification
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create Push Notification</DialogTitle>
                      <DialogDescription>
                        Create a notification to send to all users with optional link
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Notification Type</Label>
                        <Select 
                          value={pushForm.notification_type} 
                          onValueChange={(v) => setPushForm(prev => ({ ...prev, notification_type: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {notificationTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="h-4 w-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          value={pushForm.title}
                          onChange={(e) => setPushForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Notification title..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Message *</Label>
                        <Textarea
                          value={pushForm.message}
                          onChange={(e) => setPushForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Notification message..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <Link className="h-3 w-3" />
                            Link URL (optional)
                          </Label>
                          <Input
                            value={pushForm.link_url}
                            onChange={(e) => setPushForm(prev => ({ ...prev, link_url: e.target.value }))}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Link Text (optional)</Label>
                          <Input
                            value={pushForm.link_text}
                            onChange={(e) => setPushForm(prev => ({ ...prev, link_text: e.target.value }))}
                            placeholder="Click here"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Target Audience</Label>
                        <Select 
                          value={pushForm.target_audience} 
                          onValueChange={(v) => setPushForm(prev => ({ ...prev, target_audience: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users ({users.length})</SelectItem>
                            <SelectItem value="subscribers">Subscribers Only</SelectItem>
                            <SelectItem value="active">Active Users (7d)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={pushForm.is_scheduled}
                          onCheckedChange={(checked) => 
                            setPushForm(prev => ({ ...prev, is_scheduled: checked }))
                          }
                        />
                        <Label>Schedule for later</Label>
                      </div>

                      {pushForm.is_scheduled && (
                        <div className="space-y-2">
                          <Label>Scheduled Date/Time</Label>
                          <Input
                            type="datetime-local"
                            value={pushForm.scheduled_at}
                            onChange={(e) => setPushForm(prev => ({ ...prev, scheduled_at: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePushNotification}>
                        {pushForm.is_scheduled ? 'Schedule' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : pushNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Megaphone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No push notifications created yet</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead>Stats</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pushNotifications.map((notif) => (
                        <TableRow key={notif.id}>
                          <TableCell>
                            <Badge variant={
                              notif.status === 'sent' ? 'default' :
                              notif.status === 'scheduled' ? 'secondary' :
                              notif.status === 'cancelled' ? 'destructive' : 'outline'
                            }>
                              {notif.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {notif.notification_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="font-medium truncate">{notif.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {notif.message}
                            </p>
                          </TableCell>
                          <TableCell>
                            {notif.link_url ? (
                              <a 
                                href={notif.link_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary text-xs hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {notif.link_text || 'Link'}
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1">
                              <p>Sent: {notif.sent_count}</p>
                              <p>Read: {notif.read_count}</p>
                              <p>Clicks: {notif.click_count}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {format(new Date(notif.created_at), 'MMM d, HH:mm')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {notif.status === 'draft' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleSendPushNotification(notif.id)}
                                >
                                  <Send className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePushNotification(notif.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedNotificationManager;
