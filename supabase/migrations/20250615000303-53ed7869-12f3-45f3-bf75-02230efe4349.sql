
-- Add the is_featured column to the brands table
ALTER TABLE public.brands
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE;
