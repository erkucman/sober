import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/context';
import { toast } from 'sonner';

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      console.log('�� Fetching brands...');
      
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('status', 'approved')
        .order('brand_name');
      
      if (error) {
        console.error('❌ Error fetching brands:', error);
        throw error;
      }
      
      console.log('✅ Brands fetched successfully:', data?.length || 0, 'brands');
      return data || [];
    },
    retry: (failureCount, error) => {
      console.log('🔄 Retrying brands query:', failureCount, error);
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePendingBrands() {
  return useQuery({
    queryKey: ['pending-brands'],
    queryFn: async () => {
      console.log('🔍 Fetching pending brands...');
      
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching pending brands:', error);
        throw error;
      }
      
      console.log('✅ Pending brands fetched successfully:', data?.length || 0, 'pending brands');
      return data || [];
    },
    retry: (failureCount, error) => {
      console.log('🔄 Retrying pending brands query:', failureCount, error);
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useUserBrand() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userBrand', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user brand:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
  });
}

const fetchFeaturedBrands = async () => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('status', 'approved')
    .eq('is_featured', true)
    .order('brand_name');
  if (error) throw error;
  return data || [];
};

export function useFeaturedBrands() {
  return useQuery({
    queryKey: ['featured-brands'],
    queryFn: fetchFeaturedBrands,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

const fetchNewBrands = async () => {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data, error } = await supabase
    .from('brands')
    .select('*, main_category_id(name)')
    .eq('status', 'approved')
    .gte('created_at', fourteenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export function useNewBrands() {
  return useQuery({
    queryKey: ['new-brands'],
    queryFn: fetchNewBrands,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export const useUpdateBrandFeaturedStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ brandId, is_featured }: { brandId: string; is_featured: boolean }) => {
      const { data, error } = await supabase
        .from('brands')
        .update({ is_featured })
        .eq('id', brandId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Brand featured status updated.');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['featured-brands'] });
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    }
  });
};
