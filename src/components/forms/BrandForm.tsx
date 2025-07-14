
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/context';
import { BrandFormFields } from './brand-form/BrandFormFields';
import { BrandFormActions } from './brand-form/BrandFormActions';
import type { Database } from '@/integrations/supabase/types';

type SubmissionStatus = Database['public']['Enums']['submission_status'];

const brandSchema = z.object({
  brand_name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  vat_number: z.string().optional(),
  main_category_id: z.string().optional(),
  is_women_owned: z.boolean().default(false),
  logo_url: z.string().optional(),
  gallery_images: z.array(z.string()).optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface BrandFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isAdmin?: boolean;
  brandToEdit?: any;
}

export function BrandForm({ onSuccess, onCancel, isAdmin = false, brandToEdit }: BrandFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: brandToEdit || {
      is_women_owned: false,
      gallery_images: [],
    },
  });

  const onSubmit = async (data: BrandFormData) => {
    if (!user && !isAdmin) {
      toast({
        title: "Error",
        description: "You must be logged in to create a brand.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const brandData = {
        brand_name: data.brand_name,
        description: data.description || null,
        website_url: data.website_url || null,
        vat_number: data.vat_number || null,
        main_category_id: data.main_category_id || null,
        is_women_owned: data.is_women_owned || false,
        logo_url: data.logo_url || null,
        gallery_images: data.gallery_images || null,
        user_id: brandToEdit?.user_id || user?.id,
        status: (isAdmin ? 'approved' : 'pending') as SubmissionStatus,
      };

      if (brandToEdit?.id) {
        // Update existing brand
        const { error } = await supabase
          .from('brands')
          .update(brandData)
          .eq('id', brandToEdit.id);

        if (error) throw error;
      } else {
        // Create new brand
        const { error } = await supabase
          .from('brands')
          .insert(brandData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: brandToEdit?.id 
          ? "Brand updated successfully!" 
          : isAdmin 
            ? "Brand created and approved successfully!" 
            : "Brand application submitted successfully!",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast({
        title: "Error",
        description: "Failed to save brand. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <BrandFormFields form={form} brandToEdit={brandToEdit} />
      <BrandFormActions onCancel={onCancel} loading={loading} brandToEdit={brandToEdit} />
    </form>
  );
}
