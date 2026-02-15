import { supabase } from '@/integrations/supabase/client';

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
  | 'activity';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  link_url?: string;
  link_text?: string;
  priority?: 'normal' | 'high';
}

export const notificationService = {
  // Create a single notification
  async create({ userId, type, title, message, data = {}, link_url, link_text, priority = 'normal' }: CreateNotificationParams) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'system', // Always use 'system' to satisfy notifications_type_check constraint
          title,
          message,
          data: { ...data, original_type: type },
          link_url,
          link_text,
          priority,
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
  async notifyProductSale(sellerId: string, productName: string, buyerName: string, amount: number, currency: string, orderId?: string) {
    return this.create({
      userId: sellerId,
      type: 'product_sale',
      title: 'New Product Sale! 🎉',
      message: `${buyerName} purchased "${productName}" for ${currency} ${amount}`,
      data: { productName, buyerName, amount, currency, orderId }
    });
  },

  // Virtual collaboration sale notification
  async notifyCollabSale(sellerId: string, collabTitle: string, buyerName: string, amount: number, currency: string, orderId?: string) {
    return this.create({
      userId: sellerId,
      type: 'virtual_collab_sale',
      title: 'Virtual Collaboration Booked! 📅',
      message: `${buyerName} booked "${collabTitle}" for ${currency} ${amount}`,
      data: { collabTitle, buyerName, amount, currency, orderId }
    });
  },

  // Meeting booking notification
  async notifyMeetingBooking(sellerId: string, meetingTitle: string, buyerName: string, eventDate?: string, orderId?: string) {
    return this.create({
      userId: sellerId,
      type: 'meeting_booking',
      title: 'New Meeting Booking! 📅',
      message: `${buyerName} booked a meeting: "${meetingTitle}"${eventDate ? ` on ${new Date(eventDate).toLocaleDateString()}` : ''}`,
      data: { meetingTitle, buyerName, eventDate, orderId }
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

  // Unfollow notification (optional - some users may want this)
  async notifyUnfollow(unfollowedUserId: string, unfollowerName: string, unfollowerId: string) {
    return this.create({
      userId: unfollowedUserId,
      type: 'unfollow',
      title: 'Lost a Follower',
      message: `${unfollowerName} unfollowed you`,
      data: { unfollowerName, unfollowerId }
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
  async notifyNewSubscription(creatorId: string, subscriberName: string, planName: string, amount?: number, currency?: string) {
    return this.create({
      userId: creatorId,
      type: 'subscription',
      title: 'New Subscriber! 🌟',
      message: `${subscriberName} subscribed to your ${planName} plan${amount ? ` for ${currency || 'INR'} ${amount}` : ''}`,
      data: { subscriberName, planName, amount, currency }
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

  // Profile visit notification (for milestones like every 10, 50, 100 visits)
  async notifyProfileVisitMilestone(userId: string, totalViews: number) {
    return this.create({
      userId,
      type: 'profile_visit',
      title: 'Profile Views Milestone! 👀',
      message: `Your profile has reached ${totalViews} views!`,
      data: { totalViews }
    });
  },

  // Product view milestone notification
  async notifyProductViewMilestone(userId: string, productName: string, totalViews: number) {
    return this.create({
      userId,
      type: 'product_view',
      title: 'Product Views Milestone! 📈',
      message: `"${productName}" has reached ${totalViews} views!`,
      data: { productName, totalViews }
    });
  },

  // Post view milestone notification
  async notifyPostViewMilestone(userId: string, postTitle: string, totalViews: number) {
    return this.create({
      userId,
      type: 'post_view',
      title: 'Post Views Milestone! 🔥',
      message: `"${postTitle}" has reached ${totalViews} views!`,
      data: { postTitle, totalViews }
    });
  },

  // Generic activity notification
  async notifyActivity(userId: string, title: string, message: string, data = {}) {
    return this.create({
      userId,
      type: 'activity',
      title,
      message,
      data
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
  async notifyMany(userIds: string[], type: NotificationType, title: string, message: string, data = {}, link_url?: string, link_text?: string) {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type,
      title,
      message,
      data,
      link_url,
      link_text,
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
  },

  // Create notification with link
  async createWithLink(
    userId: string, 
    type: NotificationType, 
    title: string, 
    message: string, 
    link_url: string, 
    link_text: string,
    priority: 'normal' | 'high' = 'normal'
  ) {
    return this.create({
      userId,
      type,
      title,
      message,
      link_url,
      link_text,
      priority
    });
  }
};
