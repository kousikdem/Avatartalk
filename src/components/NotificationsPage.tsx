
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, CheckCheck, MessageSquare, UserPlus, Heart, Calendar, Settings } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  // Mock notifications for demonstration
  const mockNotifications = [
    {
      id: '1',
      type: 'message',
      title: 'New Message',
      message: 'Sarah sent you a message about the AI project',
      data: { userId: 'user1', messageId: 'msg1' },
      read: false,
      created_at: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: '2',
      type: 'follow',
      title: 'New Follower',
      message: 'John started following you',
      data: { userId: 'user2' },
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      type: 'like',
      title: 'Post Liked',
      message: 'Your post about AI avatars received 10 new likes',
      data: { postId: 'post1', count: 10 },
      read: true,
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '4',
      type: 'appointment',
      title: 'Upcoming Meeting',
      message: 'You have a meeting with client in 30 minutes',
      data: { eventId: 'event1' },
      read: false,
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  const allNotifications = [...notifications, ...mockNotifications];
  const unreadCount = allNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return MessageSquare;
      case 'follow':
        return UserPlus;
      case 'like':
        return Heart;
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
      case 'like':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'appointment':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-accent/20 text-accent-foreground border-accent/30';
    }
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center space-x-3">
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
        {unreadCount > 0 && (
          <Button 
            onClick={handleMarkAllAsRead} 
            variant="outline"
            className="border-border hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="unread"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            <span className="hidden sm:inline">Unread</span>
            <span className="sm:hidden">New</span>
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="messages"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            Messages
          </TabsTrigger>
          <TabsTrigger 
            value="activity"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              {allNotifications.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No notifications yet</h3>
                  <p className="text-muted-foreground">When you get notifications, they'll show up here</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {allNotifications.map((notification) => {
                    const NotificationIcon = getNotificationIcon(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 sm:p-6 hover:bg-accent/30 transition-colors ${
                          !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-2.5 rounded-full border ${getNotificationColor(notification.type)}`}>
                            <NotificationIcon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <h3 className="font-medium text-foreground">
                                {notification.title}
                              </h3>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="hover:bg-accent hover:text-accent-foreground p-2 h-8 w-8"
                                  >
                                    <Check className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-0">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              {allNotifications.filter(n => !n.read).length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">You've read all your notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {allNotifications.filter(n => !n.read).map((notification) => {
                    const NotificationIcon = getNotificationIcon(notification.type);
                    return (
                      <div key={notification.id} className="p-4 sm:p-6 bg-primary/5 border-l-4 border-l-primary hover:bg-primary/10 transition-colors">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2.5 rounded-full border ${getNotificationColor(notification.type)}`}>
                            <NotificationIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <h3 className="font-medium text-foreground">{notification.title}</h3>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="hover:bg-accent hover:text-accent-foreground self-start sm:self-center"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Mark as Read
                              </Button>
                            </div>
                            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{notification.message}</p>
                            <span className="text-xs text-muted-foreground mt-2 block">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-0">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {allNotifications.filter(n => n.type === 'message').length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No messages</h3>
                    <p className="text-muted-foreground">Your message notifications will appear here</p>
                  </div>
                ) : (
                  allNotifications.filter(n => n.type === 'message').map((notification) => (
                    <div key={notification.id} className="p-4 sm:p-6 hover:bg-accent/30 transition-colors">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback className="bg-primary/10 text-primary">U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <h3 className="font-medium text-foreground">{notification.title}</h3>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{notification.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {allNotifications.filter(n => ['follow', 'like', 'appointment'].includes(n.type)).length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No activity</h3>
                    <p className="text-muted-foreground">Your activity notifications will appear here</p>
                  </div>
                ) : (
                  allNotifications.filter(n => ['follow', 'like', 'appointment'].includes(n.type)).map((notification) => {
                    const NotificationIcon = getNotificationIcon(notification.type);
                    return (
                      <div key={notification.id} className="p-4 sm:p-6 hover:bg-accent/30 transition-colors">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2.5 rounded-full border ${getNotificationColor(notification.type)}`}>
                            <NotificationIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <h3 className="font-medium text-foreground">{notification.title}</h3>
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{notification.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
