-- Drop conflicting triggers that use update_user_stats on follows table
DROP TRIGGER IF EXISTS update_stats_on_follow ON follows;
DROP TRIGGER IF EXISTS update_user_stats_on_follow ON follows;

-- Drop redundant follower count triggers (we're using update_follow_counts_trigger now)
DROP TRIGGER IF EXISTS update_follower_counts_trigger ON follows;
DROP TRIGGER IF EXISTS update_profile_counts_on_follow ON follows;

-- Keep only the new trigger and analytics trigger
-- update_follow_counts_trigger - handles follower/following counts
-- track_follower_analytics - tracks daily analytics

-- Verify the remaining triggers are correct
-- The update_follow_counts_trigger should be the only one updating counts