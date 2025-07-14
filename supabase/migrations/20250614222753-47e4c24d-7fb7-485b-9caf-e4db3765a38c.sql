
-- Enable Row Level Security on the categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to read the categories
CREATE POLICY "Allow public read access to categories"
ON public.categories
FOR SELECT
USING (true);
