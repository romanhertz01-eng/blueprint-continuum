-- Policy: Allow public to read files (simulating public reading for a private bucket via RLS)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts' AND auth.uid() = owner);

-- Policy: Allow authors to update/delete their files
CREATE POLICY "Owner Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'posts' AND auth.uid() = owner);

CREATE POLICY "Owner Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'posts' AND auth.uid() = owner);

-- File size limit trigger (50MB = 52428800 bytes)
-- Created in public schema per guidelines
CREATE OR REPLACE FUNCTION public.check_posts_file_size()
RETURNS trigger AS $$
BEGIN
  IF NEW.bucket_id = 'posts' AND (NEW.metadata->>'size')::bigint > 52428800 THEN
    RAISE EXCEPTION 'File size exceeds 50MB limit';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_file_size_limit
BEFORE INSERT ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION public.check_posts_file_size();
