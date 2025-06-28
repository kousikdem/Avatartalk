
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { 
  Bell,
  Settings,
  CheckCheck,
  MessageSquare,
  Heart,
  UserPlus,
  Calendar,
  Clock,
  Loader2
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationsPage = () => {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'event': return <Calendar className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadNotifications = notifications.filter(notification => !notification.read);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-gray-600 mt-2">Stay updated with your latest activities</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-gray-300">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-300"
                onClick={markAllAsRead}
                disabled={unreadNotifications.length === 0}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>

          {/* Notification List */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Recent Notifications
                <Badge variant="secondary" className="ml-2">{unreadNotifications.length} Unread</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {notifications.map(notification => (
                    <motion.li
                      key={notification.id}
                      className={`flex items-start justify-between p-4 rounded-lg border transition-all ${
                        notification.read 
                          ? 'border-gray-100 hover:border-blue-300' 
                          : 'border-blue-200 bg-blue-50 hover:border-blue-300'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                          <p className="text-gray-700 text-sm mt-1">{notification.message}</p>
                          <div className="flex items-center text-gray-500 text-sm mt-2">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{getTimeAgo(notification.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Checkbox 
                        id={`notification-${notification.id}`}
                        checked={notification.read}
                        onCheckedChange={() => markAsRead(notification.id)}
                        className="ml-4"
                      />
                    </motion.li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationsPage;
