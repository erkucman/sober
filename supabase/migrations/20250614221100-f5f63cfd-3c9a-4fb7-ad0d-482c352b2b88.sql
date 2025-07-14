
-- Add columns to brands table for main category and VAT number
ALTER TABLE public.brands
ADD COLUMN main_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
ADD COLUMN vat_number TEXT;

-- Update the function to also create a brand entry when a brand signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role_text TEXT := new.raw_user_meta_data->>'role';
  final_user_role public.user_role;
BEGIN
  -- Determine user role
  final_user_role := CASE
    WHEN new.is_anonymous THEN 'end_user'::public.user_role
    WHEN user_role_text = 'admin' THEN 'admin'::public.user_role
    WHEN user_role_text = 'brand' THEN 'brand'::public.user_role
    ELSE 'end_user'::public.user_role
  END;
  
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.email, 'guest-' || new.id || '@example.com'),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    final_user_role
  );

  -- If the user is a brand, create an entry in the brands table
  IF final_user_role = 'brand' THEN
    INSERT INTO public.brands (user_id, brand_name, description, website_url, vat_number, main_category_id)
    VALUES (
      new.id,
      new.raw_user_meta_data->>'brand_name',
      new.raw_user_meta_data->>'description',
      new.raw_user_meta_data->>'website_url',
      new.raw_user_meta_data->>'vat_number',
      (new.raw_user_meta_data->>'main_category_id')::UUID
    );
  END IF;

  RETURN new;
END;
$function$
