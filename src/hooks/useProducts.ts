import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseProductsOptions {
  includeBrand?: boolean;
  includeCategory?: boolean;
}

const fetchAllProducts = async (options: UseProductsOptions = {}) => {
  let selectString = '*';
  const selectParts = [];

  if (options.includeBrand) {
    selectParts.push('brands(brand_name)');
  }
  if (options.includeCategory) {
    selectParts.push('categories(name)');
  }

  if (selectParts.length > 0) {
    selectString += `, ${selectParts.join(', ')}`;
  }

  const { data, error } = await supabase
    .from('products')
    .select(selectString)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const useProducts = (options: UseProductsOptions = {}) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: () => fetchAllProducts(options),
  });
};

const fetchProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, brands(*), product_properties(*, property_types(*)), product_awards(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
  return data;
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });
};

const fetchPendingProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*, brands(brand_name), product_awards(*)')
    .eq('status', 'pending');

  if (error) throw error;
  return data;
};

export const usePendingProducts = () => {
  return useQuery({
    queryKey: ['pendingProducts'],
    queryFn: fetchPendingProducts,
  });
};

const fetchProductsByCategoryName = async (categoryName: string) => {
  if (!categoryName) return [];
  
  const formattedCategoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();

  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('name', formattedCategoryName);

  if (categoryError) {
    console.error(`Error fetching category '${formattedCategoryName}':`, categoryError);
    throw categoryError;
  }
  
  if (!categories || categories.length === 0) {
      console.log(`Category not found: ${formattedCategoryName}`);
      return [];
  }

  const categoryId = categories[0].id;

  const { data, error } = await supabase
    .from('products')
    .select('*, brands(brand_name)')
    .eq('category_id', categoryId)
    .eq('status', 'approved');

  if (error) {
    console.error(`Error fetching products for category id ${categoryId}:`, error);
    throw error;
  }
  return data || [];
};

export const useProductsByCategory = (categoryName: string) => {
  return useQuery({
    queryKey: ['productsByCategory', categoryName],
    queryFn: () => fetchProductsByCategoryName(categoryName),
    enabled: !!categoryName,
  });
};

const fetchProductsByBrandId = async (brandId: string) => {
  if (!brandId) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by brand id:', error);
    throw error;
  }
  return data || [];
};

export const useProductsByBrand = (brandId: string) => {
  return useQuery({
    queryKey: ['productsByBrand', brandId],
    queryFn: () => fetchProductsByBrandId(brandId),
    enabled: !!brandId,
  });
};

const fetchAllAdminProducts = async (options: UseProductsOptions = {}) => {
  let selectString = '*';
  const selectParts = [];

  if (options.includeBrand) {
    selectParts.push('brands(brand_name)');
  }
  if (options.includeCategory) {
    selectParts.push('categories(name)');
  }

  if (selectParts.length > 0) {
    selectString += `, ${selectParts.join(', ')}`;
  }

  const { data, error } = await supabase
    .from('products')
    .select(selectString)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const useAdminProducts = (options: UseProductsOptions = {}) => {
  return useQuery({
    queryKey: ['admin-products', options],
    queryFn: () => fetchAllAdminProducts(options),
  });
};
