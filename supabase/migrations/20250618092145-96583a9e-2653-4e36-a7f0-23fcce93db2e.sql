
-- Create a junction table to link products with foods for pairing recommendations
CREATE TABLE public.product_food_pairings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
    pairing_strength INTEGER DEFAULT 5 CHECK (pairing_strength >= 1 AND pairing_strength <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_id, food_id)
);

-- Enable Row Level Security
ALTER TABLE public.product_food_pairings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to food pairings
CREATE POLICY "Allow public read access to product food pairings"
ON public.product_food_pairings
FOR SELECT
USING (true);

-- Create policy to allow authenticated users to manage pairings
CREATE POLICY "Allow authenticated users to manage product food pairings"
ON public.product_food_pairings
FOR ALL
USING (auth.role() = 'authenticated');

-- Add some indexes for better performance
CREATE INDEX idx_product_food_pairings_product_id ON public.product_food_pairings(product_id);
CREATE INDEX idx_product_food_pairings_food_id ON public.product_food_pairings(food_id);
