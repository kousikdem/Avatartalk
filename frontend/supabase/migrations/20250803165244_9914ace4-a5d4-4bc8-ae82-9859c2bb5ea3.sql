-- Create sample profiles linked to actual auth users for testing
-- First, let's insert some test auth users and then create their profiles

-- Create profiles for testing (these will work if auth users exist)
INSERT INTO profiles (id, username, display_name, full_name, email, bio, created_at) 
SELECT 
  gen_random_uuid() as id,
  'emily' as username,
  'Emily Johnson' as display_name,
  'Emily Rose Johnson' as full_name,
  'emily@example.com' as email,
  'Digital creator and photographer passionate about visual storytelling. Capturing moments that matter. 📸✨' as bio,
  now() as created_at
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE username = 'emily')

UNION ALL

SELECT 
  gen_random_uuid() as id,
  'alex' as username,
  'Alex Chen' as display_name,
  'Alexander Chen' as full_name,
  'alex@example.com' as email,
  'Software developer by day, musician by night. Building the future one line of code at a time. 🎵💻' as bio,
  now() as created_at
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE username = 'alex')

UNION ALL

SELECT 
  gen_random_uuid() as id,
  'sarah' as username,
  'Sarah Miller' as display_name,
  'Sarah Michelle Miller' as full_name,
  'sarah@example.com' as email,
  'Travel enthusiast and food blogger. Exploring the world one bite at a time. 🌍🍜' as bio,
  now() as created_at
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE username = 'sarah')

UNION ALL

SELECT 
  gen_random_uuid() as id,
  'john' as username,
  'John Davis' as display_name,
  'John Michael Davis' as full_name,
  'john@example.com' as email,
  'Fitness coach and motivational speaker. Helping people achieve their best selves. 💪🎯' as bio,
  now() as created_at
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE username = 'john')

UNION ALL

SELECT 
  gen_random_uuid() as id,
  'demo' as username,
  'Demo User' as display_name,
  'Demo User Profile' as full_name,
  'demo@example.com' as email,
  'This is a demo profile for testing purposes. Feel free to explore and interact! 🚀' as bio,
  now() as created_at
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE username = 'demo');