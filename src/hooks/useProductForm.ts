import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth/context';
import { ProductFormData, productSchema } from '@/lib/product-form-schema';
import { getBrandId, mapDataToProperties, uploadImages } from '@/lib/product-form-helpers';
import { useQueryClient } from '@tanstack/react-query';

interface UseProductFormProps {
  onSuccess?: () => void;
  isAdmin?: boolean;
  productToEdit?: any;
}

const defaultValues: ProductFormData = {
  name: '',
  description: '',
  currency: 'USD',
  price: undefined,
  is_alcohol_free: false,
  is_gluten_free: false,
  is_vegan: false,
  images: [],
  awards: [],
  brand_id: '',
  aromatic_body: '1',
  aromatic_acidity: '1',
  aromatic_tannin: '1',
  aromatic_sweetness: '1',
  aromatic_fruit: '1',
};

export const useProductForm = ({ onSuccess, isAdmin = false, productToEdit }: UseProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!productToEdit;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isEditing && productToEdit) {
      console.log('Mapping product data for editing:', productToEdit);
      
      // Create a map of properties from product_properties
      const propertiesMap: { [key: string]: string } = {};
      
      if (productToEdit.product_properties) {
        productToEdit.product_properties.forEach((prop: any) => {
          const propertyName = prop.property_types?.name;
          if (propertyName) {
            propertiesMap[propertyName] = prop.value;
          }
        });
      }
      
      const formData = {
        ...productToEdit,
        price: productToEdit.price ? Number(productToEdit.price) : undefined,
        awards: productToEdit.product_awards?.map((a: any) => ({ 
          id: a.id,
          name: a.name, 
          year: a.year?.toString() || '' 
        })) || [],
        images: productToEdit.images || [],
        // Map properties from the properties map
        vintage: propertiesMap['Vintage'] || '',
        country: propertiesMap['Country'] || '',
        region: propertiesMap['Region'] || '',
        beverage_type: propertiesMap['Beverage Type'] || '',
        wine_varietal: propertiesMap['Wine Varietal'] || '',
        grape_varieties: propertiesMap['Grape Varieties'] || '',
        serving_temperature: propertiesMap['Serving Temperature'] || '',
        shelf_duration: propertiesMap['Shelf Duration'] || '',
        purchase_link: productToEdit.purchase_link || '',
        aromatic_body: propertiesMap['Aromatic - Body'] || '1',
        aromatic_acidity: propertiesMap['Aromatic - Acidity'] || '1',
        aromatic_tannin: propertiesMap['Aromatic - Tannin'] || '1',
        aromatic_sweetness: propertiesMap['Aromatic - Sweetness'] || '1',
        aromatic_fruit: propertiesMap['Aromatic - Fruit'] || '1',
      };
      
      // Remove fields that shouldn't be in the form
      delete formData.created_at;
      delete formData.updated_at;
      delete formData.brands;
      delete formData.categories;
      delete formData.product_properties;
      delete formData.product_awards;

      console.log('Mapped form data:', formData);
      form.reset(formData);
    } else {
      form.reset(defaultValues);
    }
  }, [productToEdit, isEditing, form]);

  const imagesValue = form.watch('images');

  const imagePreviews = useMemo(() => {
    return (imagesValue || []).map(img => {
      if (typeof img === 'string') return img;
      if (img instanceof File) return URL.createObjectURL(img);
      return '';
    }).filter(Boolean);
  }, [imagesValue]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(p => {
        if (p.startsWith('blob:')) {
          URL.revokeObjectURL(p);
        }
      });
    };
  }, [imagePreviews]);

  const handleImageDrop = (acceptedFiles: File[]) => {
    const currentImages = form.getValues('images') || [];
    if ((currentImages.length + acceptedFiles.length) > 5) {
      toast({ title: "Too many files", description: "You can upload a maximum of 5 images.", variant: "destructive" });
      return;
    }

    const validFiles = acceptedFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File too large", description: `${file.name} is larger than 5MB.`, variant: "destructive" });
        return false;
      }
      return true;
    });

    form.setValue('images', [...currentImages, ...validFiles], { shouldValidate: true, shouldDirty: true });
  };
  
  const handleImageRemove = (index: number) => {
    const currentImages = form.getValues('images') || [];
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    form.setValue('images', newImages, { shouldValidate: true, shouldDirty: true });
  };

  const handleSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const brandId = await getBrandId(data, isAdmin, user);

      const existingImageUrls = data.images?.filter(img => typeof img === 'string') || [];
      const newImageFiles = data.images?.filter(img => img instanceof File) || [];

      if (isEditing) {
        const initialImageUrls = productToEdit?.images || [];
        const imagesToRemove = initialImageUrls.filter((url: string) => !existingImageUrls.includes(url));

        if (imagesToRemove.length > 0) {
          const filePathsToRemove = imagesToRemove.map((url: string) => {
            try {
              const urlObject = new URL(url);
              const pathParts = urlObject.pathname.split('/product-images/');
              return pathParts[1] || null;
            } catch (e) {
              console.error("Invalid image URL, cannot extract path:", url);
              return null;
            }
          }).filter((p): p is string => p !== null);
          
          if (filePathsToRemove.length > 0) {
            const { error: removeError } = await supabase.storage
              .from('product-images')
              .remove(filePathsToRemove);
            
            if (removeError) {
              console.error("Error removing images from storage:", removeError);
              toast({
                title: "Warning",
                description: "Could not remove some old images from storage.",
                variant: "default",
              });
            }
          }
        }
      }

      const newImageUrls = await uploadImages(newImageFiles, user);
      const allImageUrls = [...existingImageUrls, ...newImageUrls];
      
      const { error } = await (supabase as any).rpc('create_or_update_product', {
        p_id: isEditing ? productToEdit.id : null,
        p_brand_id: brandId,
        p_name: data.name,
        p_description: data.description,
        p_price: data.price ? Number(data.price) : null,
        p_currency: data.currency,
        p_category_id: data.category_id || null,
        p_images: allImageUrls.length > 0 ? allImageUrls : null,
        p_is_alcohol_free: data.is_alcohol_free,
        p_is_gluten_free: data.is_gluten_free,
        p_is_vegan: data.is_vegan,
        p_awards: data.awards?.map(a => ({ name: a.name, year: a.year ? parseInt(a.year, 10) : null })) || [],
        p_properties: mapDataToProperties(data),
      });

      if (error) throw error;
      
      // Invalidate all product-related queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      await queryClient.invalidateQueries({ queryKey: ['pendingProducts'] });
      await queryClient.invalidateQueries({ queryKey: ['product'] });
      await queryClient.invalidateQueries({ queryKey: ['productsByBrand', brandId] });
      
      toast({
        title: "Success",
        description: `Product ${isEditing ? 'updated' : 'created'} successfully!`,
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} product:`, error);
      toast({
        title: "Error",
        description: (error as Error).message || `Failed to ${isEditing ? 'update' : 'create'} product.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, handleSubmit: form.handleSubmit(handleSubmit), imagePreviews, handleImageDrop, handleImageRemove };
};
