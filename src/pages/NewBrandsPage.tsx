import React from 'react';
import { useNewBrands } from '@/hooks/useBrands';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function NewBrandsPage() {
  const { data: brands, isLoading, isError } = useNewBrands();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      );
    }

    if (isError) {
      return <p className="text-red-500 text-center">Error loading new brands.</p>;
    }
    
    if (!brands || brands.length === 0) {
      return <p className="text-center">No new brands in the last 14 days.</p>;
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
       <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Brands</h1>
        <div className="flex gap-4">
          <Link to="/brands" className="text-orange-600 hover:underline">
            All Brands
          </Link>
          <Link to="/brands/featured" className="text-orange-600 hover:underline">
            Featured Brands
          </Link>
        </div>
      </div>
      {renderContent()}
    </div>
  );
}
