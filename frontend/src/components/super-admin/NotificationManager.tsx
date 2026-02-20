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
  Bell, Send, Users, RefreshCw, Search, Filter,
  Trash2, Eye, Calendar, MessageSquare, Settings,
  AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

const NotificationManager = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, byType: {} });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Send notification form
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendForm, setSendForm] = useState({
    targetType: 'all',
    targetUserId: '',
    type: 'system',
    title: '',
    message: ''
  });

  const notificationTypes = [
    { value: 'system', label: 'System' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'product_sale', label: 'Product Sale' },
    { value: 'virtual_collab_sale', label: 'Collab Sale' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'token_gift', label: 'Token Gift' },
    { value: 'order_update', label: 'Order Update' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch notifications
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*, profiles:user_id(display_name, username)')
        .order('created_at', { ascending: false })
        .limit(500);

      if (notifError) throw notifError;
      setNotifications(notifData || []);

      // Calculate stats
      const total = notifData?.length || 0;
      const unread = notifData?.filter(n => !n.read).length || 0;
      const byType: Record<string, number> = {};
      notifData?.forEach(n => {
        byType[n.type] = (byType[n.type] || 0) + 1;
      });
      setStats({ total, unread, byType });

      // Fetch users for targeting
      const { data: userData } = await supabase
        .from('profiles')
        .select('id, display_name, username, email')
        .order('display_name');
      
      setUsers(userData || []);
    } catch (error) {
      console.error('Error fetching notification data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!sendForm.title || !sendForm.message) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (sendForm.targetType === 'all') {
        // Send to all users
        const notifications = users.map(user => ({
          user_id: user.id,
          type: sendForm.type,
          title: sendForm.title,
          message: sendForm.message,
          data: { sent_by: 'admin', broadcast: true },
          read: false
        }));

        const { error } = await supabase
          .from('notifications')
          .insert(notifications);

        if (error) throw error;

        toast({
          title: 'Success',
          description: `Notification sent to ${users.length} users`
        });
      } else {
        // Send to specific user
        const { error } = await supabase
          .from('notifications')
          .insert({
            user_id: sendForm.targetUserId,
            type: sendForm.type,
            title: sendForm.title,
            message: sendForm.message,
            data: { sent_by: 'admin' },
            read: false
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Notification sent successfully'
        });
      }

      setSendDialogOpen(false);
      setSendForm({ targetType: 'all', targetUserId: '', type: 'system', title: '', message: '' });
      fetchData();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== id));
      toast({ title: 'Notification deleted' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      });
    }
  };

  const handleBulkDelete = async (type: 'all' | 'read') => {
    try {
      let query = supabase.from('notifications').delete();
      
      if (type === 'read') {
        query = query.eq('read', true);
      }

      const { error } = await query;
      if (error) throw error;

      toast({ title: `${type === 'all' ? 'All' : 'Read'} notifications deleted` });
      fetchData();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notifications',
        variant: 'destructive'
      });
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = !searchQuery || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || n.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'read' && n.read) ||
      (statusFilter === 'unread' && !n.read);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Management
              </CardTitle>
              <CardDescription>
                Send, manage, and monitor notifications across the platform
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Send Notification</DialogTitle>
                    <DialogDescription>
                      Send a notification to all users or a specific user
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select 
                        value={sendForm.targetType} 
                        onValueChange={(v) => setSendForm(prev => ({ ...prev, targetType: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users ({users.length})</SelectItem>
                          <SelectItem value="specific">Specific User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {sendForm.targetType === 'specific' && (
                      <div className="space-y-2">
                        <Label>Select User</Label>
                        <Select 
                          value={sendForm.targetUserId} 
                          onValueChange={(v) => setSendForm(prev => ({ ...prev, targetUserId: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user..." />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.display_name || user.username || user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Notification Type</Label>
                      <Select 
                        value={sendForm.type} 
                        onValueChange={(v) => setSendForm(prev => ({ ...prev, type: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {notificationTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        value={sendForm.title}
                        onChange={(e) => setSendForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Notification title..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Message *</Label>
                      <Textarea
                        value={sendForm.message}
                        onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Notification message..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendNotification}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Notifications</p>
              <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Unread</p>
              <p className="text-2xl font-bold text-orange-600">{stats.unread.toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Read Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.total > 0 ? ((stats.total - stats.unread) / stats.total * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{users.length.toLocaleString()}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {notificationTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleBulkDelete('read')}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Read
            </Button>
          </div>

          {/* Notifications Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications found</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="max-w-[200px]">Title</TableHead>
                    <TableHead className="max-w-[300px]">Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.slice(0, 50).map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        {notification.read ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-orange-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {notification.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {notification.profiles?.display_name || notification.profiles?.username || 'Unknown'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm font-medium">
                        {notification.title}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                        {notification.message}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(notification.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {filteredNotifications.length > 50 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing 50 of {filteredNotifications.length} notifications
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManager;
