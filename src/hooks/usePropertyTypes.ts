
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePropertyTypes() {
  return useQuery({
    queryKey: ['property-types'],
    queryFn: async () => {
      console.log('🔍 Fetching property types...');
      
      const { data, error } = await supabase
        .from('property_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('❌ Error fetching property types:', error);
        throw error;
      }
      
      console.log('✅ Property types fetched successfully:', data?.length || 0, 'property types');
      return data || [];
    },
    retry: (failureCount, error) => {
      console.log('🔄 Retrying property types query:', failureCount, error);
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
