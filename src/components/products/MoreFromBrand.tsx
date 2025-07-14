
import React from 'react';
import { useProductsByBrand } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductCard } from '@/components/dashboard/user/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface MoreFromBrandProps {
  brandId: string;
  currentProductId: string;
  brandName?: string;
}

export function MoreFromBrand({ brandId, currentProductId, brandName }: MoreFromBrandProps) {
  const { data: products, isLoading } = useProductsByBrand(brandId);

  const otherProducts = products?.filter(p => p.id !== currentProductId && p.status === 'approved').slice(0, 4) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>More from {brandName || 'this brand'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (otherProducts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>More from {brandName || 'this brand'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {otherProducts.map((product: any) => (
            <Link to={`/product/${product.id}`} key={product.id} className="block hover:bg-gray-50 rounded-lg">
                <ProductCard product={product} />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
