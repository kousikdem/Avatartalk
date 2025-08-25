-- Create storage buckets for training documents and voice recordings
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('training-documents', 'training-documents', false),
  ('voice-recordings', 'voice-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for training documents bucket
CREATE POLICY "Users can upload their own training documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'training-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own training documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'training-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own training documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'training-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own training documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'training-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for voice recordings bucket
CREATE POLICY "Users can upload their own voice recordings" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'voice-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own voice recordings" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'voice-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own voice recordings" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'voice-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own voice recordings" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'voice-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);