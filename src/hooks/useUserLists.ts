import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/context';

const fetchUserLists = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_lists')
    .select('*, user_list_items(product_id)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user lists:', error);
    throw error;
  }
  
  return data?.map(list => ({
    ...list,
    product_ids: (list.user_list_items as unknown as { product_id: string }[]).map(item => item.product_id),
  })) || [];
};

export const useUserLists = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-lists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return fetchUserLists(user.id);
    },
    enabled: !!user,
  });
};

export const useAddToWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Not authenticated');
      // Find or create the user's wishlist
      let { data: lists, error } = await supabase
        .from('user_lists')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_public', false)
        .eq('name', 'Wishlist');
      if (error) throw error;
      let listId = lists && lists[0]?.id;
      if (!listId) {
        const { data: newList, error: createError } = await supabase
          .from('user_lists')
          .insert({ user_id: user.id, name: 'Wishlist', is_public: false })
          .select();
        if (createError) throw createError;
        listId = newList && newList[0]?.id;
      }
      // Add product to wishlist
      const { error: addError } = await supabase
        .from('user_list_items')
        .insert({ list_id: listId, product_id: productId });
      if (addError) throw addError;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useRemoveFromWishlist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Not authenticated');
      // Find the user's wishlist
      let { data: lists, error } = await supabase
        .from('user_lists')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_public', false)
        .eq('name', 'Wishlist');
      if (error) throw error;
      const listId = lists && lists[0]?.id;
      if (!listId) throw new Error('Wishlist not found');
      // Remove product from wishlist
      const { error: removeError } = await supabase
        .from('user_list_items')
        .delete()
        .eq('list_id', listId)
        .eq('product_id', productId);
      if (removeError) throw removeError;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
