import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notificationService } from '@/utils/notificationService';

interface ViewTrackingOptions {
  type: 'profile' | 'product' | 'post';
  targetId: string;
  viewerId?: string | null;
  ownerId?: string | null; // The owner of the content being viewed
  contentTitle?: string; // Title of the product or post
  delaySeconds?: number;
}

// Milestones for view notifications
const VIEW_MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000];

const shouldNotifyMilestone = (newCount: number): boolean => {
  return VIEW_MILESTONES.includes(newCount);
};

/**
 * Hook to track views with a minimum duration requirement (default 3 seconds)
 * Only counts as a view if user stays on the item for the specified duration
 */
export const useViewTracking = ({
  type,
  targetId,
  viewerId,
  ownerId,
  contentTitle,
  delaySeconds = 3
}: ViewTrackingOptions) => {
  const viewRecordedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const recordView = useCallback(async () => {
    if (viewRecordedRef.current || !targetId) return;

    try {
      viewRecordedRef.current = true;

      if (type === 'profile') {
        // Don't track own profile views
        if (viewerId === targetId) return;

        // Insert into profile_visitors table
        await supabase.from('profile_visitors').insert({
          visitor_id: viewerId || null,
          visited_profile_id: targetId,
        });

        // Also increment user_stats profile_views
        const { data: currentStats } = await supabase
          .from('user_stats')
          .select('profile_views')
          .eq('user_id', targetId)
          .single();

        const newViews = (currentStats?.profile_views || 0) + 1;

        await supabase
          .from('user_stats')
          .upsert({
            user_id: targetId,
            profile_views: newViews
          });

        // Send milestone notification if applicable
        if (shouldNotifyMilestone(newViews)) {
          await notificationService.notifyProfileVisitMilestone(targetId, newViews);
        }

      } else if (type === 'product') {
        // Increment product views_count
        const { data: product } = await supabase
          .from('products')
          .select('views_count, title, user_id')
          .eq('id', targetId)
          .single();

        if (product) {
          const newViewsCount = (product.views_count || 0) + 1;
          
          await supabase
            .from('products')
            .update({ views_count: newViewsCount })
            .eq('id', targetId);

          // Send milestone notification if applicable
          if (shouldNotifyMilestone(newViewsCount) && product.user_id) {
            await notificationService.notifyProductViewMilestone(
              product.user_id,
              product.title || 'Your product',
              newViewsCount
            );
          }
        }

      } else if (type === 'post') {
        // Increment post views_count
        const { data: post } = await supabase
          .from('posts')
          .select('views_count, title, user_id')
          .eq('id', targetId)
          .single();

        if (post) {
          const newViewsCount = (post.views_count || 0) + 1;
          
          await supabase
            .from('posts')
            .update({ views_count: newViewsCount })
            .eq('id', targetId);

          // Send milestone notification if applicable
          if (shouldNotifyMilestone(newViewsCount) && post.user_id) {
            await notificationService.notifyPostViewMilestone(
              post.user_id,
              post.title || 'Your post',
              newViewsCount
            );
          }
        }
      }

      console.log(`[ViewTracking] Recorded ${type} view for ${targetId}`);
    } catch (error) {
      console.error(`[ViewTracking] Error recording ${type} view:`, error);
      // Reset so it can be retried
      viewRecordedRef.current = false;
    }
  }, [type, targetId, viewerId, ownerId, contentTitle]);

  useEffect(() => {
    // Reset when target changes
    viewRecordedRef.current = false;

    if (!targetId) return;

    // Start timer for delayed view recording
    timerRef.current = setTimeout(() => {
      recordView();
    }, delaySeconds * 1000);

    return () => {
      // Clear timer on unmount or target change
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [targetId, delaySeconds, recordView]);

  return {
    viewRecorded: viewRecordedRef.current
  };
};

export default useViewTracking;
