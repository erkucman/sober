
-- Fix product awards RLS policy to allow admins to insert awards
DROP POLICY IF EXISTS "Brand users can insert awards for their products" ON product_awards;
DROP POLICY IF EXISTS "Brand users can update awards for their products" ON product_awards;
DROP POLICY IF EXISTS "Brand users can delete awards for their products" ON product_awards;

-- Create new policies that allow both brand users and admins to manage awards
CREATE POLICY "Brand users and admins can insert awards for their products" 
ON product_awards FOR INSERT 
WITH CHECK (
  (get_current_user_role() = 'admin'::user_role) OR
  (auth.uid() IN (
    SELECT b.user_id
    FROM brands b
    JOIN products p ON b.id = p.brand_id
    WHERE p.id = product_awards.product_id
  ))
);

CREATE POLICY "Brand users and admins can update awards for their products" 
ON product_awards FOR UPDATE 
USING (
  (get_current_user_role() = 'admin'::user_role) OR
  (auth.uid() IN (
    SELECT b.user_id
    FROM brands b
    JOIN products p ON b.id = p.brand_id
    WHERE p.id = product_awards.product_id
  ))
);

CREATE POLICY "Brand users and admins can delete awards for their products" 
ON product_awards FOR DELETE 
USING (
  (get_current_user_role() = 'admin'::user_role) OR
  (auth.uid() IN (
    SELECT b.user_id
    FROM brands b
    JOIN products p ON b.id = p.brand_id
    WHERE p.id = product_awards.product_id
  ))
);
