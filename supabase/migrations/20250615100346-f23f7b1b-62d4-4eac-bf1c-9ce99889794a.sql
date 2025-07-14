
-- Create a table to store food pairings for products
CREATE TABLE public.food_pairings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security policies for the food_pairings table
ALTER TABLE public.food_pairings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view food pairings" ON public.food_pairings FOR SELECT USING (true);
CREATE POLICY "Brand users can insert food pairings for their products" ON public.food_pairings FOR INSERT WITH CHECK (auth.uid() IN (SELECT b.user_id FROM public.brands b JOIN public.products p ON b.id = p.brand_id WHERE p.id = product_id));
CREATE POLICY "Brand users can update food pairings for their products" ON public.food_pairings FOR UPDATE USING (auth.uid() IN (SELECT b.user_id FROM public.brands b JOIN public.products p ON b.id = p.brand_id WHERE p.id = product_id));
CREATE POLICY "Brand users can delete food pairings for their products" ON public.food_pairings FOR DELETE USING (auth.uid() IN (SELECT b.user_id FROM public.brands b JOIN public.products p ON b.id = p.brand_id WHERE p.id = product_id));

-- Create a table to store awards and certifications for products
CREATE TABLE public.product_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year INT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security policies for the product_awards table
ALTER TABLE public.product_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view product awards" ON public.product_awards FOR SELECT USING (true);
CREATE POLICY "Brand users can insert awards for their products" ON public.product_awards FOR INSERT WITH CHECK (auth.uid() IN (SELECT b.user_id FROM public.brands b JOIN public.products p ON b.id = p.brand_id WHERE p.id = product_id));
CREATE POLICY "Brand users can update awards for their products" ON public.product_awards FOR UPDATE USING (auth.uid() IN (SELECT b.user_id FROM public.brands b JOIN public.products p ON b.id = p.brand_id WHERE p.id = product_id));
CREATE POLICY "Brand users can delete awards for their products" ON public.product_awards FOR DELETE USING (auth.uid() IN (SELECT b.user_id FROM public.brands b JOIN public.products p ON b.id = p.brand_id WHERE p.id = product_id));

-- Add columns for tags to the products table
ALTER TABLE public.products
ADD COLUMN is_alcohol_free BOOLEAN DEFAULT false,
ADD COLUMN is_gluten_free BOOLEAN DEFAULT false;

-- Add a column for the 'women-owned' tag to the brands table
ALTER TABLE public.brands
ADD COLUMN is_women_owned BOOLEAN DEFAULT false;

-- Create a new storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Add policies for accessing the product images bucket
CREATE POLICY "Product images are publicly viewable"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'product-images' );

CREATE POLICY "Brand users can update their own uploaded images"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner AND bucket_id = 'product-images' );

CREATE POLICY "Brand users can delete their own uploaded images"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner AND bucket_id = 'product-images' );
