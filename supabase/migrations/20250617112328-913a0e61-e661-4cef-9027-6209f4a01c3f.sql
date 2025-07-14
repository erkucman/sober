
-- Enable RLS on foods table and create policies for admin access
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Allow admins to insert, update, delete, and select all foods
CREATE POLICY "Admins can manage all foods" 
  ON public.foods 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow all users to view foods (for public browsing)
CREATE POLICY "Everyone can view foods" 
  ON public.foods 
  FOR SELECT 
  USING (true);
