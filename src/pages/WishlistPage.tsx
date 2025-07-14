import React, { useMemo } from 'react';
import { useUserLists } from '@/hooks/useUserLists';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/dashboard/user/ProductCard';

export default function WishlistPage() {
  const { data: lists = [], isLoading: listsLoading } = useUserLists();
  const wishlist = lists.find(l => l.name === 'Wishlist');
  const productIds = wishlist?.product_ids || [];

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['wishlist-products', productIds],
    queryFn: async () => {
      if (!productIds.length) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!productIds.length,
  });

  if (listsLoading || productsLoading) {
    return <div className="p-8 text-center">Loading wishlist...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      {products.length === 0 ? (
        <div className="text-muted-foreground">No items in your wishlist yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
} 