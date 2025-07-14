
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const foodSchema = z.object({
  name: z.string().min(1, 'Food name is required'),
  description: z.string().optional(),
  image_url: z.string().optional(),
  is_vegan: z.boolean().default(false),
  is_vegetarian: z.boolean().default(false),
  is_halal: z.boolean().default(false),
  is_gluten_free: z.boolean().default(false),
  is_keto: z.boolean().default(false),
});

export type FoodFormData = z.infer<typeof foodSchema>;

export function useFoodForm(onSuccess?: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FoodFormData>({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      name: '',
      description: '',
      image_url: '',
      is_vegan: false,
      is_vegetarian: false,
      is_halal: false,
      is_gluten_free: false,
      is_keto: false,
    },
  });

  const createFoodMutation = useMutation({
    mutationFn: async (data: FoodFormData) => {
      if (!data.name || data.name.trim() === '') {
        throw new Error('Food name is required');
      }

      const insertData = {
        name: data.name.trim(),
        description: data.description || null,
        image_url: data.image_url || null,
        is_vegan: data.is_vegan,
        is_vegetarian: data.is_vegetarian,
        is_halal: data.is_halal,
        is_gluten_free: data.is_gluten_free,
        is_keto: data.is_keto,
      };

      console.log('Creating food with data:', insertData);

      const { error } = await supabase
        .from('foods')
        .insert(insertData);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Food item created successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['foods'] });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating food:', error);
      toast({
        title: 'Error',
        description: 'Failed to create food item. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleImageUpload = (file: File) => {
    form.setValue('image_url', URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    form.setValue('image_url', '');
  };

  const onSubmit = (data: FoodFormData) => {
    createFoodMutation.mutate(data);
  };

  return {
    form,
    createFoodMutation,
    handleImageUpload,
    handleImageRemove,
    onSubmit,
  };
}
