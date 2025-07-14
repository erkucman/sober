
-- This migration refines the Row-Level Security policies for administrators on the 'brands' table,
-- replacing a single broad policy with more specific ones for each action (SELECT, INSERT, UPDATE, DELETE).

-- Drop the existing broad policy for admins.
-- It's safe to run this even if the policy doesn't exist.
DROP POLICY IF EXISTS "Admins can manage all brands" ON public.brands;

-- Create a specific policy for admins to view all brands, regardless of status.
CREATE POLICY "Admins can view all brands" ON public.brands
FOR SELECT
USING (public.get_current_user_role() = 'admin');

-- Create a specific policy for admins to insert new brands.
CREATE POLICY "Admins can create new brands" ON public.brands
FOR INSERT
WITH CHECK (public.get_current_user_role() = 'admin');

-- Create a specific policy for admins to update any brand.
CREATE POLICY "Admins can update any brand" ON public.brands
FOR UPDATE
USING (public.get_current_user_role() = 'admin');

-- Create a specific policy for admins to delete any brand.
CREATE POLICY "Admins can delete any brand" ON public.brands
FOR DELETE
USING (public.get_current_user_role() = 'admin');
