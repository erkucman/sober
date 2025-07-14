
-- Drop existing objects with CASCADE to handle dependencies
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP TABLE IF EXISTS public.user_activities CASCADE;
DROP TABLE IF EXISTS public.review_responses CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.user_list_items CASCADE;
DROP TABLE IF EXISTS public.user_lists CASCADE;
DROP TABLE IF EXISTS public.product_properties CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.property_types CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Create enum types for user roles and statuses
CREATE TYPE user_role AS ENUM ('admin', 'brand', 'end_user');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE activity_type AS ENUM ('wishlist_add', 'wishlist_remove', 'cta_click', 'social_share', 'review_submit');

-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'end_user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Brand profiles table
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  status submission_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Multi-level categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product property types (dynamic attributes)
CREATE TABLE public.property_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  data_type TEXT NOT NULL DEFAULT 'text',
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  category_id UUID REFERENCES public.categories(id),
  status submission_status NOT NULL DEFAULT 'pending',
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product properties (dynamic attributes)
CREATE TABLE public.product_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  property_type_id UUID NOT NULL REFERENCES public.property_types(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  UNIQUE(product_id, property_type_id)
);

-- User lists (wishlists, favorites, custom lists)
CREATE TABLE public.user_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User list items
CREATE TABLE public.user_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.user_lists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(list_id, product_id)
);

-- Product reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  status submission_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Review responses (brands can respond to reviews)
CREATE TABLE public.review_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id)
);

-- User activity tracking
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for brands
CREATE POLICY "Brands can manage their own brand profile" ON public.brands
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Everyone can view approved brands" ON public.brands
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins can manage all brands" ON public.brands
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for categories (admins manage, everyone can read)
CREATE POLICY "Everyone can view categories" ON public.categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for property types (admins manage, everyone can read)
CREATE POLICY "Everyone can view property types" ON public.property_types
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage property types" ON public.property_types
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for products
CREATE POLICY "Brands can manage their own products" ON public.products
  FOR ALL USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Everyone can view approved products" ON public.products
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins can manage all products" ON public.products
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for product properties
CREATE POLICY "Product properties follow product access" ON public.product_properties
  FOR ALL USING (
    product_id IN (
      SELECT id FROM public.products 
      WHERE status = 'approved' 
         OR brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
         OR public.get_current_user_role() = 'admin'
    )
  );

-- RLS Policies for user lists
CREATE POLICY "Users can manage their own lists" ON public.user_lists
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Everyone can view public lists" ON public.user_lists
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can view all lists" ON public.user_lists
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- RLS Policies for user list items
CREATE POLICY "List items follow list access" ON public.user_list_items
  FOR ALL USING (
    list_id IN (
      SELECT id FROM public.user_lists 
      WHERE user_id = auth.uid() 
         OR is_public = true 
         OR public.get_current_user_role() = 'admin'
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Users can manage their own reviews" ON public.reviews
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Everyone can view approved reviews" ON public.reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Brands can view reviews of their products" ON public.reviews
  FOR SELECT USING (
    product_id IN (
      SELECT id FROM public.products 
      WHERE brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage all reviews" ON public.reviews
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for review responses
CREATE POLICY "Brands can manage responses to their product reviews" ON public.review_responses
  FOR ALL USING (brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid()));

CREATE POLICY "Everyone can view review responses" ON public.review_responses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage all review responses" ON public.review_responses
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for user activities
CREATE POLICY "Users can view their own activities" ON public.user_activities
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own activities" ON public.user_activities
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all activities" ON public.user_activities
  FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'end_user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some initial data
INSERT INTO public.property_types (name, description, data_type) VALUES
  ('Vintage', 'Wine vintage year', 'text'),
  ('Country', 'Country of origin', 'text'),
  ('Region', 'Wine region', 'text'),
  ('Winery', 'Winery name', 'text'),
  ('Beverage Type', 'Type of beverage', 'text'),
  ('Wine Varietal', 'Wine varietal type', 'text'),
  ('Grape Varieties', 'Grape varieties used', 'text'),
  ('Serving Temperature', 'Recommended serving temperature', 'text'),
  ('Shelf Duration', 'Shelf life duration', 'text');

INSERT INTO public.categories (name, description) VALUES
  ('Wine', 'Wine products'),
  ('Spirits', 'Spirits and liquors'),
  ('Mixers', 'Cocktail mixers and non-alcoholic beverages'),
  ('Others', 'Other beverage products');
