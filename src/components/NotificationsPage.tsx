
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
        return 'bg-blue-100 text-blue-800';
      case 'follow':
        return 'bg-green-100 text-green-800';
      case 'like':
        return 'bg-red-100 text-red-800';
      case 'appointment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bell className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardContent className="p-0">
                {allNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {allNotifications.map((notification) => {
                      const NotificationIcon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                              <NotificationIcon className="w-4 h-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">
                                  {notification.title}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                  </span>
                                  {!notification.read && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600 mt-1">{notification.message}</p>
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

          <TabsContent value="unread" className="mt-6">
            <Card>
              <CardContent className="p-0">
                {allNotifications.filter(n => !n.read).length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500">All notifications read!</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {allNotifications.filter(n => !n.read).map((notification) => {
                      const NotificationIcon = getNotificationIcon(notification.type);
                      return (
                        <div key={notification.id} className="p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
                          <div className="flex items-start space-x-4">
                            <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                              <NotificationIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">{notification.title}</h3>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-gray-600 mt-1">{notification.message}</p>
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

          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {allNotifications.filter(n => n.type === 'message').map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-gray-600">{notification.message}</p>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {allNotifications.filter(n => ['follow', 'like', 'appointment'].includes(n.type)).map((notification) => {
                    const NotificationIcon = getNotificationIcon(notification.type);
                    return (
                      <div key={notification.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                            <NotificationIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{notification.title}</h3>
                            <p className="text-gray-600">{notification.message}</p>
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsPage;
