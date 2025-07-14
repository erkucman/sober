import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { ProductFormData } from '@/lib/product-form-schema';

export const uploadImages = async (files: File[], user: User | null): Promise<string[]> => {
  if (!user) throw new Error("User not authenticated for image upload.");
  if (!files || files.length === 0) return [];
  
  const imageUrls: string[] = [];
  for (const file of files) {
    const fileName = `${user.id}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);
    
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw new Error(`Failed to upload image: ${file.name}`);
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(uploadData.path);
      
    imageUrls.push(urlData.publicUrl);
  }
  return imageUrls;
};

export const getBrandId = async (data: ProductFormData, isAdmin: boolean, user: User | null): Promise<string> => {
    if (isAdmin) {
        if (!data.brand_id) throw new Error("Please select a brand.");
        return data.brand_id;
    }
    if (!user) throw new Error("You must be logged in.");
    const { data: brand, error } = await supabase.from('brands').select('id').eq('user_id', user.id).single();
    if (error || !brand) throw new Error("You must have an approved brand profile to create products.");
    return brand.id;
};

export const mapDataToProperties = (data: ProductFormData) => {
  const props = {
    'Vintage': data.vintage,
    'Country': data.country,
    'Region': data.region,
    'Beverage Type': data.beverage_type,
    'Wine Varietal': data.wine_varietal,
    'Grape Varieties': data.grape_varieties,
    'Serving Temperature': data.serving_temperature,
    'Shelf Duration': data.shelf_duration,
    'Purchase Link': data.purchase_link,
    'Aromatic - Body': data.aromatic_body,
    'Aromatic - Acidity': data.aromatic_acidity,
    'Aromatic - Tannin': data.aromatic_tannin,
    'Aromatic - Sweetness': data.aromatic_sweetness,
    'Aromatic - Fruit': data.aromatic_fruit,
  };
  console.log('DEBUG: mapDataToProperties', props);
  return props;
};
