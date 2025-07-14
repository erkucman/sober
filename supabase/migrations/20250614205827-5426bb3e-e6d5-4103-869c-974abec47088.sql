
-- Drop existing policies to ensure the script can run cleanly.
DROP POLICY IF EXISTS "Public can view approved brands" ON public.brands;
DROP POLICY IF EXISTS "Brand owners can view their own brand" ON public.brands;
DROP POLICY IF EXISTS "Brand owners can update their own brand" ON public.brands;
DROP POLICY IF EXISTS "Admins can manage all brands" ON public.brands;

-- Enable Row-Level Security on the brands table, if not already enabled.
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Re-create the policies for the brands table
CREATE POLICY "Public can view approved brands" ON public.brands
FOR SELECT USING (status = 'approved');

CREATE POLICY "Brand owners can view their own brand" ON public.brands
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Brand owners can update their own brand" ON public.brands
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all brands" ON public.brands
FOR ALL USING (public.get_current_user_role() = 'admin');
