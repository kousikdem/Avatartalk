-- Clean up username data to remove trailing spaces and ensure consistency
UPDATE profiles 
SET username = trim(username)
WHERE username != trim(username);

-- Add a constraint to prevent future trailing spaces
CREATE OR REPLACE FUNCTION trim_username() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.username = trim(NEW.username);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically trim usernames on insert/update
DROP TRIGGER IF EXISTS trim_username_trigger ON profiles;
CREATE TRIGGER trim_username_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trim_username();