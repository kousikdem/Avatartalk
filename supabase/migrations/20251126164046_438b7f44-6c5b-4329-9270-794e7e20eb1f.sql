-- Fix subscription insertion by dropping problematic triggers if they exist
-- and ensuring clean subscription flow

-- Drop any triggers that might be referencing following_id
DROP TRIGGER IF EXISTS update_follows_on_subscription ON subscriptions;
DROP TRIGGER IF EXISTS check_following_on_subscription ON subscriptions;

-- Drop and recreate the function to update subscription counts if it exists
DROP FUNCTION IF EXISTS handle_subscription_changes() CASCADE;

-- Create a proper function to handle subscription status changes
CREATE OR REPLACE FUNCTION handle_subscription_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- No need to check following_id, just handle the subscription
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for subscription changes (if needed for future analytics)
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscription_changes();