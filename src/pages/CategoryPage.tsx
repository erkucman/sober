
import React from 'react';
import { useParams } from 'react-router-dom';
import { useProductsByCategory } from '@/hooks/useProducts';
import { ProductCard } from '@/components/dashboard/user/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { data: products, isLoading, isError } = useProductsByCategory(categoryName || '');

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (isError) {
      return <p className="text-red-500 text-center">Error loading products for this category.</p>;
    }
    
    if (!products || products.length === 0) {
      return <p className="text-center">No products found in this category.</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">{categoryName?.replace('-', ' ')}</h1>
      {renderContent()}
    </div>
  );
}
