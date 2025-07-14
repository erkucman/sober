
-- Create the foods table
CREATE TABLE public.foods (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    is_vegan BOOLEAN DEFAULT false NOT NULL,
    is_vegetarian BOOLEAN DEFAULT false NOT NULL,
    is_halal BOOLEAN DEFAULT false NOT NULL,
    is_gluten_free BOOLEAN DEFAULT false NOT NULL,
    is_keto BOOLEAN DEFAULT false NOT NULL
);

-- Enable Row Level Security for public access
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to read the food items
CREATE POLICY "Allow public read access to foods"
ON public.foods
FOR SELECT
USING (true);

-- Seed the table with sample food items
INSERT INTO public.foods (name, description, is_vegetarian, is_gluten_free, is_vegan, is_halal, is_keto)
VALUES
('Pizza Margherita', 'Classic pizza with tomatoes, mozzarella, fresh basil, salt, and extra-virgin olive oil.', true, false, false, true, false),
('Spaghetti Bolognese', 'A classic Italian dish with a rich meat sauce. This version is not halal.', false, false, false, false, false),
('Tiramisu', 'A coffee-flavoured Italian dessert. It is made of ladyfingers (savoiardi) dipped in coffee, layered with a whipped mixture of eggs, sugar, and mascarpone cheese, flavoured with cocoa.', true, false, false, true, false);

