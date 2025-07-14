import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/context';

const fetchUserStats = async (userId: string) => {
  try {
    // Count all lists
    const { data: lists, error: listsError } = await supabase
      .from('user_lists')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);
    if (listsError) throw listsError;
    const listsCount = lists?.length ?? 0;

    // Count items in the user's Wishlist only
    let wishlistedItemsCount = 0;
    const { data: wishlist, error: wishlistError } = await supabase
      .from('user_lists')
      .select('id')
      .eq('user_id', userId)
      .eq('is_public', false)
      .eq('name', 'Wishlist')
      .maybeSingle();
    if (wishlistError) throw wishlistError;
    if (wishlist?.id) {
      const { count, error: itemsError } = await supabase
        .from('user_list_items')
        .select('*', { count: 'exact', head: true })
        .eq('list_id', wishlist.id);
      if (itemsError) throw itemsError;
      wishlistedItemsCount = count ?? 0;
    }

    const { count: reviewsCount, error: reviewsError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (reviewsError) throw reviewsError;
    
    return {
      listsCount,
      wishlistedItemsCount,
      reviewsCount: reviewsCount ?? 0,
      discoveredCount: 0, // This metric is not being tracked yet
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { listsCount: 0, wishlistedItemsCount: 0, reviewsCount: 0, discoveredCount: 0 };
  }
};

export const useUserStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return { listsCount: 0, wishlistedItemsCount: 0, reviewsCount: 0, discoveredCount: 0 };
      return fetchUserStats(user.id);
    },
    enabled: !!user,
  });
};
