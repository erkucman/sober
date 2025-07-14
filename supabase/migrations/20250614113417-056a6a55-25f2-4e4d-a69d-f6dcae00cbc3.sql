
-- TEMPORARY: Enable SELECT for all authenticated users on the key lookup tables.

-- Categories
DROP POLICY IF EXISTS "Everyone can view categories" ON public.categories;
CREATE POLICY "Everyone can view categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Brands
DROP POLICY IF EXISTS "Everyone can view brands" ON public.brands;
CREATE POLICY "Everyone can view brands"
  ON public.brands
  FOR SELECT
  TO authenticated
  USING (true);

-- Property Types
DROP POLICY IF EXISTS "Everyone can view property_types" ON public.property_types;
CREATE POLICY "Everyone can view property_types"
  ON public.property_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Optionally, allow admins to manage (optional at this stage, but included for completeness)
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can manage brands" ON public.brands;
CREATE POLICY "Admins can manage brands"
  ON public.brands
  FOR ALL
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can manage property_types" ON public.property_types;
CREATE POLICY "Admins can manage property_types"
  ON public.property_types
  FOR ALL
  TO authenticated
  USING (public.get_current_user_role() = 'admin');
