import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 
  | 'product_sale'
  | 'virtual_collab_sale'
  | 'post_like'
  | 'post_comment'
  | 'follow'
  | 'message'
  | 'subscription'
  | 'token_gift'
  | 'order_update'
  | 'system'
  | 'promotion'
  | 'reminder';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export const notificationService = {
  // Create a single notification
  async create({ userId, type, title, message, data = {} }: CreateNotificationParams) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data,
          read: false
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  },

  // Product sale notification
  async notifyProductSale(sellerId: string, productName: string, buyerName: string, amount: number, currency: string) {
    return this.create({
      userId: sellerId,
      type: 'product_sale',
      title: 'New Product Sale! 🎉',
      message: `${buyerName} purchased "${productName}" for ${currency} ${amount}`,
      data: { productName, buyerName, amount, currency }
    });
  },

  // Virtual collaboration sale notification
  async notifyCollabSale(sellerId: string, collabTitle: string, buyerName: string, amount: number, currency: string) {
    return this.create({
      userId: sellerId,
      type: 'virtual_collab_sale',
      title: 'Virtual Collaboration Booked! 📅',
      message: `${buyerName} booked "${collabTitle}" for ${currency} ${amount}`,
      data: { collabTitle, buyerName, amount, currency }
    });
  },

  // Post like notification
  async notifyPostLike(postOwnerId: string, likerName: string, postTitle: string, postId: string) {
    return this.create({
      userId: postOwnerId,
      type: 'post_like',
      title: 'Your post got a like! ❤️',
      message: `${likerName} liked your post "${postTitle}"`,
      data: { likerName, postTitle, postId }
    });
  },

  // Post comment notification
  async notifyPostComment(postOwnerId: string, commenterName: string, postTitle: string, postId: string, commentPreview: string) {
    return this.create({
      userId: postOwnerId,
      type: 'post_comment',
      title: 'New comment on your post 💬',
      message: `${commenterName} commented on "${postTitle}": "${commentPreview.slice(0, 50)}${commentPreview.length > 50 ? '...' : ''}"`,
      data: { commenterName, postTitle, postId, commentPreview }
    });
  },

  // New follower notification
  async notifyNewFollower(followedUserId: string, followerName: string, followerId: string) {
    return this.create({
      userId: followedUserId,
      type: 'follow',
      title: 'New Follower! 👋',
      message: `${followerName} started following you`,
      data: { followerName, followerId }
    });
  },

  // New message notification
  async notifyNewMessage(receiverId: string, senderName: string, messagePreview: string, conversationId: string) {
    return this.create({
      userId: receiverId,
      type: 'message',
      title: 'New Message 💬',
      message: `${senderName}: "${messagePreview.slice(0, 50)}${messagePreview.length > 50 ? '...' : ''}"`,
      data: { senderName, messagePreview, conversationId }
    });
  },

  // New subscription notification
  async notifyNewSubscription(creatorId: string, subscriberName: string, planName: string) {
    return this.create({
      userId: creatorId,
      type: 'subscription',
      title: 'New Subscriber! 🌟',
      message: `${subscriberName} subscribed to your ${planName} plan`,
      data: { subscriberName, planName }
    });
  },

  // Token gift notification
  async notifyTokenGift(receiverId: string, senderName: string, amount: number) {
    return this.create({
      userId: receiverId,
      type: 'token_gift',
      title: 'You received tokens! 🎁',
      message: `${senderName} gifted you ${amount.toLocaleString()} tokens`,
      data: { senderName, amount }
    });
  },

  // Order update notification
  async notifyOrderUpdate(buyerId: string, productName: string, status: string, orderId: string) {
    return this.create({
      userId: buyerId,
      type: 'order_update',
      title: `Order Update: ${status}`,
      message: `Your order for "${productName}" is now ${status}`,
      data: { productName, status, orderId }
    });
  },

  // System notification
  async notifySystem(userId: string, title: string, message: string, data = {}) {
    return this.create({
      userId,
      type: 'system',
      title,
      message,
      data
    });
  },

  // Promotion notification
  async notifyPromotion(userId: string, promoTitle: string, promoDescription: string, promoCode?: string) {
    return this.create({
      userId,
      type: 'promotion',
      title: `🎊 ${promoTitle}`,
      message: promoDescription,
      data: { promoCode }
    });
  },

  // Reminder notification
  async notifyReminder(userId: string, reminderTitle: string, reminderMessage: string, eventId?: string) {
    return this.create({
      userId,
      type: 'reminder',
      title: `⏰ ${reminderTitle}`,
      message: reminderMessage,
      data: { eventId }
    });
  },

  // Bulk notification to multiple users
  async notifyMany(userIds: string[], type: NotificationType, title: string, message: string, data = {}) {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type,
      title,
      message,
      data,
      read: false
    }));

    try {
      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      return false;
    }
  }
};
