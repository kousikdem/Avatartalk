-- Add some sample profiles for testing
INSERT INTO profiles (id, username, display_name, full_name, email, bio, created_at) VALUES
(gen_random_uuid(), 'emily', 'Emily Johnson', 'Emily Rose Johnson', 'emily@example.com', 'Digital creator and photographer passionate about visual storytelling. Capturing moments that matter. 📸✨', now()),
(gen_random_uuid(), 'alex', 'Alex Chen', 'Alexander Chen', 'alex@example.com', 'Software developer by day, musician by night. Building the future one line of code at a time. 🎵💻', now()),
(gen_random_uuid(), 'sarah', 'Sarah Miller', 'Sarah Michelle Miller', 'sarah@example.com', 'Travel enthusiast and food blogger. Exploring the world one bite at a time. 🌍🍜', now()),
(gen_random_uuid(), 'john', 'John Davis', 'John Michael Davis', 'john@example.com', 'Fitness coach and motivational speaker. Helping people achieve their best selves. 💪🎯', now()),
(gen_random_uuid(), 'demo', 'Demo User', 'Demo User Profile', 'demo@example.com', 'This is a demo profile for testing purposes. Feel free to explore and interact! 🚀', now())
ON CONFLICT (username) DO NOTHING;