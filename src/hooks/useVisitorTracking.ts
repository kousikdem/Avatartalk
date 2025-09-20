import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseVisitorTrackingProps {
  profileId: string;
  currentUserId?: string;
  enabled?: boolean;
}

export const useVisitorTracking = ({ profileId, currentUserId, enabled = true }: UseVisitorTrackingProps) => {
  useEffect(() => {
    if (!enabled || !profileId || currentUserId === profileId) {
      return; // Don't track if disabled, no profile ID, or user is viewing their own profile
    }

    const trackVisit = async () => {
      try {
        // Check if we've already tracked this visit recently (within last hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        
        const { data: existingVisit } = await supabase
          .from('profile_visitors')
          .select('id')
          .eq('visited_profile_id', profileId)
          .eq('visitor_id', currentUserId || null)
          .gte('visited_at', oneHourAgo)
          .maybeSingle();

        if (existingVisit) {
          return; // Already tracked recently
        }

        // Track the visit
        const { error } = await supabase
          .from('profile_visitors')
          .insert({
            visitor_id: currentUserId || null,
            visited_profile_id: profileId,
            ip_address: null, // Can be populated server-side if needed
            user_agent: navigator.userAgent
          });

        if (error) {
          console.error('Error tracking visit:', error);
        }
      } catch (error) {
        console.error('Error in visitor tracking:', error);
      }
    };

    // Track visit after a short delay to avoid impacting page load performance
    const timeoutId = setTimeout(trackVisit, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [profileId, currentUserId, enabled]);
};

export default useVisitorTracking;