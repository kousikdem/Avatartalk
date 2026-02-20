
-- ============================================================
-- SECURITY FIX: Make storage buckets private where user content
-- (profile-pictures and thumbnails) should be served through
-- signed URLs, not publicly accessible by anyone
-- ============================================================

-- Keep profile-pictures public (needed for avatar display in public profiles)
-- but restrict who can upload - only authenticated users can upload to their own folder

-- Fix storage policies for profile-pictures bucket
-- Remove any overly permissive upload policies
DROP POLICY IF EXISTS "Anyone can upload profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Public upload to profile-pictures" ON storage.objects;

-- Only authenticated users can upload to their own user folder
CREATE POLICY "Users upload own profile pictures"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Only authenticated users can update their own profile pictures  
CREATE POLICY "Users update own profile pictures"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Only authenticated users can delete their own profile pictures
CREATE POLICY "Users delete own profile pictures"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix storage policies for thumbnails bucket
DROP POLICY IF EXISTS "Anyone can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Public upload to thumbnails" ON storage.objects;

-- Only authenticated users can upload thumbnails to their folder
CREATE POLICY "Users upload own thumbnails"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Only authenticated users can update their own thumbnails
CREATE POLICY "Users update own thumbnails"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'thumbnails'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Only authenticated users can delete their own thumbnails
CREATE POLICY "Users delete own thumbnails"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'thumbnails'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- training-documents: private bucket - restrict to owner only
DROP POLICY IF EXISTS "Users can upload training documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own training documents" ON storage.objects;

CREATE POLICY "Users manage own training documents"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'training-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'training-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- voice-recordings: private bucket - restrict to owner only
DROP POLICY IF EXISTS "Users can upload voice recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own voice recordings" ON storage.objects;

CREATE POLICY "Users manage own voice recordings"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'voice-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'voice-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
