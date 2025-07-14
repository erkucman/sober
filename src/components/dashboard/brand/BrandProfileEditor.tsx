
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/context';
import { Database } from '@/integrations/supabase/types';
import { FileUploader } from '@/components/ui/FileUploader';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Brand = Database['public']['Tables']['brands']['Row'];

const brandProfileSchema = z.object({
  brand_name: z.string().min(1, 'Brand name is required'),
  description: z.string().optional(),
  website_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  logo_url: z.string().url().optional().or(z.literal('')),
  logo_file: z.any().optional(),
});

type BrandProfileFormData = z.infer<typeof brandProfileSchema>;

interface BrandProfileEditorProps {
  brand: Brand;
}

const uploadFile = async ({ file, path }: { file: File, path: string }) => {
    const { data, error } = await supabase.storage
      .from('brand-assets')
      .upload(path, file, { cacheControl: '3600', upsert: true });
  
    if (error) throw error;
  
    const { data: { publicUrl } } = supabase.storage.from('brand-assets').getPublicUrl(data.path);
    return publicUrl;
};

export function BrandProfileEditor({ brand }: BrandProfileEditorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, formState: { errors, isDirty }, setValue } = useForm<BrandProfileFormData>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: {
      brand_name: brand.brand_name,
      description: brand.description || '',
      website_url: brand.website_url || '',
      logo_url: brand.logo_url || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: BrandProfileFormData) => {
        let newLogoUrl = data.logo_url;

        if (data.logo_file) {
            newLogoUrl = await uploadFile({
                file: data.logo_file,
                path: `${user!.id}/${brand.id}/logo_${Date.now()}_${data.logo_file.name}`
            });
        }
    
        const { error } = await supabase
            .from('brands')
            .update({
                brand_name: data.brand_name,
                description: data.description,
                website_url: data.website_url,
                logo_url: newLogoUrl || null,
            })
            .eq('id', brand.id);
    
        if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Brand profile updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['userBrand', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error) => {
      console.error('Error updating brand profile:', error);
      toast({ title: "Error", description: "Failed to update brand profile. Please try again.", variant: "destructive" });
    }
  });

  const onSubmit = (data: BrandProfileFormData) => mutation.mutate(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Brand Profile</CardTitle>
        <CardDescription>Update your brand's public information. This will be visible on your brand page.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="brand_name">Brand Name *</Label>
            <Input id="brand_name" {...register('brand_name')} />
            {errors.brand_name && <p className="text-sm text-red-600">{errors.brand_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input id="website_url" type="url" {...register('website_url')} placeholder="https://example.com" />
            {errors.website_url && <p className="text-sm text-red-600">{errors.website_url.message}</p>}
          </div>
          
          <div className="space-y-2">
             <Controller
                name="logo_file"
                control={control}
                render={({ field }) => (
                    <FileUploader
                        label="Brand Logo"
                        currentImageUrl={brand.logo_url}
                        onFileUpload={(file) => field.onChange(file)}
                        onFileRemove={() => {
                            field.onChange(null);
                            setValue('logo_url', '', { shouldDirty: true });
                        }}
                    />
                )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} rows={5} placeholder="Tell us about your brand..." />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending || !isDirty} className="bg-orange-600 hover:bg-orange-700">
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
