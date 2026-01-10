import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Bell, Check, CheckCheck, MessageSquare, UserPlus, Heart, Calendar, 
  Settings, Trash2, Search, ShoppingCart, Gift, Star, Package, 
  Megaphone, Clock, Filter, X
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const NotificationsPage = () => {
  const { 
    notifications, 
    loading, 
    unreadCount,
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getSalesNotifications,
    getActivityNotifications,
    getMessageNotifications
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return MessageSquare;
      case 'follow':
        return UserPlus;
      case 'post_like':
      case 'like':
        return Heart;
      case 'post_comment':
        return MessageSquare;
      case 'product_sale':
        return ShoppingCart;
      case 'virtual_collab_sale':
        return Calendar;
      case 'subscription':
        return Star;
      case 'token_gift':
        return Gift;
      case 'order_update':
        return Package;
      case 'promotion':
        return Megaphone;
      case 'reminder':
        return Clock;
      case 'system':
        return Settings;
      case 'appointment':
        return Calendar;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'follow':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'post_like':
      case 'like':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'post_comment':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'product_sale':
      case 'virtual_collab_sale':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'subscription':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'token_gift':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'order_update':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'promotion':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'reminder':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'appointment':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product_sale':
        return 'Product Sale';
      case 'virtual_collab_sale':
        return 'Collab Sale';
      case 'post_like':
        return 'Like';
      case 'post_comment':
        return 'Comment';
      case 'follow':
        return 'Follower';
      case 'message':
        return 'Message';
      case 'subscription':
        return 'Subscription';
      case 'token_gift':
        return 'Token Gift';
      case 'order_update':
        return 'Order';
      case 'system':
        return 'System';
      case 'promotion':
        return 'Promotion';
      case 'reminder':
        return 'Reminder';
      default:
        return type;
    }
  };

  // Filter notifications based on search and filters
  const filterNotifications = (notifs: typeof notifications) => {
    let filtered = notifs;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.message.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(n => new Date(n.created_at) >= filterDate);
    }

    return filtered;
  };

  const allFilteredNotifications = filterNotifications(notifications);
  const unreadNotifications = filterNotifications(notifications.filter(n => !n.read));
  const salesNotifications = filterNotifications(getSalesNotifications());
  const activityNotifications = filterNotifications(getActivityNotifications());
  const messageNotifications = filterNotifications(getMessageNotifications());

  const renderNotificationList = (notifs: typeof notifications, emptyMessage: string, emptyIcon: React.ReactNode) => {
    if (loading) {
      return (
        <div className="text-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      );
    }

    if (notifs.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
            {emptyIcon}
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">{emptyMessage}</h3>
          <p className="text-muted-foreground">Notifications will appear here when you receive them</p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-border">
        {notifs.map((notification) => {
          const NotificationIcon = getNotificationIcon(notification.type);
          return (
            <div
              key={notification.id}
              className={`p-4 sm:p-6 hover:bg-accent/30 transition-colors ${
                !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-full border ${getNotificationColor(notification.type)}`}>
                  <NotificationIcon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">
                        {notification.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(notification.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          className="hover:bg-accent hover:text-accent-foreground p-2 h-8 w-8"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                        className="hover:bg-destructive/10 hover:text-destructive p-2 h-8 w-8"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{notification.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead} 
              variant="outline"
              size="sm"
              className="border-border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your notifications. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllNotifications} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="product_sale">Product Sales</SelectItem>
            <SelectItem value="virtual_collab_sale">Collab Sales</SelectItem>
            <SelectItem value="post_like">Post Likes</SelectItem>
            <SelectItem value="post_comment">Comments</SelectItem>
            <SelectItem value="follow">Followers</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
            <SelectItem value="subscription">Subscriptions</SelectItem>
            <SelectItem value="token_gift">Token Gifts</SelectItem>
            <SelectItem value="order_update">Order Updates</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <Clock className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            All
            <Badge className="ml-2 text-xs px-1.5 py-0.5" variant="secondary">
              {allFilteredNotifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="unread"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            Unread
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="sales"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            <span className="hidden sm:inline">Sales</span>
            <span className="sm:hidden">💰</span>
            <Badge className="ml-2 text-xs px-1.5 py-0.5" variant="secondary">
              {salesNotifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="activity"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            Activity
            <Badge className="ml-2 text-xs px-1.5 py-0.5" variant="secondary">
              {activityNotifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="messages"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            Messages
            <Badge className="ml-2 text-xs px-1.5 py-0.5" variant="secondary">
              {messageNotifications.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              {renderNotificationList(
                allFilteredNotifications, 
                'No notifications yet',
                <Bell className="w-8 h-8 text-muted-foreground" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-0">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              {renderNotificationList(
                unreadNotifications, 
                'All caught up!',
                <CheckCheck className="w-8 h-8 text-green-600" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="mt-0">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              {renderNotificationList(
                salesNotifications, 
                'No sales notifications',
                <ShoppingCart className="w-8 h-8 text-emerald-600" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              {renderNotificationList(
                activityNotifications, 
                'No activity notifications',
                <Heart className="w-8 h-8 text-red-600" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-0">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              {renderNotificationList(
                messageNotifications, 
                'No message notifications',
                <MessageSquare className="w-8 h-8 text-blue-600" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
