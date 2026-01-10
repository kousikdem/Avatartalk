import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, 
  UserPlus, 
  Heart, 
  ShoppingCart, 
  Calendar,
  Gift,
  Star,
  Package,
  Megaphone,
  Clock,
  Settings
} from 'lucide-react';

interface NotificationBellProps {
  variant?: 'light' | 'dark';
  compact?: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  variant = 'light',
  compact = false 
}) => {
  const { notifications, unreadCount, markAsRead, loading } = useNotifications();
  const navigate = useNavigate();

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
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 text-blue-700';
      case 'follow':
        return 'bg-green-100 text-green-700';
      case 'post_like':
      case 'like':
        return 'bg-red-100 text-red-700';
      case 'post_comment':
        return 'bg-indigo-100 text-indigo-700';
      case 'product_sale':
      case 'virtual_collab_sale':
        return 'bg-emerald-100 text-emerald-700';
      case 'subscription':
        return 'bg-amber-100 text-amber-700';
      case 'token_gift':
        return 'bg-purple-100 text-purple-700';
      case 'order_update':
        return 'bg-cyan-100 text-cyan-700';
      case 'promotion':
        return 'bg-pink-100 text-pink-700';
      case 'reminder':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.data?.postId) {
      navigate(`/settings/feed`);
    } else if (notification.data?.followerId) {
      navigate(`/settings/followers`);
    } else if (notification.data?.conversationId) {
      navigate(`/settings/chat`);
    } else if (notification.data?.orderId) {
      navigate(`/settings/orders`);
    } else {
      navigate('/settings/notifications');
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  const buttonClass = variant === 'dark' 
    ? 'text-blue-200 hover:text-white hover:bg-blue-800/50' 
    : 'text-gray-700 hover:bg-gray-100';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? 'sm' : 'icon'}
          className={`relative ${buttonClass} ${compact ? 'h-7 w-7 p-0' : 'h-8 w-8'}`}
        >
          <Bell className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] border-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-accent/50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className={`p-1.5 rounded-full ${getNotificationColor(notification.type)}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => navigate('/settings/notifications')}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
