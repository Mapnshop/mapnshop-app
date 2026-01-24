-- Migration: 20260120210000_storage_setup.sql
-- Description: Creates storage bucket for attachments and sets up public access policies.

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Policies for the bucket
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING ( bucket_id = 'attachments' );

-- Allow authenticated uploads (users/staff)
CREATE POLICY "Authenticated Uploads" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments' AND
    auth.role() = 'authenticated'
  );

-- Allow users to delete their own uploads (optional, good for cleanup)
CREATE POLICY "Owner Delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'attachments' AND
    auth.uid() = owner
  );
