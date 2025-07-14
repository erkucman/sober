
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

const fetchFoods = async () => {
  const { data, error } = await supabase.from('foods').select('*').order('name');
  if (error) {
    console.error('Error fetching foods:', error);
    throw new Error(error.message);
  }
  return data;
};

export const useFoods = () => {
  return useQuery<Tables<'foods'>[], Error>({
    queryKey: ['foods'],
    queryFn: fetchFoods,
  });
};
