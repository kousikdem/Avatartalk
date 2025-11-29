-- Enable full row tracking for avatar_configurations real-time updates
-- This ensures all column changes are captured for instant sync

ALTER TABLE avatar_configurations REPLICA IDENTITY FULL;