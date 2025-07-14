
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('🔍 Fetching categories...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');
      
      if (error) {
        console.error('❌ Error fetching categories:', error);
        throw error;
      }
      
      console.log('✅ Categories fetched successfully:', data?.length || 0, 'categories');
      return data || [];
    },
    retry: (failureCount, error) => {
      console.log('🔄 Retrying categories query:', failureCount, error);
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
