
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FoodPairing {
  id: string;
  product_id: string;
  food_id: string;
  pairing_strength: number;
  notes?: string;
  foods: {
    id: string;
    name: string;
    description?: string;
  };
}

export const useFoodPairings = (productId?: string) => {
  return useQuery({
    queryKey: ['foodPairings', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from('product_food_pairings')
        .select(`
          *,
          foods (
            id,
            name,
            description
          )
        `)
        .eq('product_id', productId);

      if (error) throw error;
      return data as FoodPairing[];
    },
    enabled: !!productId,
  });
};

export const useAddFoodPairing = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pairing: { product_id: string; food_id: string; pairing_strength?: number; notes?: string }) => {
      const { data, error } = await supabase
        .from('product_food_pairings')
        .insert(pairing)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodPairings'] });
      toast({
        title: "Success",
        description: "Food pairing added successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add food pairing. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useRemoveFoodPairing = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pairingId: string) => {
      const { error } = await supabase
        .from('product_food_pairings')
        .delete()
        .eq('id', pairingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodPairings'] });
      toast({
        title: "Success",
        description: "Food pairing removed successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove food pairing. Please try again.",
        variant: "destructive",
      });
    },
  });
};
