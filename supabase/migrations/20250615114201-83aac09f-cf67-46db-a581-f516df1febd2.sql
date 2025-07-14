
-- Create a new storage bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access to product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Product images public select'
    AND polrelid = 'storage.objects'::regclass
  ) THEN
    CREATE POLICY "Product images public select"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');
  END IF;
END;
$$;

-- Create policy for authenticated users to upload images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Product images authenticated insert'
    AND polrelid = 'storage.objects'::regclass
  ) THEN
    CREATE POLICY "Product images authenticated insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images');
  END IF;
END;
$$;

-- Create policy for authenticated users to update their own images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Product images authenticated update'
    AND polrelid = 'storage.objects'::regclass
  ) THEN
    CREATE POLICY "Product images authenticated update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner);
  END IF;
END;
$$;

-- Create policy for authenticated users to delete their own images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policy
    WHERE polname = 'Product images authenticated delete'
    AND polrelid = 'storage.objects'::regclass
  ) THEN
    CREATE POLICY "Product images authenticated delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (auth.uid() = owner);
  END IF;
END;
$$;
