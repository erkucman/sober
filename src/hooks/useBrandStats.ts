
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const fetchBrandStats = async (brandId: string) => {
  if (!brandId) return null;

  try {
    // 1. Get all approved product IDs for the brand
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('brand_id', brandId)
      .eq('status', 'approved');

    if (productsError) throw productsError;

    const productIds = products.map(p => p.id);

    if (productIds.length === 0) {
      return { totalReviews: 0, averageRating: 0, wishlists: 0 };
    }

    // 2. Get review stats
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .in('product_id', productIds)
      .eq('status', 'approved');

    if (reviewsError) throw reviewsError;

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews 
      : 0;

    // 3. Get wishlist stats
    const { count: wishlists, error: wishlistsError } = await supabase
      .from('user_list_items')
      .select('*', { count: 'exact', head: true })
      .in('product_id', productIds);
    
    if (wishlistsError) throw wishlistsError;

    return {
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      wishlists: wishlists ?? 0,
    };
  } catch (error) {
    console.error("Error fetching brand stats:", error);
    return { totalReviews: 0, averageRating: 0, wishlists: 0 };
  }
};

export const useBrandStats = (brandId: string) => {
  return useQuery({
    queryKey: ['brand-stats', brandId],
    queryFn: () => fetchBrandStats(brandId),
    enabled: !!brandId,
  });
};
