import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
  link_url?: string;
  link_text?: string;
  icon?: string;
  priority?: string;
  expires_at?: string;
}

export type NotificationType = 
  | 'product_sale'
  | 'virtual_collab_sale'
  | 'meeting_booking'
  | 'post_like'
  | 'post_comment'
  | 'follow'
  | 'unfollow'
  | 'message'
  | 'subscription'
  | 'token_gift'
  | 'order_update'
  | 'system'
  | 'promotion'
  | 'reminder'
  | 'profile_visit'
  | 'product_view'
  | 'post_view'
  | 'activity'
  | 'announcement'
  | 'feature';

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Filter out expired notifications
      const notificationData = (data || []).filter((n: any) => 
        !n.expires_at || new Date(n.expires_at) > new Date()
      ) as Notification[];
      
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', targetUserId)
        .eq('read', false);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', targetUserId);

      if (error) throw error;
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchNotifications();

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return;

      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${targetUserId}`
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast for new notification
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${targetUserId}`
          },
          (payload) => {
            const updatedNotification = payload.new as Notification;
            setNotifications(prev =>
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            );
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${targetUserId}`
          },
          (payload) => {
            const deletedId = (payload.old as any).id;
            setNotifications(prev => prev.filter(n => n.id !== deletedId));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [userId, fetchNotifications, toast]);

  // Filter helpers
  const getNotificationsByType = useCallback((type: NotificationType | NotificationType[]) => {
    const types = Array.isArray(type) ? type : [type];
    return notifications.filter(n => types.includes(n.type as NotificationType));
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  const getSalesNotifications = useCallback(() => {
    return notifications.filter(n => ['product_sale', 'virtual_collab_sale', 'subscription', 'meeting_booking'].includes(n.type));
  }, [notifications]);

  const getActivityNotifications = useCallback(() => {
    return notifications.filter(n => ['post_like', 'post_comment', 'follow', 'unfollow', 'profile_visit', 'product_view', 'post_view', 'activity'].includes(n.type));
  }, [notifications]);

  const getMessageNotifications = useCallback(() => {
    return notifications.filter(n => n.type === 'message');
  }, [notifications]);

  const getViewNotifications = useCallback(() => {
    return notifications.filter(n => ['profile_visit', 'product_view', 'post_view'].includes(n.type));
  }, [notifications]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refetch: fetchNotifications,
    getNotificationsByType,
    getUnreadNotifications,
    getSalesNotifications,
    getActivityNotifications,
    getMessageNotifications,
    getViewNotifications
  };
};
