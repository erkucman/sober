
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    -- Use placeholder email for anonymous users as their email is null
    COALESCE(new.email, 'guest-' || new.id || '@example.com'),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    CASE
      -- Explicitly set role for anonymous users
      WHEN new.is_anonymous THEN 'end_user'::public.user_role
      WHEN new.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::public.user_role
      WHEN new.raw_user_meta_data->>'role' = 'brand' THEN 'brand'::public.user_role
      ELSE 'end_user'::public.user_role
    END
  );
  RETURN new;
END;
$function$
