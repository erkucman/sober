
import React from 'react';
import { useFeaturedBrands } from '@/hooks/useBrands';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

export function FeaturedBrands() {
  const { data: brands, isLoading, isError } = useFeaturedBrands();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      );
    }

    if (isError) {
      return <p className="text-red-500 text-center">Error loading featured brands.</p>;
    }
    
    if (!brands || brands.length === 0) {
      return <p className="text-center text-muted-foreground">No featured brands yet.</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {brands.map((brand: any) => (
          <Link to={`/brands/${brand.id}`} key={brand.id}>
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader>
                <CardTitle>{brand.brand_name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{brand.description || 'No description available.'}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Featured Brands</CardTitle>
        <CardDescription>Discover brands we love</CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
