-- Add missing storage policies for compressed file uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload compressed files'
  ) THEN
    CREATE POLICY "Users can upload compressed files"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
      bucket_id = 'thumbnails' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their compressed files'
  ) THEN
    CREATE POLICY "Users can update their compressed files"
    ON storage.objects
    FOR UPDATE
    USING (
      bucket_id = 'thumbnails' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;