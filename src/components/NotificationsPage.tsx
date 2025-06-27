
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Bell,
  Check,
  X,
  MessageSquare,
  UserPlus,
  Heart,
  Share2,
  Calendar,
  DollarSign,
  Settings,
  Filter,
  Search,
  Trash2,
  Eye,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'follow' | 'like' | 'share' | 'meeting' | 'payment' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
  actionRequired?: boolean;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'message',
      title: 'New message from Sarah',
      description: 'Hey! I wanted to discuss the project timeline with you.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '2',
      type: 'follow',
      title: 'New follower',
      description: 'John Smith started following you',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '3',
      type: 'like',
      title: 'Post liked',
      description: 'Your post "AI in Modern Business" received 12 new likes',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true
    },
    {
      id: '4',
      type: 'meeting',
      title: 'Meeting reminder',
      description: 'Product Strategy Meeting starts in 30 minutes',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: false,
      actionRequired: true
    },
    {
      id: '5',
      type: 'payment',
      title: 'Payment received',
      description: 'You received $150 from client consultation',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    messages: true,
    follows: true,
    likes: false,
    meetings: true,
    payments: true,
    system: true,
    email: true,
    push: true,
    sound: true
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'share': return <Share2 className="w-5 h-5 text-purple-500" />;
      case 'meeting': return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'payment': return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-gray-600 mt-2">Stay updated with your latest activities</p>
            </div>
            <div className="flex items-center space-x-4">
              {unreadCount > 0 && (
                <Badge variant="outline" className="border-red-400 text-red-600 bg-red-50">
                  {unreadCount} unread
                </Badge>
              )}
              <Button variant="outline" onClick={markAllAsRead} className="border-gray-300">
                <Check className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 border border-gray-200">
            <TabsTrigger value="all" className="data-[state=active]:gradient-button">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="data-[state=active]:gradient-button">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="important" className="data-[state=active]:gradient-button">
              Important
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:gradient-button">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* All Notifications */}
          <TabsContent value="all" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white border-2 border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800 flex items-center justify-between">
                    <span className="flex items-center">
                      <Bell className="w-5 h-5 mr-2 text-blue-500" />
                      All Notifications
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-gray-300">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-300">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all hover:border-blue-300 ${
                        !notification.read 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className={`font-medium ${!notification.read ? 'text-blue-900' : 'text-gray-800'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              {notification.actionRequired && (
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{notification.description}</p>
                            <p className="text-gray-500 text-xs mt-2">{getTimeAgo(notification.timestamp)}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(notification.id)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteNotification(notification.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Unread Notifications */}
          <TabsContent value="unread" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white border-2 border-red-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-red-500" />
                    Unread Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.filter(n => !n.read).map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 rounded-lg border bg-red-50 border-red-200 transition-all hover:border-red-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-red-900">{notification.title}</h3>
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{notification.description}</p>
                            <p className="text-gray-500 text-xs mt-2">{getTimeAgo(notification.timestamp)}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                            className="border-red-300 text-red-600 hover:bg-red-100"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteNotification(notification.id)}
                            className="border-red-300 text-red-600 hover:bg-red-100"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Important Notifications */}
          <TabsContent value="important" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white border-2 border-orange-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-orange-500" />
                    Important Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.filter(n => n.actionRequired || n.type === 'payment' || n.type === 'meeting').map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 rounded-lg border bg-orange-50 border-orange-200 transition-all hover:border-orange-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-orange-900">{notification.title}</h3>
                              {notification.actionRequired && (
                                <Badge className="bg-orange-200 text-orange-800 border-orange-300">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{notification.description}</p>
                            <p className="text-gray-500 text-xs mt-2">{getTimeAgo(notification.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white border-2 border-purple-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-800 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-purple-500" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Notification Types</h3>
                    
                    {Object.entries(notificationSettings).slice(0, 6).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-center space-x-3">
                          {getNotificationIcon(key as any)}
                          <Label className="text-gray-700 capitalize">{key}</Label>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Delivery Methods</h3>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-blue-500" />
                        <Label className="text-gray-700">Email Notifications</Label>
                      </div>
                      <Switch
                        checked={notificationSettings.email}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, email: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-green-500" />
                        <Label className="text-gray-700">Push Notifications</Label>
                      </div>
                      <Switch
                        checked={notificationSettings.push}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, push: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        {notificationSettings.sound ? (
                          <Volume2 className="w-5 h-5 text-purple-500" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-gray-500" />
                        )}
                        <Label className="text-gray-700">Sound Notifications</Label>
                      </div>
                      <Switch
                        checked={notificationSettings.sound}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, sound: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsPage;
