
-- Add a column to store multiple gallery images for a brand
ALTER TABLE public.brands
ADD COLUMN gallery_images TEXT[] NULL;

-- Create a storage bucket for brand logos and gallery images with a 5MB file size limit
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('brand-assets', 'brand-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- RLS for brand-assets bucket
-- Allow public, unauthenticated read access to all files.
CREATE POLICY "Public Read Access for Brand Assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'brand-assets');

-- Allow authenticated users to upload files.
-- The frontend logic will restrict uploads to the user's own brand folder.
CREATE POLICY "Authenticated users can upload brand assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'brand-assets');

