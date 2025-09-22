/*
  # Create documents storage bucket

  1. Storage Bucket
    - Create 'documents' bucket for file uploads
    - Allow PDF, PNG, JPG file types
    - Set up proper security policies

  2. Security
    - Users can upload files to their agency's folder
    - Users can view files from their agency
    - Files are organized by agency_id/carer_id structure
*/

-- Create the documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Allow authenticated users to upload files to their agency folder
CREATE POLICY "Users can upload documents to their agency folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT agency_id::text 
    FROM agency_members 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to view files from their agency
CREATE POLICY "Users can view documents from their agency"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT agency_id::text 
    FROM agency_members 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to update files in their agency folder
CREATE POLICY "Users can update documents in their agency folder"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT agency_id::text 
    FROM agency_members 
    WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to delete files from their agency folder
CREATE POLICY "Users can delete documents from their agency folder"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT agency_id::text 
    FROM agency_members 
    WHERE user_id = auth.uid()
  )
);

-- Super admins can access all documents
CREATE POLICY "Super admins can access all documents"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND is_super_admin = true
  )
);